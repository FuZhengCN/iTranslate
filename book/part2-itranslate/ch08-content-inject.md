# 第 8 章 内容注入：DOM 操作

**本章目标**：读完本章，你将理解 iTranslate 如何从任意网页中提取出需要翻译的文本块，经过两层过滤筛掉噪音，再把翻译结果精确地渲染回页面正确的位置。你会掌握 Content Script 按需注入的完整流程、extractor + filter 的双层过滤设计、两阶段渲染策略，以及 MutationObserver 如何在动态页面中保持翻译同步。

**预计字数**：约5500字

**状态**：✅ 初稿完成

## 8.1 内容脚本注入机制

在 Chrome 扩展的四个隔离上下文中，只有一个有权访问页面 DOM 并修改页面内容——Content Script。Background（Service Worker）没有 DOM 访问权限，Popup 只存在于工具栏弹窗中，Settings 是一个独立的选项页。如果你想把翻译结果渲染到用户正在看的网页上，只能通过 Content Script。

**声明式注入 vs 按需注入**

MV3 提供了两种注入 Content Script 的方式。第一种是声明式：在 `manifest.json` 中写 `content_scripts` 字段，指定匹配的 URL 模式，Chrome 会在满足条件的页面加载时自动注入脚本。这个方案简单，但有一个致命的代价——你必须在 manifest 中声明 `host_permissions`，告诉 Chrome 你需要在哪些网站上自动运行代码。用户安装扩展时会看到红色警告："此扩展可以读取和更改您在所有网站上的数据"。

CC 在脚手架阶段就采用了按需注入方案——这是和权限策略联动决策的。`manifest.json` 只声明了三项权限，Content Script 由 Popup 在用户点击翻译按钮时通过 `chrome.scripting.executeScript` 注入。第 6 章讲过这个权限策略的价值，这里来看它的实现细节。

**`ensureContentScript()` 的三步流程**

按需注入意味着 Popup 在每次发消息之前，必须先确认 Content Script 是否已经存在于当前页面中。`ensureContentScript(tabId)` 实现了这个确认逻辑，分三步走：

第一步，**ping 探测**。发送一条 `{ action: 'ping' }` 消息给指定标签页。如果 Content Script 已经在运行，它会响应这条消息，函数直接返回。这是最常见的情况——用户打开一个页面，点了翻译，翻译完成后继续浏览，再点撤销翻译。Content Script 一直常驻在页面中，ping 一次就过。

第二步，**按需注入**。如果 ping 失败（Content Script 不存在，或者扩展刚更新完脚本已过期），调用 `chrome.scripting.executeScript` 注入 `assets/content.js`。这个文件是在第 6 章讲过的 IIFE 格式构建产物——所有依赖内联在一个自执行函数中，因为 `executeScript` 不支持 ESM 的 `import`/`export` 语法。

第三步，**注入后重试确认**。脚本注入不代表监听器已经就绪——文件读取、脚本执行、`onMessage` 监听器注册之间存在竞态窗口。iTranslate 在注入后最多重试 5 次 ping（每次间隔 100ms），直到确认 Content Script 的消息监听器已经开始工作。5 次重试（500ms）足以覆盖绝大多数竞态场景。

这三步流程还隐藏了一个容错机制：`translateBtn` 的点击处理中，如果第一次 `sendMessage` 失败，会自动调用 `ensureContentScript` 重新注入后再重试。这意味着即使 Content Script 因扩展更新而过期，用户也不需要手动刷新页面——下一次点击翻译按钮时一切自动恢复。

---

## 8.2 DOM 提取策略

Content Script 入场之后的第一件事，是把页面上的文本内容提取出来。这听起来简单——遍历 DOM 取文本节点就行——但实际执行中充满了陷阱。导航栏里的菜单文字、页脚的版权信息、侧边栏的推荐列表、评论区的时间戳……这些都不是你想翻译的"正文"。

**`extractRawSegments()` 的核心逻辑**

CC 生成的提取器在 `src/content/extractor.ts`，它做的是"粗略筛选"而非精细判断。理解它的核心流程：

1. **遍历所有元素**：`root.querySelectorAll('*')` 遍历 body 下的每个元素。用 TreeWalker 也可以，但 `querySelectorAll` 的 NodeList 返回静态快照，不会受后续 DOM 变更影响，更安全。

2. **筛选有直接文本节点的元素**：`hasDirectText()` 检查元素是否包含非空白文本节点的直接子节点。注意是"直接"子节点——`<p><span>hello</span></p>` 中 `<span>` 有直接文本，但 `<p>` 没有。提取器收集的是叶子级文本容器，后续再按块级祖先归组。

3. **按块级祖先分组**：`findBlockAncestor()` 沿祖先链向上查找第一个块级元素（`P`、`DIV`、`LI`、`H1-H6`、`BLOCKQUOTE`、`SECTION` 等），相同块级祖先下的叶子文本合并成一个 `RawSegment`，用换行符连接。为什么按块级祖先分组？因为翻译后的结果是作为块级元素的兄弟节点插入的，块级是渲染的基本单元。

4. **产出 `RawSegment`**：每个 segment 包含 `id`、`text`、`blockElement`（块级祖先元素引用，后续渲染时依赖它定位插入位置）、`isHeading`（布尔值，标题享有豁免权）、`leafElements`（所有叶子元素引用，filter 层可能用它们进一步检查父链）。

**`isSkippable()` 的六层过滤**

提取器内置了一个六层的 `isSkippable()` 检查，在遍历阶段就拦截明显不该翻译的元素：

1. **`SKIP_TAGS`**：`script`、`style`、`noscript`、`svg`、`iframe`、`code`、`pre` 等 18 个标签——这些元素的文本要么是代码，要么是不可见的，翻译它们等于浪费 token。
2. **`SKIP_CLASS_NAMES`**：正则匹配 `header`、`footer`、`nav`、`sidebar`、`comment`、`menu`、`widget`、`ad`、`banner`、`social` 等 27 个关键词——类名命中了这些模式，大概率是页面结构而非正文。
3. **ARIA 角色**：`navigation`、`banner`、`complementary`、`contentinfo`——语义化的无障碍标记，和上一条目的相同。
4. **`hidden` / `aria-hidden` 属性**：标记为隐藏的元素，内容本就不对用户可见。
5. **`itranslate-translation` 类**：这是 iTranslate 自己的翻译克隆元素的标记类名。加上这个检查是血的教训——如果不排除自己渲染的翻译元素，第二次翻译时会把这些译文当原文再翻译一遍，形成"翻译的翻译"的套娃。`className.includes('itranslate-translation')` 一行代码避免了整个循环。
6. **CSS 隐藏元素**：`offsetParent === null` 检查。大多数 `display:none` 的元素会被这一步捕获。但有一个已知局限：`position:fixed` 和 `display:contents` 元素的 `offsetParent` 也返回 `null`，存在误判可能。不过实践中的影响很小——`position:fixed` 的元素通常是悬浮导航栏，本身就会被前面的 class 过滤拦截。

**叶子级最小字符数**

还有一个看似不起眼但很关键的规则：叶子级文本 ≤ 3 个字符的非标题元素直接丢弃。为什么是 3？"OK"、"Go"、"Yes" 这些确实短，但翻译它们没有意义——它们不是正文，而是 UI 碎片。如果因为字符数限制误杀了短标题怎么办？标题豁免——H1-H6 标签或其块级祖先为标题的元素，不受这个限制。

---

## 8.3 过滤层

extractor 的 `isSkippable()` 有一个结构性的盲区：它只检查元素自身的 class 和属性，不检查祖先链。一个 `<span class="byline">John Doe</span>` 会被 `SKIP_CLASS_NAMES` 中的 `byline` 拦截。但如果页面结构是 `<div class="sidebar"><p>John Doe</p></div>`，`<p>` 自身的 class 是空的，`isSkippable()` 只检查 `<p>` 自身，通过了。这就是为什么在 extractor 之后还需要一个 filter 层——filter 做"精细判断"，包括沿祖先链向上追溯。

**`SegmentFilter` 接口设计**

过滤层的入口在 `src/content/filters/`，核心是一个简洁的接口：

```typescript
interface SegmentFilter {
  readonly name: string;
  filter(segments: RawSegment[]): FilterResult;
}

interface FilterResult {
  kept: RawSegment[];
  skipped: SkippedRecord[];
}
```

任何模块只要实现这个接口，就能通过 `registerFilter()` 注册，然后由 `setActiveFilter()` 激活。iTranslate 内置了两个实现：`default-filter`（旧的 CJK/Latin 字符数阈值，兼容历史行为）和 `structured-filter`（当前的活跃过滤器）。第三方扩展也可以实现这个接口接入自己的过滤逻辑——接口只依赖 `RawSegment[]`，不需要 DOM 访问权限。

**`structured-filter` 的三层判断**

默认激活的 `structured-filter` 对每个 `RawSegment` 做三层判断，顺序很重要——效率优先，先做便宜检查：

1. **祖先链检查 — `hasSkippableAncestor()`**：从 `blockElement` 出发，沿 `parentElement` 一路向上，检查每个祖先节点的 tagName、className 和 id。一直走到 `document.documentElement`（`<html>`）不停，含 `<body>` 和 `<html>` 本身。这意味着如果页面顶层容器 class 命中了 skip 关键词（比如 `<html class="nav-page">`），整个页面的内容都会被静默过滤。这不是 bug 而是 trade-off——停下来（比如只走到 body）会漏掉某些包装结构的噪音；不停下来有极小概率误杀全页。iTranslate 选择了"宁可漏杀"的方向，实践中只有 whitehouse.gov 等极个别页面触发过这个问题。

2. **噪音模式 — `NOISE_PATTERNS`**：正则数组匹配纯数字、时间格式（`12:30`）、日期格式（`15-Jun-2024`）、相对时间（`3 hours ago`）等。这些文本在人看来有意义，但翻译没有价值——"3 hours ago"翻译成"3 小时前"放在页面上只会让读者困惑"这个时间戳是哪来的"。`isNoiseText()` 用 `some()` 短路匹配，匹配到一个就停。

3. **标题豁免**：`seg.isHeading` 为 true 的 segment 直接保留，不做任何字符数限制。这是对提取器中标题豁免的逻辑延续——标题无论多短都值得翻译。

**为什么 extractor 和 filter 要分两层？**

它们解决的是不同层次的问题。extractor 做的是"在遍历阶段就排除掉明显不是正文的元素"——减少传入 filter 的数据量。filter 做的是"对剩下的候选做精细判断"——祖先链追溯、噪音模式匹配。如果合在一起，extractor 会变得臃肿；如果只用 filter，遍历量太大。分层是职责分离，也是性能优化。

---

## 8.4 两阶段渲染

文本提取和过滤完成之后，下一步是把翻译结果渲染回页面。CC 实现的是**两阶段渲染**策略：先占位、再替换。这不是画蛇添足——在几十段文本同时请求翻译的批处理场景下，如果没有占位符，用户看到的是页面没有任何变化长达数秒，然后所有译文一起出现。占位符给出了即时反馈。

**阶段 1：`renderPlaceholders()`**

对每个 `sourceElement`（已过滤保留的块级祖先元素），执行以下操作：

1. **去重检查**：检查 `nextElementSibling` 是否已有 `itranslate-translation` 类——如果有，说明这个元素的翻译占位符或翻译结果已经存在，跳过。这防止了重复点击翻译按钮产生叠罗汉式的重复克隆。

2. **浅克隆**：`el.cloneNode(false)` 克隆块级元素，**不复制子节点**。翻译只需要块级容器的标签、class 和属性作为样式基础，不需要原内容的 DOM 结构。浅克隆避免了携带大量无用的子元素数据。

3. **清除隐藏样式**：把克隆元素上的 `display`、`visibility`、`overflow`、`maxHeight`、`minHeight` 内联样式清空。原始元素可能有 `display:none` 之类的样式（通过内联 style 或 CSS 类），不清空会导致占位符和后续翻译不可见。

4. **注入进度指示器**：克隆元素的 `innerHTML` 设为三个 `<span class="itranslate-dot">`，CSS 定义这三个圆点依次弹跳动画。进度条不是独立的浮层，而是作为克隆元素的子内容——这样它自然占据了和最终翻译相同的位置，布局不会在翻译完成后发生大的跳动。

5. **`insertAdjacentElement('afterend', clone)`**：将克隆元素插入到原始元素**之后**（作为下一个兄弟节点）。这就是 iTranslate 的双语对照效果的核心——原文在上，译文在下，不修改原文的 DOM 结构。

**阶段 2：`renderTranslations()`**

翻译结果返回后，第二步替换占位符：

1. **查找现有占位符**：通过 `nextElementSibling.classList.contains('itranslate-translation')` 找到阶段 1 插入的克隆元素。直接修改其 `textContent` 为翻译文本，移除 `itranslate-placeholder` 类（进度指示器动画停止），这比删除旧节点再创建新节点更高效。

2. **样式复制 — `applyTextStyles()`**：这是渲染质量的关键。如果翻译文本的样式和原文完全不一样，用户看到的会是一个格格不入的蓝色方块下面跟着一个黑色默认字体的译文，体验极差。`applyTextStyles()` 从原文元素的文本叶子节点（`findTextLeaf()` 选文本最长的后代以获取代表性样式）复制四项样式：`color`、`fontSize`、`fontWeight`、`lineHeight`。注意它**不复制 `fontFamily`**——译文统一用 `sans-serif`，这是 CSS 全局设定的，为了视觉统一性。

3. **重置高度约束**：移除克隆元素继承的 `max-height`、`min-height`、`overflow`、`-webkit-line-clamp`。原文可能通过 CSS 限制为 3 行截断，但翻译后的文本长度和原文不同（英文 3 行变成中文可能是 2 行或 4 行），必须允许译文自由扩展或收缩。

4. **白色文字处理**：如果原文颜色的 computed style 是 `rgb(255, 255, 255)`（白字深底），设置 `opacity: 1`。翻译克隆默认 `opacity: 0.85`，但白字降低透明度后在深色背景上会难以阅读。

**`removeTranslations()` — 撤销翻译**

一行代码完成：`document.querySelectorAll('.itranslate-translation').forEach(el => el.remove())`。所有翻译克隆元素都在这个 class 下，一次 `querySelectorAll` 全部清除。原文 DOM 从未被修改，所以撤销是真正干净的——删除克隆元素后，页面回到翻译前的原始状态。

---

## 8.5 MutationObserver 与追扫

静态页面翻译一次就完事了。但现代网页是动态的——无限滚动加载更多内容、SPA 路由切换、评论区实时更新、弹窗和折叠面板。如果翻译只做一次，新加载的内容就永远是原文。

CC 使用 `MutationObserver` 来监听 DOM 变更并触发增量翻译。它在 `src/content/observer.ts` 中生成的配置如下：

```typescript
observer.observe(root, {
  childList: true,        // 节点增加/删除
  subtree: true,          // 监听整个子树
  attributes: true,       // 属性变更
  attributeFilter: ['class', 'style'],  // 只关心 class 和 style
});
```

**属性监听的必要性**。只监听 `childList` 够吗？不够。很多页面不会添加/删除 DOM 节点来显示/隐藏内容——它们切换 CSS class（比如 `active`、`visible`、`expanded`）。之前被 `display:none` 隐藏的文本块，class 切换后变为可见，应该被翻译。监听 `class` 和 `style` 属性变更覆盖了这类场景。

**1000ms 防抖**。页面动态加载往往是"一波一波"的——一个 Ajax 请求回来，DOM 里同时插入了 20 个新节点。如果每次 mutation 都触发翻译，Observer 的回调会在几百毫秒内被调用几十次。1000ms 的防抖让这些密集变更合并为一次触发。

**翻译期间的三段式策略**

这是整个 Observer 设计中最精细的部分：

1. **翻译开始 → `stopObserving()`**：翻译过程本身会产生大量 DOM 变更——插入占位符、替换翻译文本。如果不先断开 Observer，翻译自己的 DOM 操作会触发 Observer 回调，回调又触发新的翻译——死循环。所以 `translatePage()` 的第一件事就是 `stopObserving()`。

2. **翻译完成 → `catchUpNewContent()` 追扫**：从断开 Observer 到翻译完成，这期间（可能长达数秒，取决于 API 响应速度）页面可能又加载了新内容。追扫函数重新执行 `extractSegments()`，然后过滤掉已经有翻译兄弟节点的 block（去重），只翻译真正的新内容。追扫是"尽力而为"的——失败了也不报错，只打日志。

3. **追扫完成 → `startObserving()` 重连**：Observer 重新挂载，继续监听后续的动态内容。重连时机在追扫之后，不在翻译完成之后——因为追扫本身也有 DOM 变更，提前重连会导致 Observer 把追扫的变更当作新内容再次触发回调。

**为什么不在 Observer 回调中直接做完整翻译？**

因为 Observer 的回调是"有动静就触发"。一个页面可能先加载了导航栏，再加载了侧边栏，再加载了正文——如果每次都跑完整的 `translatePage()`（提取+过滤+渲染），性能和翻译质量都会出问题。Observer 只负责通知"有新内容了"，实际操作由轻量的追扫函数完成——只提取和渲染增量。

---

## 8.6 实战复盘：CGTN 过滤逻辑调试

基于真实调试经历复盘：

```
[我的 Prompt]
> 测试发现 CGTN 新闻页面翻译时，页面底部的 "Related Articles" 区域
> 也被翻译了，但这部分明显不是正文。当前的 SKIP_CLASS_NAMES 里已经有
> "related" 关键词了，为什么没拦住？

[CC 的回复]
> 让我分析一下。extractor.ts 的 isSkippable() 只检查元素自身的 class。
> 如果 CGTN 的结构是：
>   <div class="related">         ← 最外层，class 含 "related"
>     <h3>Related Articles</h3>   ← 这个 h3 自身的 class 不含 "related"
>     <ul>...</ul>
>   </div>
> 那么 h3 和 li 元素自身 class 不含 "related"，通过 isSkippable()。
> 但它们的祖先 div 有 "related" class。
>
> 这正是我们在 structured-filter 中加了 hasSkippableAncestor()
> 的原因——extractor 层只检查自身，filter 层沿祖先链追溯补刀。
> 你可以确认一下 hasSkippableAncestor() 的日志输出，
> 看 h3 的 blockElement 是否真的经过了祖先检查。

[我查看日志]
> 确认了：extractor 阶段这些元素通过了 isSkippable()，
> 在 structured-filter 阶段被 hasSkippableAncestor() 拦截了，
> 日志显示 "hasSkippableAncestor SKIP: <div class="related...">
> is ancestor of <h3 text="Related Articles">"。
> 那为什么页面上还有翻译？是 catchUpNewContent 的锅吗？

[CC 的回复]
> 不是。检查一下你的测试流程。如果在页面加载完成后点了翻译，
> 然后 Observer 开着，页面触发了某个 DOM 变更（比如图片懒加载），
> Observer 的 catchUpNewContent 会重新提取并翻译新增内容。
> 但 catchUpNewContent 里用的是 extractSegments() → activeFilter，
> 理论上也应该被过滤。你确认一下是不是在其他标签页还开着旧版本的代码？
```

```
[为什么这样问]
💡 这段对话展示了调试过滤问题的标准思路：先确定问题是出在提取层（extractor）
还是过滤层（filter）。extractor 日志 📄 告诉你提取了几个 raw block，
filter 日志 ✅ 告诉你过滤后剩几个。如果 📄 阶段就有漏网的噪声，
问题在 extractor 的 isSkippable()；如果 📄 阶段通过了但 ✅ 阶段仍在，
问题在 filter 的 rules。日志标记约定（📄 for extractor, 🔎 for filter
祖先检查, 👁 for Observer）就是在这样的调试过程中逐步建立起来的——
没有这些标记，定位问题就只能靠猜。
```

---

## 8.7 核心技巧

1. **ping → inject → ping-again 三段式注入**：不要假设 `executeScript` 返回后 Content Script 就立即可用。注入后的重试确认（5 次/100ms）是应对竞态的最小代价保险。

2. **extractor 和 filter 分层，各司其职**：extractor 做粗筛（标签、类名、隐藏属性），filter 做细查（祖先链、噪音模式、标题豁免）。不要试图在 extractor 里解决所有过滤问题——祖先链追溯在 extractor 的遍历循环里做会很贵，放在 filter 里一次性处理更高效。

3. **预防"翻译的翻译"是底线**：`isSkippable()` 中检查 `itranslate-translation` 类名、`hasSkippableAncestor()` 中同样检查祖先链上的该类名。两个位置都要检查，因为 extractor 和 filter 都可能遇到翻译克隆元素。少一处，就会产生套娃翻译。

4. **占位符不仅是 UX，也是布局稳定器**：如果翻译结果和原文长度差异很大（比如英文短标题翻译成中文长标题），没有占位符的提前占位会导致翻译完成后页面布局跳动。浅克隆 + insertAdjacentElement('afterend') 确保翻译结果始终在正确位置。

5. **Observer 断开要主动，重连要谨慎**：翻译前断开 Observer（防止自触发循环），追扫完成后重连（确保后续动态内容被覆盖）。不要在翻译完成后立即重连——追扫的 DOM 操作会触发新一轮 Observer 回调。

6. **样式复制要有分寸**：复制 `color`、`fontSize`、`fontWeight`、`lineHeight` 四项，不复制 `fontFamily`（统一 sans-serif）。复制太多会让翻译看起来和原文混在一起无法区分，复制太少会让翻译像贴上去的膏药。四项是实践中找到的平衡点。

---

## 8.8 小结

- **Content Script 是按需注入的**：CC 实现了三步流程（ping → executeScript → 5 次重试确认），代价是实现复杂度，回报是审核友好的权限策略。
- **extractor 做粗筛，filter 做细查**：CC 生成的 `extractRawSegments()` 按块级祖先分组文本，`isSkippable()` 在遍历阶段拦截噪声；`structured-filter` 通过祖先链追溯做精细判断。两层分离是职责分明。
- **预防"翻译的翻译"**：`itranslate-translation` 类名检查必须同时出现在 extractor 和 filter 中，缺失任一环节都会导致套娃。CC 在生成代码时就加上了这些检查。
- **两阶段渲染：先占位、再替换**：`renderPlaceholders()` 浅克隆 + 进度指示器，`renderTranslations()` 替换文本 + 复制样式。原文 DOM 从不修改，撤销只需一行 `querySelectorAll`。
- **MutationObserver 的三段式策略**：断开 → 翻译 → 追扫 → 重连。1000ms 防抖，属性监听覆盖 CSS 类切换场景。CC 生成的 `observer.ts` 封装了这一整套逻辑。
- **过滤调试靠日志标记**：📄（extractor 产出）、🔎（filter 祖先检查）、👁（Observer 触发），这些标记是在调试过程中逐步建立起来的，帮助快速定位问题出在哪个环节。

> 下一章：第 9 章「交互层：Popup 与消息」——弹窗 UI、消息协议、以及四个上下文之间如何通过 `chrome.runtime.sendMessage` 协同工作。
