# 第 13 章 测试与发布：最后一公里

**本章目标**：读完本章，你将理解 iTranslate 的测试基础设施如何搭建——从 Vitest + jsdom + fake-indexeddb 的组合选型，到 9 个测试文件 70 个测试用例的覆盖策略。更重要的是，你会看到 Claude Code 在测试编写上的效率：测试代码是结构化的 Arrange/Act/Assert 模式，正是 AI 最擅长生成的代码类型。最后，你会了解从构建到上架的完整发布流程。

**预计字数**：约4000字

**状态**：✅ 初稿完成

## 13.1 用 CC 补测试用例

### 测试基础设施

iTranslate 选用的测试套件是 Vitest，配置非常简单。`vitest.config.ts` 只有 9 行：

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
    setupFiles: ['src/__tests__/setup.ts'],
  },
});
```

四个关键决策：

**jsdom 作为测试环境。** 扩展的 content script 操作 DOM——提取节点、克隆元素、注入翻译。这些逻辑无法在纯 Node 环境中测试，需要一个模拟浏览器 DOM API 的环境。jsdom 提供了 `document.createElement`、`innerHTML`、`querySelector` 等完整的 DOM API，足够覆盖提取器和渲染器的测试需求。

**fake-indexeddb 自动注入。** 翻译缓存使用 IndexedDB（通过 `idb` 库封装），而 jsdom 不实现 IndexedDB。`fake-indexeddb/auto` 在 `setup.ts` 中全局引入，无需每个测试文件单独配置。import 之后，`indexedDB.open()` 就有一个完整的内存实现可用。

**`offsetParent` mock 是必需品。** 这是 jsdom 最有名的一个坑——它没有布局引擎，所有元素的 `offsetParent` 属性始终返回 `null`。而 iTranslate 的提取器通过 `offsetParent === null` 判断一个元素是否被 CSS 隐藏（`display: none` 元素的 offsetParent 为 null）。在 jsdom 中不做 mock 的话，**所有元素都会被当作隐藏元素跳过**，提取器返回空数组，所有测试全挂。`setup.ts` 的做法是把 `offsetParent` 重写为 `return this.parentElement || this`——父元素存在则返回父元素，否则返回自身。虽然这会让 `display: none` 元素的检测在测试中失效（留给集成测试覆盖），但保证了绝大多数 DOM 操作场景的可用性。

**`vi.stubGlobal('chrome', {...})` 模拟浏览器扩展 API。** Chrome 扩展的 `chrome.storage`、`chrome.i18n` 等 API 在 jsdom 中不存在。每个测试文件按需 stub 自己用到的 API——storage 测试 stub 了 `chrome.storage.sync.get/set`，i18n 测试 stub 了 `chrome.i18n.getMessage/getUILanguage`，translator 测试在此基础上还 stub 了 `fetch`。所有 stub 都在模块 import 之前完成（用 `vi.stubGlobal` 而非 `vi.mock`），确保被测模块加载时拿到的就是 mock 版本的 API。

### 70 个用例的覆盖版图

9 个测试文件，70 个用例分布在五层：

**提取层（extractor + structured-filter，16 个用例）。** 测试文本块按块级祖先分组、同块内多元素合并、`<script>`/`<style>` 跳过、已翻译元素（`.itranslate-translation` class）去重。结构化过滤器测试标题豁免（H1-H6 短标题保留）、噪音模式过滤（时间戳、日期、纯数字、相对时间）、结构过滤（`nav`/`sidebar` 类名容器跳过）、祖先链上的翻译类检查。filter 测试使用纯 `RawSegment[]` 构造输入，不依赖 DOM——这是好的单元测试习惯。

**渲染层（renderer，10 个用例）。** 两阶段渲染流程的完整测试：`renderPlaceholders()` 注入三点跳动动画的占位克隆、`renderTranslations()` 替换占位符为真实译文、去重检查（重复调用不产生重复克隆）、原元素保持不变。特别值得注意的测试：克隆元素继承原始元素 class 和 data 属性的验证——渲染器使用 `cloneNode(false)` 浅克隆，这个测试确保了类名和属性不会丢失。

**存储层（cache + storage，7 个用例）。** IndexedDB 缓存的完整 CRUD 流程：存一条查一条、批量存取、清空全部。Storage 测试覆盖默认值合并（新增字段对老用户自动获得默认值）和向后兼容（旧版 settings 对象不含新字段时 `getSettings()` 不会崩溃）。

**语言检测层（lang-detect + i18n，16 个用例）。** BCP 47 标签到语言名的映射（zh-CN/zh-TW/en-US/ja/ko/fr/de 全覆盖）、null 和空输入处理、大小写不敏感。基于文本内容的 Unicode 脚本检测：CJK 字符判断中文、假名字符判断日文、谚文字符判断韩文、纯拉丁文本返回 null。i18n 测试覆盖 UI 语言检测（zh-CN/zh-TW/zh → zh_CN，en-US/en-GB → en，不支持的语言 → en 回退）和 `t()` 函数（已知 key、缺失 key 回退显示 key 自身、单占位符 `$1` 替换、多占位符数组替换）。

**翻译引擎层（translator，3 个用例）。** 验证批量翻译的 API 调用次数、分段策略（50 条长文本按 token 估算自动拆成 2 批）、API key 缺失时抛出明确错误。

**交互层（selection，8 个用例）。** 划词翻译的完整生命周期：mouseup 创建小球、无选区不创建小球、选区被清除后小球仍保留（因为浏览器可能在鼠标接近小球时清除选区）、用户点击别处后小球移除。气泡位置计算：下方默认、底部溢出翻到上方、左边界 clamp。这些测试依赖 `Range.prototype.getBoundingClientRect` 的 mock——jsdom 同样不实现该方法。

### 用 CC 写测试的典型流程

测试代码是 AI 辅助编程中最容易拿到"一次就过"体验的场景。原因很简单：**测试有固定的三段式结构**：Arrange（准备数据）→ Act（执行被测函数）→ Assert（断言结果）。这种结构化的模式非常适合 AI 生成。

实际流程只需要三步：

**第一步，描述被测模块。** 把你的需求告诉 CC：

> "这是一个 DOM 文本提取器，输入 body 元素，遍历所有文本节点，按块级祖先（P/DIV/LI/H1-H6）分组，输出 RawSegment 数组。请基于这个函数的文档注释写 6 个测试用例。"

CC 不会凭空知道你函数的输入输出类型，但它能从你的代码注释和相关文件中推断出结构和边界条件。

**第二步，运行看结果。** `npx vitest run` —— 6 个用例中大概 3 个直接通过，2 个因为 mock 不完整需要调整，1 个因为理解偏差需要重写。

**第三步，把失败信息丢回给 CC。** 不要自己分析报错然后手动改测试代码——把 vitest 的命令行输出直接贴给 CC：

> "extractor 测试第三条失败了：'expected [] to have length 3'。input 是三个 <span> 在一个 <div> 里，但 extractSegments 返回了空数组。请分析原因并修复测试。"

CC 会检查提取器的过滤逻辑，发现这三个 `<span>` 的文本太短被 `structured-filter` 的噪音过滤拦截了，然后调整测试数据——把 `"Open"` 改成 `"Open the door and walk outside"`，或者调整 filter 配置。你只需要验证修复后的测试是否符合你的预期。

为什么这比手写测试高效？不是因为 AI 比你聪明——是因为**测试代码的信息密度低但结构要求高**。一个 10 行的测试用例，真正有信息量的只有 3 行（输入值、预期输出），剩下 7 行是 `describe`、`it`、`beforeEach`、`expect` 这些结构骨架。写测试的大部分时间花在搭架子上，而 AI 擅长搭架子。你把精力集中在"测什么"而不是"怎么写"上。

### 测试不是一次性的事

一个常见误区是把测试当成"代码写完了补一下"的事后工作。iTranslate 的开发过程中，功能变更频繁发生——过滤器从简单字符数阈值升级为结构化过滤，提取器增加了 `itranslate-translation` 的祖先链检查，词典模式新增了 JSON 解析失败时的 fallback 逻辑。每次改完代码，跑一遍测试套件（70 个用例 4.86 秒跑完），哪个模块被意外影响了立刻知道。**测试的价值不在写的那一瞬间，而在每次改代码后按下回车的那一瞬间。**

---

## 13.2 构建与版本管理

### 两条构建命令的分工

iTranslate 有两条构建命令，分别服务于不同的场景：

**`npm run build`：日常调试的快速通道。** 它做了三件事：`tsc` 类型检查（先确保 TypeScript 没有类型错误）、`vite build` 主构建（popup/settings/background/service worker 打包到 `dist/`）、`vite build --config vite.content.config.ts` 独立构建（将 content script 打包为 IIFE 格式输出到 `dist/assets/content.js`）。整个过程不改变 `package.json` 的版本号，想跑几次跑几次。

注意 content script 为什么需要独立构建。Manifest V3 的内容脚本注入是通过 `chrome.scripting.executeScript({ files: ['assets/content.js'] })` 实现的——它只接受单文件 JS，不支持 ESM 的 `import` 语句。普通 Vite 构建输出的是 ES module 格式，直接注入会报错。`vite.content.config.ts` 单独将 content script 打包成 IIFE（立即调用函数表达式），所有依赖（`extractor.ts`、`renderer.ts`、`selection.ts` 等）内联到一个文件中，注入后立即执行。

**`npm run release`：发布用的一键流水线。** 它执行三步：`npm run bump`（将 `package.json` 的 z 版本号加 1，如 1.2.13 → 1.2.14）→ `npm run build`（完整构建）→ `node scripts/package-zip.cjs`（将 `dist/` 目录打成 `iTranslate-vX.Y.Z.zip`）。跑完这一条命令，你就得到一个可以直接上传到 Chrome Web Store 的 zip 包。

### 版本号唯一源

版本号管理有一个容易犯的错误：多处定义同一个版本号，改了一个忘了另一个，导致 manifest 声明和实际打包不一致。

iTranslate 的做法是把 `package.json` 作为唯一的版本源。`manifest.json` 里的版本号写的是占位符 `0.0.0`，真实版本在构建时由 `@crxjs/vite-plugin` 从 `vite.config.ts` 中注入。`vite.config.ts` 读取 `package.json` 的 `version` 字段，覆盖 manifest 的占位符。三处版本号（`package.json` + 构建后的 `manifest.json` + zip 文件名）始终一致，手动改版本号只需要改 `package.json` 一处。

日常调试用 `npm run build` 不改变版本号。升 minor（y+1）或 major（x+1）时手动运行 `npm version minor` 或 `npm version major`，后续 `npm run release` 时 z 继续从 0 开始累加。

---

## 13.3 Chrome Web Store 上架

### 准备材料清单

Chrome Web Store 上架需要的材料分三类：

**商店截图（至少 1 张，1280x800 或 640x400）。** 截图展示了用户打开扩展后看到的界面。iTranslate 准备了 5 张截图：popup 主界面、设置页面、翻译结果效果、划词翻译气泡、工具栏按钮状态切换。每张截图覆盖一个核心功能点，审核员和用户都能一眼了解这个扩展能做什么。

**宣传图片（可选但建议准备）。** 小图 440x280（搜索结果页展示）、大图 920x680（商品详情页顶部）、Marquee 1400x560（精选推广位）。这些图片不是截图——是带品牌元素的宣传图，包含 logo、核心卖点文字、装饰性背景。不是必需项，但有宣传图片的扩展在商店里看起来更专业。

**应用描述（多语言）。** Chrome Web Store 支持多语言描述。iTranslate 目前只有中英文双语，但商店描述需要覆盖扩展名、简短描述（132 字符以内）、详细描述（支持基本 HTML 格式）。注意：**应用描述必须与 `_locales/` 中的 `extName` 和 `extDescription` 保持一致**，否则商店显示和扩展内显示会打架。

**隐私政策链接。** 如果你处理用户数据——iTranslate 的 API key 和翻译内容理论上是敏感数据——就需要提供隐私政策链接。即使你只是把数据存在用户本地（IndexedDB），Chrome 也建议你声明。

### 权限说明是最关键的审核点

Chrome Web Store 的审核不是走形式。审核员会检查你的 `manifest.json` 中声明的权限和你的实际功能是否匹配。如果你申请了 `tabs` 权限但你的扩展只是个翻译工具，审核员会问："你要 tabs 权限干什么？"回答不上来就打回。

iTranslate 的权限策略在第 6 章就埋下了伏笔——只申请了 `storage`、`activeTab`、`scripting` 三项，没有 `host_permissions`。`storage` 用于保存用户设置；`activeTab` 用于获取当前标签页的 URL 和注入脚本；`scripting` 用于按需注入 content script。三项权限每一项都有明确的业务用途，没有一个是"万一以后用到先申请着"的心态。

特别说明 `host_permissions` 的缺失。大多数网页翻译扩展需要声明 `<all_urls>` 或者 `*://*/*` 的 host permissions，以在所有页面上自动注入 content script。iTranslate 不用——它通过 Popup 按需注入（`activeTab` + `scripting.executeScript`），用户点击工具栏图标时才注入，不点就不注入。这是一个架构决策在发布阶段结出的果实：**审核员看到你的权限列表能一眼理解你的扩展在做什么，审核就容易过。** 最终 iTranslate 的商店审核一次过，没有被打回要求补充说明。

### 防止差评的一个实战教训

商店文案有一个血的教训：**首页必须显著标注"需自备 API Key"。**

iTranslate 最早的商店描述中没有明确提到这一点，结果用户下载后发现翻译不能用，以为扩展功能坏了，直接打了一星差评。问题是——你没法在差评下回复解释"你需要自己注册 DeepSeek 账号拿到 API key 填进去"，用户打了差评就走了。后来在短描述的第一句加上"需自备 DeepSeek/OpenAI API Key"，详细描述的开头再用加粗文字强调一遍，差评率大幅下降。

这是一个典型的"技术人思维"和"用户思维"的差异。对你来说，"调用 AI API 当然需要 API key"是天经地义的常识。但对用户来说，"我下载了一个翻译扩展，它应该能翻译"是再自然不过的预期。你的常识不是用户的常识。商店文案是唯一在用户下载前就能澄清预期的机会——用足它。

### 版本更新流程

发布之后的版本更新是简单循环：`npm run release`（版本号 z+1，构建，打包）→ 在 [Chrome Web Store 开发者后台](https://chrome.google.com/webstore/devconsole) 上传新 zip → 提交审核。审核通常 1-3 个工作日。GitHub 和 Gitee 两个 Release 页面同步更新，提供 zip 下载链接供手动安装的用户使用。

---

## 13.4 实战复盘：补测试用例

以下是补 structured-filter 测试时的一段真实对话：

```
[我的 Prompt]
> 这是 structured-filter 模块的代码。请为它写单元测试，覆盖：
> 1. 标题豁免——H1-H6 再短也保留
> 2. 噪音过滤——时间戳、日期、纯数字、相对时间表达
> 3. 结构过滤——nav/sidebar 等类名容器内的内容跳过
> 4. 祖先链 itranslate-translation 检查
> 5. 空数组边界
> 使用 RawSegment[] 构造输入，不依赖真实 DOM。

[Claude Code 的回复]
我分析了 structured-filter 的代码，编写了以下测试：

describe('structured-filter', () => {
  it('保留短标题（H2 8字符）', () => {
    const result = structuredFilter.filter([
      makeSeg('Overview', true),
      makeSeg('Machine learning is transforming ...', false),
    ]);
    expect(result.kept).toHaveLength(2);
  });

  it('过滤噪音模式（时间戳、日期、纯数字、相对时间）', () => {
    const result = structuredFilter.filter([
      makeSeg('00:14', false),
      makeSeg('20-May-2026', false),
      makeSeg('12345', false),
      makeSeg('3 hours ago', false),
      makeSeg('Real article content ...', false),
    ]);
    expect(result.kept).toHaveLength(1);
    expect(result.skipped.filter(r => r.reason === 'noise-pattern')).toHaveLength(4);
  });

  it('结构过滤：导航/侧栏类名容器', () => {
    const result = structuredFilter.filter([
      makeSegWithClass('Home Navigation', 'nav'),
      makeSegWithClass('Related Links', 'sidebar'),
      makeSeg('Main content text ...', false),
    ]);
    expect(result.kept).toHaveLength(1);
  });

  // ... 持续输出更多用例
```

```
[为什么这样问]
💡 关键指令："使用 RawSegment[] 构造输入，不依赖真实 DOM。"这是一个门槛极高的测试习惯——绝大多数开发者的第一直觉是 `document.body.innerHTML = '...'` 然后调 extractor。但 filter 的职责是"接收 segments 数组，返回 kept/skipped"，它的输入不要求是 DOM。绕过 DOM 直接用数据构造，测试速度更快（不需要 jsdom 解析 HTML），也更聚焦——你测的是 filter 逻辑本身，不是 DOM 解析。CC 默认会用 DOM 构造，你必须明确指出你用数据构造才有效。
```

---

## 13.5 核心技巧

- **测试 stub 必须在 import 之前**。`vi.stubGlobal('chrome', {...})` 必须在 `await import('../module')` 之前执行，否则模块加载时拿到的是 undefined 而非 mock。i18n 和 storage 测试都采用"在顶层 stub → 在 `it` 内动态 import"的模式。

- **测试文件放在被测模块旁边，不要集中在根目录**。`src/content/__tests__/` 和 `src/background/__tests__/` 的目录结构让测试和源码的距离最短。当你修改一个模块时，测试文件就在同级目录下，不需要跨目录查找。

- **让 CI 帮你跑测试，但你必须在 push 之前自己跑一遍**。"等 CI 报错再修"的效率远低于本地 `npm test` 只花 5 秒。`vitest run` 的输出可读性极高——哪个文件、哪个 describe、哪个 it 失败、期望值和实际值对比，所有信息都在。

- **版本号唯一源是纪律，不是技术**。`package.json` → `vite.config.ts` → `manifest.json` 的注入链是单向的。不要手痒手动改 `manifest.json` 的版本号——改完第二天你自己都忘了，构建出来的包版本对不上。

- **商店文案写的是用户预期，不是技术事实**。"基于大语言模型的智能翻译扩展"不如"选中即译，支持中英日韩"管用。你在写应用描述，不是在写论文摘要。

---

## 13.6 小结

**本章要点：**
- Vitest + jsdom + fake-indexeddb 构成了前端扩展的完整测试三角。`setup.ts` 中 `offsetParent` 的 mock 是避免 jsdom 布局陷阱的关键。
- 70 个测试用例覆盖了提取、过滤、渲染、缓存、存储、语言检测、国际化、翻译引擎、划词交互九个维度。测试不是事后补的，是每次改代码后的安全网。
- 用 CC 写测试的效率优势来自测试的结构化本质——Arrange/Act/Assert 三段式正是 AI 最擅长生成的代码模式。
- `npm run build`（不改版本号，日常调试）和 `npm run release`（z+1，构建，打包）两条命令各司其职。`package.json` 是唯一版本源。
- Chrome Web Store 上架的关键在权限说明——iTranslate 的"按需注入"架构在这个阶段得到了回报：三项权限，没有因为权限问题被退回。
- 商店文案需显著标注"自备 API Key"——这是用差评换来的教训。

---

### Part 2 回顾：iTranslate 的诞生

从第 5 章到今天，我们完整走完了一个 Chrome 扩展从 0 到 1 的全过程。

**第 5 章**，"我想做一个翻译扩展"变成了三页结构化 Spec。**第 6 章**，Vite + crxjs 搭起了 Manifest V3 骨架，四个隔离上下文在第一天就确定了边界。**第 7 章**，一份 20 行的 System Prompt 替代了 Google Translate API，翻译质量反而更好——因为你控制了目标语言、输出格式、以及不该翻什么。**第 8 章**，块级克隆 + afterend 插入的 DOM 策略让原文和译文在同一布局流中共存，MutationObserver 兜底监控动态内容。**第 9 章**，Popup 的 `ensureContentScript()` 按需注入让权限声明最小化，消息总线的 `sender.tab.id` 过滤避免了跨标签污染。**第 10 章**，划词翻译的 12px 小球、1 秒悬停动画、气泡拖拽——每一步都是"用户选中文字后应该发生什么"的逐帧推演。**第 11 章**，词典功能展示了 AI 编程中最关键的 Prompt Engineering 技能：结构化输出，让模型的自由文本变成可解析的 JSON。**第 12 章**，34 个 CSS 变量在四个隔离运行环境中统一分发，极地冰川主题从主色到阴影到动画缓动——人定审美方向，AI 执行实现。

**第 13 章在本章。** 70 个测试用例，两条构建命令，一次商店审核——产品不是写完最后一行代码就算完成的。测试、构建、发布，这三件事加起来才把代码变成了能交到用户手里的产品。

这个产品没有动用任何"高级"技术。没有微服务、没有 CI/CD 管线、没有 Kubernetes、没有自动化部署。它就是在浏览器里跑的几个 TypeScript 文件，加一个 ChatGPT 兼容的 API 调用。但就是这几个文件，解决了一个真实的问题：**用一种比 Google Translate 更聪明的方式，在网页上直接显示双语翻译。**

Claude Code 在这里面的角色是什么？它不是一个"代码生成器"——你告诉它需求，它吐出完整文件，你复制粘贴。它是坐在你旁边的结对程序员：你描述业务逻辑，它写成代码；你看着效果说不对，它马上改；你跑测试挂了，它读报错修复；你拿不准怎么设计，它列出三个方案的利弊让你选。**生产力不是来自 AI 替你写代码，而是来自 AI 消除了"想法到手"之间的摩擦。**

---

### 接下来：Part 3 方法论

现在你看到了一个产品的完整诞生过程。从立项到发布，9 个章节，一个真实的 Manifest V3 Chrome 扩展。但一本书如果止步于"我做了一个扩展，你看我是怎么做的"，它就只是一份项目日志。

Part 3 的目标是从具体项目中抽离出来，提炼**通用的方法论**。什么样的 Prompt 是好的 Prompt？面对一个复杂的重构任务，怎么分解步骤？一个项目里同时用 DeepSeek、Claude、GPT 三种模型，各自的优势怎么组合？一个 AI 辅助编程项目会踩哪些坑、怎么提前避开？

这些不是你读完第 5-13 章就能自动领悟的东西。它们需要被单独拿出来说清楚。Part 3 就是为了这个。
