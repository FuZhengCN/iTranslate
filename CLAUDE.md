# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**语言要求：所有回复、解释、注释、说明使用简体中文，代码关键字/标识符保留英文。**
**铁律见全局 `~/.claude/CLAUDE.md`（6 条），本项目不再重复。**

## Build & Test Commands

```bash
npm install              # Install dependencies
npm run build            # tsc + vite build（不变更版本号，日常调试用）
npm run release          # bump(z+1) → build → 生成 zip（发布用）
npm run dev              # Vite dev server with HMR
npm test                 # Run all tests (vitest run)
npm run test:watch       # Run tests in watch mode (vitest)
npx vitest run --reporter=verbose  # Detailed output
npx vitest run src/content/__tests__/renderer.test.ts  # Run single test file
npx tsc --noEmit         # TypeScript check only (no emit)
```

`npm run build` 执行两步构建：crx 主构建 → `vite.content.config.ts` 将内容脚本构建为 IIFE 格式（`dist/assets/content.js`），供 `chrome.scripting.executeScript` 注入。**不改变版本号**。

`npm run release` 在 build 基础上自动递增构建号并生成 `iTranslate-vX.Y.Z.zip`，版本号从 `package.json` 读取，保证三者一致。

## Version Management

版本格式 `MAJOR.MINOR.BUILD`（x.y.z），`package.json` 为唯一版本源。

- **`npm run build`**：仅编译构建，**不改变版本号**（日常调试用）
- **`npm run release`**：bump(z+1) → build → 自动生成 `iTranslate-vX.Y.Z.zip`
- **`manifest.json` 版本号由 `vite.config.ts` 构建时注入**，源文件为占位符 `0.0.0`
- 升 y（minor）或 x（major）时手动运行 `npm version minor` / `npm version major`，后续 release 时 z 继续累加
- `npm run release` 完成后，需手动创建 GitHub / Gitee Release 并上传 zip：
  - GitHub：https://github.com/FuZhengCN/iTranslate/releases/new
  - Gitee：https://gitee.com/fuzheng0312/i-translate/releases/new

## Architecture

**Manifest V3 浏览器扩展**（Chrome/Edge），多语种双语翻译（默认英→中）。TypeScript 编写，Vite + `@crxjs/vite-plugin` 构建。

**权限策略：** `manifest.json` 仅声明 `storage`、`activeTab`、`scripting` 三项权限，无 `host_permissions`、无 `content_scripts`。内容脚本（`assets/content.js`）由 Popup 通过 `ensureContentScript()` 按需注入，遵守 Chrome Web Store 最小权限原则。

**扩展加载方式：**
- 开发：`npm run dev` 启动 Vite dev server，Chrome 加载**源码目录**（项目根目录，非 `dist/`）
- 生产：`npm run build`，Chrome 加载 `dist/` 目录

**国际化（i18n）：** 支持简体中文/英文双语，根据 `navigator.language` 自动选择。翻译文件 `_locales/{en,zh_CN}/messages.json`（各 36 条）。JS 通过 `src/shared/i18n.ts` 的 `t()` 函数获取文本。**注意：HTML 中不能使用 `__MSG_*__` 占位符**（Vite/Crxjs dev server 会拦截），所有 UI 文本在 TS 初始化时通过 JS 设置。

### Extension Contexts (4 isolated execution environments)

| Context | Entry | 用途 |
|---------|-------|------|
| **Background** (service worker) | `src/background/index.ts` | 处理 AI API 调用，管理 IndexedDB 缓存，校验消息 |
| **Content script** | `src/content/index.ts` | Popup 通过 `scripting.executeScript` 按需注入（`assets/content.js`，IIFE 格式）。提取文本块，发送到 background 翻译，结果渲染到 DOM。CSS 内联于 JS 中，注入时同时创建 `<style>` 标签 |
| **Popup** | `src/popup/popup.html` + `popup.ts` | 工具栏弹窗 — 翻译/撤销按钮（`setButtonState()` 统一切换：冰川蓝渐变背景=翻译，暖陶色渐变=撤销，白字），源/目标语言选择 + 互换，划词翻译开关。打开时自动从 `<html lang>` 检测源语言、从 `navigator.language` 检测目标语言。语言锁定为 **per-tab**：用户手动改语言后仅当前标签锁定，锁存在 `chrome.storage.session`（key 含 `tabId`），换标签或重启浏览器即重置 |
| **Settings** | `src/settings/settings.html` + `settings.ts` | 选项页 — API endpoint、API key、模型名称、自动生成的 system prompt（可编辑）、测试连接、清除缓存 |

### Message Catalog

| Action | 方向 | 用途 |
|--------|------|------|
| `translatePage` | popup → content | 触发翻译 |
| `undoTranslation` | popup → content | 移除所有翻译克隆，停止 observer |
| `getState` | popup → content | 查询页面是否有活跃翻译 |
| `translationComplete` | content → runtime | 通知 popup：翻译成功（含统计） |
| `translationError` | content → runtime | 通知 popup：翻译失败 |
| `translationProgress` | background → content | （未使用，handler 已移除） |
| `translate` | content → background | 请求翻译文本段 → 返回结果。支持 `mode: 'translate' | 'dictionary'`，content 根据单词数和文字脚本自动判断，background 校验语言对后路由到对应 prompt |
| `toggleSelection` | popup → content | 启用/禁用划词翻译 |
| `ping` | popup → content | 检测内容脚本是否已注入（`ensureContentScript` 用） |
| `clearCache` | settings → background | 清空 IndexedDB 缓存 |
| `testConnection` | settings → background | 验证 API key/endpoint 可用 |

Popup 消息监听按 `sender.tab.id` 与 `activeTabId` 过滤，避免跨标签 UI 污染。

Background 校验翻译请求：segments 必须是数组且 ≤5000 项，每项含 `id` 和 `text` 字符串。校验失败的具体原因记录到 service worker 控制台。

### Data Flow (translate action)

```
Popup click → content script
  ├─ stopObserving()         // 停止 MutationObserver，防止重入
  ├─ removeTranslations()    // 清理上次结果
  ├─ extractSegments()       // extractRawSegments() 遍历 body DOM + activeFilter.filter() 过滤
  ├─ renderPlaceholders()    // 注入带 3 点进度指示器的克隆元素
  ├─ sendToBgWithRetry({ action: 'translate', segments })
  │     │                    // 自动重试 3 次（间隔 600ms），应对 SW 冷启动竞态
  │     ↓
  │   background router
  │     ├─ mode='translate' → 正常翻译流程
  │     ├─ mode='dictionary' → 语言对校验(仅英→中) → translateDictionary()
  │     │     └─ JSON 解析失败 → 自动降级 translateBatch()
  │     ├─ cacheGetBulk()    // IndexedDB 查找，dict_/seg_ 前缀隔离
  │     ├─ translateBatch()  // 按 token 分批，并行 3 并发，429/5xx 重试 3 次
  │     └─ 结果排序，cacheSetBulk() 缓存新条目，返回
  │     ↓
  ├─ renderTranslations()    // 替换占位符为真实翻译
  ├─ 发送 translationComplete 到 popup
  ├─ catchUpNewContent()     // 重新提取 API 调用期间新加载的内容
  │     └─ 过滤无翻译兄弟节点的 block → 翻译 → 渲染
  └─ startObserving(root, () => catchUpNewContent())  // 重新连接 observer，仅增量
```

翻译期间断开 Observer，防止自身 DOM 变更触发重译。追扫（catch-up）补偿 Observer 离线期间加载的新内容。Observer 仅在追扫完成后重连，避免追扫的 DOM 变更触发翻译循环。

**调试 "No translatable content"：** 控制台日志分两阶段 — `📄 Extracted N raw blocks`（extractor 产出）→ `✅ Extracted M blocks (K filtered)`（filter 后）。若 N > 0 但 M = 0，说明 `structuredFilter` 的 `hasSkippableAncestor()` 或噪音模式把所有 block 过滤了，需在页面控制台沿祖先链排查哪个元素 class/id 命中了 `SKIP_CLASS_NAMES`。

**诊断日志标记约定：** `🔎` 前缀标记 Observer → catchUpNewContent → filter 全链路诊断日志，用于排查"翻译内容被二次翻译"类问题。`👁` 前缀标记 Observer 触发及新增节点详情。

**Content → Background 重试机制：** `sendToBgWithRetry()` 包装 `chrome.runtime.sendMessage`。MV3 Service Worker 空闲终止后重新唤醒存在竞态：消息到达时 `onMessage` 监听器可能尚未注册，导致 "Receiving end does not exist" 错误。重试 3 次（间隔 600ms）给 SW 足够的启动时间。仅对连接类错误重试，其它错误直接抛出。

**内容脚本注入机制：** Popup 通过 `ensureContentScript(tabId)` 按需注入：
1. 发送 `ping` 消息探测 → 若响应则已注入，跳过
2. 未响应 → `chrome.scripting.executeScript` 注入 `assets/content.js`
3. 注入后重试 ping（最多 5 次 / 100ms 间隔）确认监听器就绪

内容脚本为 IIFE 格式（`vite.content.config.ts` 单独构建），因 `executeScript` 不支持 ESM `import` 语句。CSS（`theme.css` + `styles.css`）通过 `?inline` 导入为字符串，注入时创建 `<style>` 标签插入页面。

### Selection Translation Flow (划词翻译)

```
用户选中文字 → mouseup
  ├─ 300ms 防抖 → isValidSelection()
  ├─ 选区 Rect → positionBall() → createBall()  // 12px 小球在选区右上角
  └─ 悬停 1s → showBubble(rect, text)
        ├─ isSingleWord(text) → whitespace split 判断
        ├─ isEnglishText(text) → CJK/假名/谚文正则拒绝
        ├─ mode = (single && english) ? 'dictionary' : 'translate'
        ├─ sendToBgWithRetry({ action:'translate', segments, mode })
        │     ↓
        │   background router
        │     ├─ mode='dictionary' → 校验 sourceLang=English && targetLang=Chinese
        │     │     └─ 不满足 → mode 降级为 'translate'
        │     ├─ cacheGetBulk()（dict_/seg_ 前缀隔离）
        │     ├─ translateDictionary() 或 translateBatch()
        │     ├─ dict JSON 解析失败 → 降级 translateBatch()
        │     └─ 返回 { results, mode }（mode 告知前端渲染方式）
        │     ↓
        ├─ mode='dictionary' → renderDictionaryResult(body, json)
        │     └─ 词条头（单词+音标+词性标签）→ 分隔线 → 编号义项
        └─ mode='translate' → 原文 + 译文（现有翻译气泡）
```

小球位置逻辑（`positionBall`，`selection.ts:64`）：优先选区右上角外侧 2px → 顶部溢出翻到下方 → 右侧溢出翻到左侧 → 左边界 clamp 2px。气泡位置逻辑（`getBubblePosition`）：优先选区下方居中 → 底部溢出翻到上方。

### Key Modules

- **`src/content/retry.ts`** — `sendToBgWithRetry()` 提取至独立模块，避免 `index.ts` ↔ `selection.ts` 循环依赖。仅对 "Receiving end does not exist" / "Could not establish connection" 类错误重试（3 次 / 600ms 间隔），应对 MV3 Service Worker 冷启动竞态。
- **`src/content/selection.ts`** — 划词翻译。`enableSelection()` 注册 document mouseup 监听器，用户选中文字后在选区末尾右上方出现 12px 冰川蓝小球（`itranslate-selection-ball`），悬停小球 1s 膨胀动画后触发翻译（JS 驱动 `.animating` class，防鼠标微移重启）。小球与选区状态绑定，文字通过 `createBall(rect, text)` 捕获到闭包中防浏览器清除选区。`showBubble()` 中 `isSingleWord()` + `isEnglishText()` 自动判断 mode（单拉丁单词 → dictionary，其余 → translate），Background 返回结果后 `renderDictionaryResult()` 或翻译气泡分支渲染。词典气泡与翻译气泡结构一致（bar→header→body→actions），展示词条头（单词+音标+词性标签）+编号义项列表。`hideBubble(clearSelection?)` 仅在用户主动关闭（× / Esc / 滚动 / 禁用开关）时清除选区。气泡支持拖拽移动。注入 `::selection` 高亮背景。**每个页面默认关闭**，需通过 Popup 开关手动开启，状态不持久化（仅对当前标签生效）。
- **`src/background/translator.ts`** — OpenAI 兼容 API 客户端（`/chat/completions`）。`translateBatch()` 按 token 数分批：CJK 1.5 tok/字、拉丁 0.35 tok/字，目标 1500 tok/批，并行 3 批并发。`translateDictionary(word)` 专用于单次词典请求，使用内置 `DICT_SYSTEM_PROMPT`（非用户 settings.systemPrompt），返回 `{ success, data }`。仅 429/5xx 重试（最多 3 次），4xx 不重试。Temperature 0.1。发送 `thinking: { type: 'disabled' }` 阻止推理模型产生空内容。`max_tokens` 根据 prompt 长度动态估算。`parseResponse()` 支持 `[N]`、`N.`、`N)`、`N、` 格式。
- **`src/background/dict-prompt.ts`** — 词典 prompt 预制内置（不在 settings 中，用户不可编辑）。`DICT_SYSTEM_PROMPT` 为英→中词典 system prompt（JSON 输出格式：`{word, ipa, pos, definitions: [{zh}]}`）。`dictUserPrompt(word)` 生成 `Define: ${word}`。`parseDictionaryResponse(raw)` 解析 JSON 响应，清理 markdown fences，校验必填字段，失败返回 null。当前仅英→中一份 prompt，后期扩展改为语言对注册表。
- **`src/background/cache.ts`** — IndexedDB 封装（依赖 `idb`）。Key：`segmentKey(text, targetLang)` = djb2 hash + 文本长度 + 目标语言。Value：`{ original, translated, timestamp }`。**原文存储并在查找时校验**，防止哈希碰撞。`cacheGetBulk` 用并行 `Promise.all`。`dbPromise` 打开失败时重置以支持重试。
- **`src/background/router.ts`** — 编排缓存查找 + API 调用。`handleTranslate(segments, tabId?, mode?)` 支持 `'translate'` 和 `'dictionary'` 双模式。缓存 key 含 mode 前缀（`dict_`/`seg_`）和目标语言，词典/翻译缓存互不覆盖。词典模式先校验语言对（仅英→中），不满足则降级翻译。`translateDictionary()` JSON 解析失败时自动 fallback 到 `translateBatch()`。结果用位置映射（position map）排序。每次翻译前重新读取 settings 以获取最新 targetLang。
- **`src/content/extractor.ts`** — 纯 DOM 提取层，不做内容过滤。`extractRawSegments(root?)` 遍历所有元素，筛选有直接文本节点的元素，按块级祖先（`P/DIV/LI/H1-H6` 等）分组，产出 `RawSegment[]`（含 `id`、`text`、`blockElement`、`isHeading`、`leafElements`）。结构过滤（`isSkippable`）跳过 `SKIP_TAGS` / `SKIP_CLASS_NAMES` / ARIA 角色 / `hidden` / `aria-hidden` / `itranslate-translation` 类。叶子级 ≤3 字符文本（非标题）丢弃。**CSS 隐藏元素通过 `offsetParent === null` 跳过**（注意：`offsetParent` 对 `position:fixed` 和 `display:contents` 元素也返回 null，存在漏判可能）。文件内 `extractSegments()` 为向后兼容死代码，活跃入口在 `filters/index.ts`。
- **`src/content/filters/` — 标准过滤器模块**。`SegmentFilter` 接口定义在 `types.ts`（`{ name, filter(segments: RawSegment[]): FilterResult }`），第三方实现此接口即可接入。`registry.ts` 提供 `registerFilter()` / `setActiveFilter()` / `getActiveFilter()` 纯内存注册机制。`index.ts` 为 barrel 入口，自动注册内建过滤器并默认激活 `structured-filter`，同时导出 `extractSegments()`（内部调用 `extractRawSegments()` + 活跃过滤器）。内建两个实现：
  - **`structured-filter`**（默认）— 结构化过滤 + 标题豁免。`hasSkippableAncestor()` 沿祖先链向上检查 `SKIP_CLASS_NAMES` + `itranslate-translation` class（extractor 的 `isSkippable()` 只检查元素自身 class，子元素自身不含此类名需由 filter 层补刀），一直走到 `document.documentElement` 不停（含 `<body>` 和 `<html>`）。若页面顶层容器 class 命中 skip 关键词，会导致全页内容被过滤（已知 whitehouse.gov 触发此问题）。标题（H1-H6）直接保留不做字符数限制。非标题无字符数阈值。噪音模式过滤纯数字、时间戳、相对时间等。
  - **`default-filter`** — 旧 CJK/Latin 字符数阈值（CJK ≥12，Latin ≥20），兼容原行为。
  - **`debug-visualization.ts`** — 调试可视化（独立 dev 入口）。绿色/红色高亮标注保留/过滤元素，通过 `window.__itranslateFilterV2` 暴露。
- **`src/content/renderer.ts`** — 两阶段渲染：`renderPlaceholders()` 注入 3 点动画的克隆元素（clone 后清空 display/visibility/overflow 内联样式，不调用 `applyTextStyles` 避免源页面样式遮盖）；`renderTranslations()` 替换为真实翻译文本。`findTextLeaf()` 选文本最长的后代节点获取代表性样式。`applyTextStyles()` 从文本叶节点复制 color、fontSize、fontWeight、lineHeight（不复制 fontFamily，CSS 全局设为 `sans-serif`）。重置高度约束使翻译可扩展/收缩。白色文字设为 opacity=1。通过 `cloneNode(false)` 克隆，`afterend` 插入。去重检查 `nextElementSibling`。`removeTranslations()` 清除所有 `.itranslate-translation`。
- **`src/content/observer.ts`** — MutationObserver 封装，默认 1000ms 防抖。
- **`src/shared/i18n.ts`** — 国际化辅助模块。`t(key, substitutions?)` 封装 `chrome.i18n.getMessage`，缺失 key 时回退显示 key 本身。`detectUILanguage()` 根据浏览器 UI 语言返回 `'en'` 或 `'zh_CN'`。
- **`src/shared/theme.css`** — CSS 变量主题系统。`:root` 上定义 33 个 `--itranslate-*` 变量。popup/settings 通过 `@import` 引入，内容脚本中通过 Vite `?inline` 导入为字符串、注入时创建 `<style>` 标签。修改变量值即可全局切换主题。
- **`src/shared/storage.ts`** — `chrome.storage.sync` 封装。`getSettings()` 将已保存的值合并到默认值之上，新增字段对旧用户自动获得默认值。语言锁定不在此模块——per-tab lock 由 popup.ts 通过 `chrome.storage.session` 独立管理。
- **`src/shared/constants.ts`** — `DEFAULT_SETTINGS`（sourceLang: English、targetLang: Chinese）、`LANGUAGE_OPTIONS`（6 种语言，含 label/value 对）、缓存 DB/store 名称、storage key。
- **`src/shared/lang-detect.ts`** — 语言检测工具。`detectPageLang(tag)` 通过 `LANG_TAG_MAP`（zh/en/ja/ko/fr/de → 中/英/日/韩/法/德）将 BCP 47 标签映射为语言名。`detectLangFromText(text)` 扫描 Unicode 脚本范围（CJK、平假名、片假名、谚文）从正文检测语言，用于 `<html lang>` 缺失时的回退。

### Translation DOM Pattern

原始元素保持不变。翻译是块级祖先元素的**浅克隆**（相同标签、类、属性），通过 `insertAdjacentElement('afterend', clone)` 插入其后。CSS 类 `itranslate-translation` 标记所有翻译元素（`opacity: 0.85`，`font-family: sans-serif`）。`.itranslate-placeholder` 类显示 3 点进度指示器，翻译完成后移除。

### Icons

**源文件：** `icons/icon.svg`（128×128 SVG），构建时复制到 `dist/icons/`。PNG 生成：

```bash
npx sharp-cli@latest -i icons/icon.svg -o icons/icon128.png
npx sharp-cli@latest -i icons/icon128.png -o icons/icon48.png resize 48 48
npx sharp-cli@latest -i icons/icon128.png -o icons/icon16.png resize 16 16
```

`manifest.json` 引用 `icons/icon{16,48,128}.png`。备选方案：`icon-v1-layered.svg`（层叠冰山+译）、`icon-v3-lineart.svg`（线条速写+译）、`icon-v7-arcs.svg`（原版双弧线冰川色）。切换时覆盖 `icon.svg` 并重新生成 PNG + build。

### Visual Design & Theming

**主题系统：** `src/shared/theme.css` 集中定义 34 个 `--itranslate-*` CSS 变量（含 `--itranslate-gradient-undo` 撤销按钮暖陶色渐变）。popup/settings 通过 `@import` 引入，内容脚本通过 Vite `?inline` 内联注入。替换变量值即可全局切换主题，当前为**极地冰川主题**（米白基底 `#F5F3EF` + 冰川蓝 `#6BAECF`/`#94C8E0` + 深炭灰文字 `#2A3038`）。

**组件视觉：** 翻译按钮冰川蓝渐变+白字，撤销按钮暖陶色渐变+白字，`setButtonState()` 统一切换。划词翻译气泡（`itranslate-selection-bubble`）含品牌名拖拽手柄、原文折叠、译文分割线、复制/关闭按钮。触发小球（`itranslate-selection-ball`）悬停膨胀动画后展示气泡。翻译文本样式从原文元素动态复制，字体统一 `sans-serif`。`::selection` 高亮色通过 CSS 变量注入。

### Test Strategy

Vitest + jsdom + `fake-indexeddb` (auto-loaded via `setupFiles`)。测试文件位于各模块的 `__tests__/` 目录。`setup.ts` mock `HTMLElement.prototype.offsetParent` 为非 null（jsdom 无布局引擎）。用 `vi.stubGlobal('chrome', {...})` 模拟 `chrome.*` API，然后在测试中动态 import 模块。Cache 测试条目中包含 `original` 字段。Storage 测试覆盖默认值、合并和向后兼容。Lang-detect 测试覆盖所有支持的 BCP 47 标签、null/空输入以及基于字符的回退检测。i18n 测试覆盖语言检测（zh-CN/zh-TW/zh/en-US/en-GB/不支持的语言）和 `t()` 函数（已知 key、缺失 key 回退、单占位符替换、多占位符替换）。`structured-filter` 测试使用 `RawSegment[]` 构造输入（不依赖 DOM），覆盖标题豁免、噪音过滤、结构过滤、边界值。

Remotes: `origin` → Gitee (`https://gitee.com/fuzheng0312/i-translate.git`), `github` → GitHub (`https://github.com/FuZhengCN/iTranslate.git`).

## Book Project (`book/`)

本书《Claude Code + DeepSeek 从入门到精通》书稿同在仓库中，17 章 + Part 3 开篇铁律。合稿脚本：`node book/scripts/compile.cjs`，产出 `book/manuscript.md`。

**文件版本说明：** 用户亲自润色的版本使用中文文件名（如 `第5章 立项：从模糊想法到标准化技术Spec.md`），subagent 生成的英文文件名（如 `ch05-planning.md`）为旧版。Part 1（ch01-03）和 Part 2（第5-7章）均有润色版。编辑时优先修改中文文件名的润色版，同步更新英文文件名的旧版以保持 compile.cjs 编译链完整。

**书稿编辑规则：**
- 不编造内容——所有案例、对话、数据必须来自真实项目经历，无法核实的个人经验需注明
- CC 对话复盘需区分"完全编造"和"基于真实经历重构"——后者是合法的写作手法
- 不拉踩其他工具——只说 CC 自身的功能和适用场景，不对比贬低
- iTranslate 定位为"AI Coding 练手项目"，不夸大功能或商业价值
- 技术事实（API 端点、命令名、模型名、定价）需要和项目源码保持一致
- 叙事视角：CC 生成代码 → 用户理解设计意图，而非"用户亲手设计"
- 统一格式：`**本章目标**：` + `**预计字数**：` + `**状态**：` 元信息块 → `## x.1` ~ `## x.N` 编号
- CC 对话统一命名为 `## x.N 实战复盘：[主题]`，置于核心技巧之前
- 避免绝对化表述（"最强""唯一""彻底""海量"），避免营销用语（"核心竞争力"）

## Claude Code 开发环境

本项目开发时 Claude Code 通过 **CC-Switch** 连接 DeepSeek V4 作为基座模型，而非 Anthropic 原生 Claude API。

**settings.json 实际配置**（`~/.claude/settings.json`）：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "<deepseek-api-key>",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash[1m]"
  }
}
```

> **注意：** 扩展运行时配置（`src/shared/constants.ts` 中的 `apiEndpoint: 'https://api.deepseek.com/v1'`）和开发工具链配置（上述 `ANTHROPIC_BASE_URL: 'https://api.deepseek.com/anthropic'`）使用不同的端点。`/v1` 是 OpenAI 兼容端点（扩展调用），`/anthropic` 是 Anthropic 兼容端点（CC 调用）。两者不可互换。

**已安装插件：**
- `superpowers@claude-plugins-official` — 核心工作流（brainstorming/TDD/debugging/code-review）
- `agent-skills@addy-agent-skills` — 专业审查代理（code-reviewer/test-engineer/security-auditor）
- `claude-hud@claude-hud` — 终端状态栏
