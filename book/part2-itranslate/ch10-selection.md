# 第 10 章 划词翻译：事件处理

**本章目标**：读完本章，你将理解 iTranslate 划词翻译功能的完整交互链路——从用户在页面上选中文字，到小球出现、悬停膨胀、气泡弹出、翻译结果渲染，再到拖拽、关闭、模式自动判断。你会掌握 browser 事件处理中的几个关键设计决策：为什么用闭包而不是 `getSelection()`、为什么用 JS 驱动动画而不是 CSS `:hover`、为什么不用 drag API 做拖拽。

**预计字数**：约5000字

**状态**：✅ 初稿完成

## 10.1 划词翻译的用户体验

第 8 章讲的页面翻译是"批量操作"——用户点一下按钮，整个页面的英文全部变成双语对照。划词翻译走的是完全不同的路径：**用户主动选择一段文字，只翻译这一小段**。

完整交互流程如下：

**第一步，选中文字。** 用户在页面上用鼠标划选一段文字，松开鼠标左键。这是触发整个流程的唯一入口——没有按钮、没有快捷键、没有右键菜单，只有 `mouseup` 事件。选中的可以是段落中的一句话，也可以是一个不认识的单词，甚至可以选中跨段落的多个自然段。

**第二步，小球出现。** 松开鼠标后约 300ms（防抖延迟后），选区右上角外侧 2px 处出现一个直径 12px 的冰川蓝小圆点。这个小球极其克制——12px 的尺寸在正文旁边几乎不会遮挡阅读视线，`opacity: 0.85` 进一步降低了视觉侵略性。它不弹窗、不闪烁、不发出任何通知，只是安静地站在那里，像一个"翻译服务在此，你需要我吗？"的提示。

**第三步，悬停展开。** 用户把鼠标移到小球上，停留 1 秒。小球向上弹跳 12px 同时膨胀到 2 倍大小，伴随着光环扩散的效果，`::after` 伪元素显示出"译"字标签。1 秒后，气泡弹出——380px 宽的翻译面板出现在选区下方，包含原文、进度指示器、复制和关闭按钮。翻译请求在气泡弹出后立即发出。

**第四步，自由操作。** 气泡不是固定在选区位置的——用户可以用鼠标拖动渐变顶条或 header 区域（共 28px 热区）把气泡拖到页面任意位置。翻译完成后，可以点"复制"按钮把译文复制到剪贴板（按钮文字短暂变成"已复制"1.5 秒后恢复），也可以点正圆形 × 按钮关闭气泡。

**第五步，随时退出。** 三种方式关闭气泡：点 × 按钮、按 Esc 键、滚动页面。划词翻译**每个页面默认关闭**，需要用户通过 Popup 中的开关手动开启，关闭标签页或刷新页面后开关自动重置。

这个流程的设计哲学可以概括为三个词：**不打扰、有节制、可控制**。小球很小，不遮挡正文——不打扰阅读。悬停 1 秒才展开——用户有时间决定要还是不要，不会误触。气泡可拖拽、可关闭、可复制——展开后用户有完整的控制权。划词翻译在整个 iTranslate 中是交互最重、也是最考验"手感"的部分。

---

## 10.2 选区检测与定位

划词翻译的入口是一个看似简单的 `mouseup` 事件，但要让它在所有页面、所有场景下都能正确工作，需要处理一系列边界情况。

**mouseup + 300ms 防抖**

`enableSelection()` 注册的是 `document.addEventListener('mouseup', onMouseUp)`，不是 `click`、不是 `dblclick`、不是 `selectionchange`。为什么是 `mouseup`？因为 `click` 在文本选择时不一定会触发（浏览器行为不一致），`selectionchange` 在拖动选区的过程中会连续触发数十次。`mouseup` 是最准确的"用户完成了选择动作"的信号。

但 `mouseup` 本身过于敏感——用户在页面上做任何点击都会触发。`onMouseUp` 做了一件事：用 `setTimeout(..., 0)` 把实际逻辑推迟到下一个事件循环。这一行的效果等价于 0ms 防抖——`setTimeout` 把回调放到宏任务队列，确保在浏览器完成了选区绘制之后才读取 `getSelection()`。如果浏览器还没完成选区渲染就取 `getBoundingClientRect()`，拿到的可能是旧的矩形数据或空矩形。

**`isValidSelection()` 的三层检查**

```typescript
function isValidSelection(): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const text = sel.toString().trim();
  return text.length > 0;
}
```

第一层：`getSelection()` 可能返回 `null`（极少见但存在），直接拒绝。第二层：`rangeCount === 0` 表示没有有效的选区范围，浏览器可能在页面加载完成前或焦点丢失后进入这个状态。第三层：`toString().trim()` 去空白后长度为零——用户可能选中了一堆空格或换行，这种"空选"不应触发翻译。

`isValidSelection()` **不做**的是：不判断选区内是否有输入框。这一点在后面会提到——`onMouseUp` 中通过 `currentBubble?.contains(e.target)` 来跳过气泡内部的点击，但输入框内的选区仍然会触发小球。这种"不拦截"是有意为之——用户在输入框中选中一段英文后，也应该能翻译。

**`getBoundingClientRect()` 获取选区矩形**

选区通过后，调用 `sel.getRangeAt(0).getBoundingClientRect()` 获取选区的视口相对矩形。这个矩形的 `top`、`bottom`、`left`、`right` 是 `position: fixed` 定位的坐标基础。注意这里取的是 `Range` 的矩形（包含选区的所有行），不是文本片段或单个字符的矩形——多行选区的矩形可能覆盖整段区域。

**`positionBall()` 的四方向翻转逻辑**

小球的默认位置是**选区右上角外侧 2px**：

```typescript
let top = rect.top - BALL_SIZE - GAP;   // 选区顶部上方 14px（12px 球 + 2px 间隙）
let left = rect.right + GAP;             // 选区的右边缘 + 2px
```

但这个世界不总是理想的。如果选区靠近浏览器顶部边缘，小球会"飘"到视口外。如果选区紧贴右侧边缘，小球同样不可见。`positionBall()` 处理三个边界情况：

1. **顶部溢出**：如果 `top < GAP`（小球超出了视口顶端），翻到**选区下方**：`top = rect.bottom + GAP`。小球从"在文字上面"变成"在文字下面"。
2. **右侧溢出**：如果 `left + BALL_SIZE > window.innerWidth`（小球超出了右侧），翻到**选区左侧**：`left = rect.left - BALL_SIZE - GAP`。小球从文字的右边跑到左边。
3. **左边界 clamp**：如果翻转后 `left < GAP`（极少见，全宽选区可能出现），强制 clamp 到 2px。至少保证小球在屏幕内可见。

这个翻转逻辑虽然只处理了两个方向的溢出 + 一个兜底 clamp，但实践中覆盖了绝大多数选区位置——因为它总是在"一个方向溢出"的前提下翻到"对面的安全方向"，不会出现翻过去又溢出的情况。

**闭包捕获文字，防止浏览器清除选区**

这是整个划词翻译中最容易被忽视的设计：

```typescript
const text = sel.toString().trim();
const rect = sel.getRangeAt(0).getBoundingClientRect();
createBall(rect, text);  // text 作为参数传入闭包
```

`text` 和 `rect` 在 `mouseup` 的回调中一次性读取并传入 `createBall()`。为什么不在 `showBubble()` 中再次读取 `getSelection()`？因为从用户松开鼠标到悬停小球、再到 1 秒后气泡弹出的这整个过程中，用户在页面上做了其他操作（比如移动鼠标到小球上），浏览器会在用户点击页面其他位置或焦点转移时**自动清除选区**。如果你在 `showBubble()` 里再读 `getSelection().toString()`，得到的很可能是一个空字符串。

闭包捕获是应对"浏览器会自动清除选区"这个行为的标准做法。`createBall()` 的第二个参数 `text` 存入闭包，`showBubble()` 中使用的是闭包中捕获的值而非实时选区，保证了用户看到小球时选中了什么文字，翻译的就是什么文字。

---

## 10.3 小球动画

12px 的小球本身很简单——一个 `div`，`position: fixed`，`border-radius: 50%`，冰川蓝渐变背景加一层浅阴影。真正的精华在动画。

**初始态：克制**

小球在初始状态只有 12px 直径。没有文字、没有动画、没有任何视觉干扰。`data-label` 属性存了 i18n 文本（中文环境为"译"，英文环境为"Tr"），但 `::after` 伪元素的 `opacity: 0` 让文字不可见。用户看到的只有一个安静的蓝色小点。

**悬停态：1s 延迟 + JS 驱动动画**

当鼠标移到小球上，`mouseenter` 事件触发：

```typescript
ball.addEventListener('mouseenter', () => {
  if (ballHoverTimer) return;                 // 防重入
  ball.classList.add('animating');            // 立即开始动画
  ballHoverTimer = setTimeout(() => {
    ballHoverTimer = null;
    if (!currentBall) return;
    removeBall();
    showBubble(currentRect, text);            // 1s 后弹出气泡
  }, 1000);
});
```

两个关键设计：

**为什么用 JS `.animating` class 而不是 CSS `:hover`？** CSS `:hover` 有一个致命缺陷：鼠标必须在元素上，`:hover` 才生效。如果用户的鼠标在小球上轻微移动（1px 就够），`:hover` 会短暂移除再重新应用，CSS 动画从头开始播放——用户看到的是小球不断抽搐。JS `classList.add('animating')` 将动画状态与鼠标位置解耦——一旦加上，动画就独立运行，后续鼠标怎么移都不影响。防重入的 `ballHoverTimer` 检查也保证了不会因为鼠标微移而创建多个 timer。

**为什么用 1 秒延迟？** 分两种情况：如果用户把鼠标移到小球上是故意的（想翻译），1 秒够短，不会感到拖沓。如果用户是不小心碰到的（鼠标路过），1 秒足够让用户移开鼠标——只要在 1 秒内移开，`removeBall()` 清除 timer，气泡不会弹出。1 秒是"确认意图"和"响应速度"之间的平衡点。

**动画过程：向上弹跳 + 膨胀 + 光环**

CSS `@keyframes itranslate-ball-inflate` 定义了动画的视觉变化：

```css
@keyframes itranslate-ball-inflate {
  0%   { transform: translateY(0) scale(1);    box-shadow: 0 1px 4px ...; }
  100% { transform: translateY(-12px) scale(2); box-shadow: 0 0 0 10px ..., 0 4px 20px ...; }
}
```

三个要素协同工作：

- **`translateY(-12px)`**：小球向上弹跳 12px。这不是装饰——小球向上移动给下方腾出空间，气泡将出现在小球下方。如果小球原地不动，气泡弹出后会和小球重叠。
- **`scale(2)`**：小球从 12px 膨胀到 24px。"膨胀"比"变形"更能传达"正在展开"的语义——用户看到的不只是变大了，而是"这个点要变成一个面板了"。
- **`box-shadow` 光环扩散**：从初始的 `0 1px 4px` 隐约阴影，扩散为 `0 0 0 10px` 的 10px 光环（opacity 0.15）加 `0 4px 20px` 的 20px 外阴影（opacity 0.35）。光环在动画结束时已经扩散到最大值，给气泡弹出做视觉铺垫。

`::after` 伪元素通过 `attr(data-label)` 显示"译"字——文字在动画开始时 `opacity: 0`，`.animating` 触发后 `transition: opacity 0.3s` 淡入。8px 白色文字在膨胀后的 24px 小球中刚好居中可读。

**缓动曲线：`cubic-bezier(0.4, 0, 0.2, 1)`**

这个曲线是 Material Design 的"标准缓动"——快速启动、匀速减速、无回弹。`cubic-bezier(0.4, 0, 0.2, 1)` 的物理直觉是：重物被推了一下，惯性滑出、逐渐减速、精确到位。与之对比，CSS 默认的 `ease`（`0.25, 0.1, 0.25, 1`）启动更慢、中间有减速后又加速的"刹车感"。

缓动曲线的选择经历了四轮迭代：

- **v1**：CSS `:hover` + `scale(1.5)` + 默认 `ease`。鼠标微移就重启动画。
- **v2**：改成 JS `.animating` class，解决了重启问题，但 `scale(1.5)` 配合 `ease` 的"刹车感"显得僵硬。
- **v3**：加了 `translateY(-12px)` 向上弹跳，增加动感。但 `ease` 曲线让弹跳看起来像"弹了一下又落回去"。
- **v4**：换成 `cubic-bezier(0.4, 0, 0.2, 1)` 匀速减速。弹跳感消失，变成"平稳向上移动并膨胀"的自然流畅。

四次迭代，每次只改一两行 CSS，但手感从"能用"变成了"舒服"。这就是 UI 动画的本质——不是炫技，是消除用户潜意识里的"不对劲"。

---

## 10.4 气泡 UI

气泡是划词翻译的最终呈现载体。它不仅要展示翻译结果，还要支持拖拽移动、文本复制、碎片关闭——是一个微型的"翻译工作台"。

**视觉主题**

气泡的外观是极地冰川主题的浓缩版。米白渐变底色 `#FCFBF9 → #F5F3EF` 给人温暖但不耀眼的纸张质感。14px 的大圆角配合冰川蓝微边框（`rgba(107,174,207,0.12)`），边界清晰但不生硬。最顶部的 4px 渐变条（`#6BAECF → #94C8E0 → #B8D9EA`）是"冰川三色"的标识——用户看到这个渐变色条就知道这是 iTranslate 的面板。

气泡通过 `position: fixed` 定位在视口中，`z-index: 99998` 确保它在绝大多数页面内容之上。`all: initial` 重置所有继承样式，防止页面 CSS 污染气泡内部——这是注入 Content Script 时必须做的防御性措施。

**四层结构**

气泡内部是清晰的四层结构：

**第 1 层：bar（渐变顶条）**。高度 4px，冰川蓝三色渐变，`cursor: grab`。它不仅是对品牌的视觉提示，也是拖拽热区的下半部分——用户拖拽气泡时首先想到的就是"抓顶部"。

**第 2 层：header（品牌标识 + 拖拽手柄）**。高度 24px，左侧显示品牌名"通译"（冰川蓝 70% 透明度，11px，600 字重），右侧在词典模式下显示"词典"标签。整个 header 区域 `cursor: grab`，和 bar 叠加形成 28px 的拖拽热区。`cursor: grabbing` 在拖拽中切换，给用户拖拽中的触觉反馈。

**第 3 层：body（翻译内容）**。这是气泡的核心区域，`padding: 12px 16px`，`overflow-y: auto` 支持内容溢出时滚动。body 内分三个子区域：

原文区：12px 灰色文字（`color: #999`），`max-height: 58px`（约 3 行），溢出隐藏。如果内容超过 3 行（JS 端通过 `scrollHeight > clientHeight` 检测），添加 `.faded` class 激活底部渐变遮罩——从透明渐变到米白色，制造"内容还在下面但被折叠了"的视觉效果。

译文区：15px 深色文字（`var(--itranslate-text-translated)`），500 字重，1.6 行高。译文上方有 1px 冰川蓝分割线（`border-top: 1px solid rgba(107,174,207,0.12)`）与原文区域分隔。这个分割线不是装饰——它让用户一眼能区分"这是原文"和"这是翻译"。

进度指示器：翻译请求发出后、结果返回前，body 内显示 3 个跳动的圆点（第 8 章讲过的 `itranslate-dot` 动画），给用户"正在翻译"的即时反馈。翻译结果返回后移除。

**第 4 层：actions（操作按钮）**。`padding: 0 16px 12px`，flex 水平排列。复制按钮是胶囊形（`border-radius: 14px`，高度 28px），带 SVG 复制图标 + 文字，hover 时冰川蓝高亮。点击后调用 `navigator.clipboard.writeText()` 复制译文，按钮文字短暂变成"已复制"（冰川蓝文字 + 边框，1.5 秒后恢复）。关闭按钮是正圆形（`width: 28px; height: 28px; border-radius: 50%`），靠右对齐（`margin-left: auto`），显示 × 符号，hover 时微妙的冰川蓝背景高亮。圆形 vs 胶囊形的区分不是随意的——关闭是"操作"，复制是"动作"，不同的形状代表了不同的语义权重。

**拖拽实现：mousedown → mousemove → mouseup**

为什么不用浏览器的 Drag API（`dragstart` / `drag` / `dragend`）？Drag API 在 Chrome 扩展的 Content Script 环境中有两个已知问题：跨 iframe 的页面行为不一致（某些 iframe 会拦截 drag 事件），以及部分网站的自定义 drag 事件处理器会干扰。iTranslate 选择了最底层的方案——手动监听三个鼠标事件：

```typescript
// mousedown: 记录起始位置
dragState = { el: bubble, startX: e.clientX, startY: e.clientY,
              startLeft: bubble.offsetLeft, startTop: bubble.offsetTop };

// mousemove: 实时更新位置
dragState.el.style.left = `${startLeft + e.clientX - startX}px`;
dragState.el.style.top = `${startTop + e.clientY - startY}px`;

// mouseup: 释放
dragState = null;
```

手动实现的优势是完全可控——不依赖浏览器拖拽行为、不受页面 CSS 和事件干扰。代价是更多的代码，但 10 行逻辑换来的可靠性是值得的。

**气泡定位：`getBubblePosition()`**

气泡默认出现在选区下方，水平居中于选区。如果下方空间不足（`rect.bottom + 200px > window.innerHeight`），翻到选区上方。水平方向做边界 clamp。逻辑和 `positionBall()` 一脉相承——优先理想位置，溢出翻到对面，最后 clamp 保底。

---

## 10.5 词典 vs 翻译自动判断

用户在页面上选中一个英文单词时，期望的不是逐字翻译，而是一个**词典释义**——音标、词性、多个义项。但你不可能让用户在 Popup 里手动选择"翻译模式"还是"词典模式"。对用户来说，"我选中了文字，不管是一个词还是一段话，都应该智能处理"。模式判断必须是全自动的。

**两步判断**

判断逻辑放在 `showBubble()` 中，只有一行：

```typescript
const mode = (isSingleWord(text) && isEnglishText(text)) ? 'dictionary' : 'translate';
```

`isSingleWord(text)` 做了最简单的事——`text.trim().split(/\s+/).length === 1`。按空白字符分割，长度等于 1 就是单个词。这不会误判中文短语，因为中文不需要空格分词。

`isEnglishText(text)` 用正则拒绝非拉丁文字：`!/[一-鿿぀-ゟ゠-ヿ가-힯]/.test(text)`。CJK 统一表意文字、平假名、片假名、谚文——四个 Unicode 范围覆盖了中、日、韩所有字符。如果选中的文本包含任何一个非拉丁字符，判定为"非英语文本"，走翻译模式。

两个条件同时满足时，`mode = 'dictionary'`。任何一项不满足，走翻译模式。

**Background 端的二次校验**

即使前端判定为词典模式，Background 的 `handleTranslate()` 还会再做一次安全校验：检查 sourceLang 是否为 English、targetLang 是否为 Chinese。如果用户的语言设置不是英→中（比如英→日），词典模式自动降级为翻译模式——因为词典 prompt 只针对英→中设计，中日、英日等语言对没有词典数据。

这个"前端乐观判断 + 后端兜底校验"的双层策略确保了：用户不需要理解"词典模式"和"翻译模式"的区别，系统在内部自动选择最优方案。即使判断失误，也有降级保证不会出错。

**词典结果的渲染差异**

词典结果和翻译结果在同一气泡中展示，但 body 内容结构完全不同。`renderDictionaryResult()` 解析 JSON 响应，构建：词条头（单词 + 音标 + 词性标签，词性标签用冰川蓝胶囊样式）→ 分割线 → 编号义项列表（第一条义项的序号和文字使用 `primary` 蓝色高亮变体，其余使用灰色变体）。JSON 解析失败时，整个词典结果降级为纯文本展示——但这种情况极少发生，因为 Background 的 `parseDictionaryResponse()` 已经有完善的容错处理。

---

## 10.6 实战复盘：小球动画迭代

小球动画的迭代是划词翻译中最典型的"描述视觉 → AI 实现 → 发现缺陷 → 迭代"案例。以下是一段精简重现的真实对话：

```
[我的 Prompt]
> 选文字后出现一个小圆点，悬停后放大，动画要丝滑。
> 位置在选区右上角。

[CC 实现 v1]
> 用了 CSS :hover + scale(1.5)。小球在选区右上角，
> hover 时 scale 放大。你试试效果。

[我测试]
> 鼠标在小球上稍微动一下动画就重启了，一直抖。
> 改成 JS 控制的 class 吧，加上去就别管鼠标怎么移。

[CC 实现 v2]
> 好的，改成 mouseenter 加 .animating class，CSS 动画
> 由 class 驱动，鼠标微移不会影响。另外加了
> translateY(-12px) 向上弹跳，增加一点动感。

[我测试]
> 重启问题解决了。但膨胀的感觉不太对——像弹了一下
> 又落回去，不是那种平稳展开的感觉。换个缓动函数试试。

[CC 实现 v3]
> 把 ease 换成了 cubic-bezier(0.4, 0, 0.2, 1)——
> 这是 Material Design 的标准缓动，快速启动、匀速减速、
> 无回弹。你再感受一下。

[我测试]
> 这个对了。平稳流畅，不像弹了一下。
> 动画时长 1s 合适不？会不会太慢？

[CC 回复]
> 1s 动画是动画本身的时长，setTimeout 的 1s 延迟是
> 悬停到弹出气泡的时间。两者其实没有直接联系——
> 动画在 1s 内完成，气泡在 1s 后弹出，刚好动画结束
> 时气泡出现。如果你觉得气泡弹出太慢可以改 setTimeout，
> 但动画 1s 是合适的——太短的动画看不出"展开"过程，
> 太长的动画让用户等得不耐烦。
```

```
[为什么这样问]
💡 视觉反馈的质量无法通过文字需求文档准确传达。"丝滑"、"流畅"、"舒服"
这些词对 AI 来说是抽象概念，对用户来说是直觉感受。AI 能写出功能正确的
动画代码，但"感觉对不对"只有你在浏览器里试了才知道。小球动画的四轮
迭代不是在修功能 bug——代码从头到尾都能跑——而是在调"手感"。UI
动画开发的核心方法论是：写出来 → 看效果 → 描述哪里不对 → 调整参数
→ 再看效果。这个循环 AI 可以帮你加速每一轮的代码变更，但"看效果"
这一步只能由你来做。
```

---

## 10.7 核心技巧

1. **`mouseup` + `setTimeout(0)` 是最小代价的选区同步方案**。一个 0ms 延迟让浏览器完成选区渲染后再读取，零成本杜绝了空矩形和过期坐标的 bug。

2. **闭包捕获选区的文字和位置，不要实时读 `getSelection()`**。浏览器会在焦点转移时自动清除选区，实时读取的结果不可靠。

3. **JS `.animating` class 代替 CSS `:hover` 驱动动画**。`:hover` 的"悬停状态"受鼠标微移干扰，JS class 一次性添加后动画独立运行——一行 `classList.add` 解决了 CSS 伪类无法解决的问题。

4. **手动实现拖拽比 Drag API 更可靠**。10 行 mousedown/mousemove/mouseup 代码，不依赖浏览器的拖拽行为，不触发页面可能注册的自定义 drag 处理器。简单、可控、兼容。

5. **模式自动判断做两层：前端乐观 + 后端兜底**。`isSingleWord()` + `isEnglishText()` 在 Content Script 判，Background 再校验语言对——前端大胆猜，后端保守兜。不需要用户手动选择模式，也保证猜错了有降级。

6. **`positionBall()` 和 `getBubblePosition()` 共享同一设计模式**：优先理想位置 → 单方向溢出翻到对面 → 保底 clamp。四方向翻转逻辑用三行 `if` 实现，覆盖了绝大多数场景。

---

## 10.8 小结

- **划词翻译遵循"不打扰、有节制、可控制"的设计哲学**：小球 12px 极小不遮挡正文，悬停 1s 才展开避免误触，气泡可拖拽/可复制/可随时关闭。
- **`mouseup` 是唯一的交互入口**：`setTimeout(0)` 防抖 + `isValidSelection()` 三层检查 + 闭包捕获文字防止浏览器清除选区——每一个细节都是为了一个目标：用户"松开鼠标"的那一刻，准确拿到选中的文字。
- **小球动画是 JS + CSS 的协作**：JS 负责状态管理（何时开始、何时结束），CSS 负责视觉表现（弹跳、膨胀、光环）。`.animating` class 解耦鼠标位置和动画状态，是解决 `:hover` 重启问题的关键。
- **气泡四层结构（bar/header/body/actions）各司其职**：bar + header 组成 28px 拖拽热区，body 展示原文折叠 + 译文 + 进度指示器，actions 提供复制和关闭。拖拽用手动 mousedown/mousemove/mouseup 实现，不用 Drag API，可靠性优先。
- **词典 vs 翻译全自动判断**：`isSingleWord()` + `isEnglishText()` 前端乐观判断，Background 语言对校验后端兜底。对用户透明——"选中即翻译"，不需要选择模式。
- **UI 动画调优靠"看效果说话"**：小球动画从 v1 到 v4 经历了四轮迭代，每一轮修的不是 bug，是手感。AI 负责写代码和改参数，你负责在浏览器里感受并对 AI 描述"哪里不对"。

> 下一章：第 11 章「词典功能：结构化输出」——如何用 Prompt 控制 JSON 输出格式、解析失败时的降级策略，以及从硬编码到可扩展架构的演进方向。
