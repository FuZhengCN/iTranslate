# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**语言要求：所有回复、解释、注释、说明使用简体中文，代码关键字/标识符保留英文。**

## 铁律

1. **根因驱动**：必须定位到问题的根本原因再动手修改。禁止在未找到根因的情况下猜测性修改代码。每个修改必须能解释"为什么"。
2. **三轮止损**：同一个问题如果在三个对话轮次内仍未解决，必须停下来回到问题起点，从第一性原理重新分析，不可继续沿用之前的思路惯性。
3. **极简修改**：能少写一行代码就绝不多写。优先用最精简的方式解决问题，禁止引入不必要的抽象、额外文件或依赖。
4. **专注问题**：改问题时只改问题本身，禁止顺手重构、格式化、优化无关代码。重构需要先征得明确同意。

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

**国际化（i18n）：** 支持简体中文/英文双语，根据 `navigator.language` 自动选择。翻译文件 `_locales/{en,zh_CN}/messages.json`（各 35 条）。JS 通过 `src/shared/i18n.ts` 的 `t()` 函数获取文本。**注意：HTML 中不能使用 `__MSG_*__` 占位符**（Vite/Crxjs dev server 会拦截），所有 UI 文本在 TS 初始化时通过 JS 设置。

### Extension Contexts (4 isolated execution environments)

| Context | Entry | 用途 |
|---------|-------|------|
| **Background** (service worker) | `src/background/index.ts` | 处理 AI API 调用，管理 IndexedDB 缓存，校验消息 |
| **Content script** | `src/content/index.ts` | Popup 通过 `scripting.executeScript` 按需注入（`assets/content.js`，IIFE 格式）。提取文本块，发送到 background 翻译，结果渲染到 DOM。CSS 内联于 JS 中，注入时同时创建 `<style>` 标签 |
| **Popup** | `src/popup/popup.html` + `popup.ts` | 工具栏弹窗 — 翻译/撤销按钮，源/目标语言选择 + 互换，划词翻译开关。打开时自动从 `<html lang>` 检测源语言、从 `navigator.language` 检测目标语言（若用户手动选择过则尊重锁定标志）。打开时同步按钮状态和划词翻译开关状态 |
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
| `translate` | content → background | 请求翻译文本段 → 返回结果 |
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
  │     ├─ cacheGetBulk()    // IndexedDB 查找，带原文校验防哈希碰撞
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

**Content → Background 重试机制：** `sendToBgWithRetry()` 包装 `chrome.runtime.sendMessage`。MV3 Service Worker 空闲终止后重新唤醒存在竞态：消息到达时 `onMessage` 监听器可能尚未注册，导致 "Receiving end does not exist" 错误。重试 3 次（间隔 600ms）给 SW 足够的启动时间。仅对连接类错误重试，其它错误直接抛出。

**内容脚本注入机制：** Popup 通过 `ensureContentScript(tabId)` 按需注入：
1. 发送 `ping` 消息探测 → 若响应则已注入，跳过
2. 未响应 → `chrome.scripting.executeScript` 注入 `assets/content.js`
3. 注入后重试 ping（最多 5 次 / 100ms 间隔）确认监听器就绪

内容脚本为 IIFE 格式（`vite.content.config.ts` 单独构建），因 `executeScript` 不支持 ESM `import` 语句。CSS（`theme.css` + `styles.css`）通过 `?inline` 导入为字符串，注入时创建 `<style>` 标签插入页面。

### Key Modules

- **`src/content/retry.ts`** — `sendToBgWithRetry()` 提取至独立模块，避免 `index.ts` ↔ `selection.ts` 循环依赖。仅对 "Receiving end does not exist" / "Could not establish connection" 类错误重试（3 次 / 600ms 间隔），应对 MV3 Service Worker 冷启动竞态。
- **`src/content/selection.ts`** — 划词翻译。`enableSelection()` 注册 document mouseup 监听器，用户选中文字后在选区末尾右上方出现 12px 冰川蓝小球（`itranslate-selection-ball`），悬停小球 0.55s 膨胀动画后触发翻译，避免每次选中都自动调用 API。小球与选区状态绑定，文字通过 `createBall(rect, text)` 捕获到闭包中防浏览器清除选区。气泡复用 Background translate 消息链路（含缓存）。`hideBubble(clearSelection?)` 仅在用户主动关闭（× / Esc / 滚动 / 禁用开关）时清除选区，气泡弹出时保留选中状态。气泡支持拖拽移动（顶条品牌名区域为拖拽手柄）。注入 `::selection` 高亮背景提示划词翻译已开启。包含复制到剪贴板功能，按钮文字通过 `t()` i18n 支持中英双语。**每个页面默认关闭**，需通过 Popup 开关手动开启，状态不持久化（仅对当前标签生效）。
- **`src/background/translator.ts`** — OpenAI 兼容 API 客户端（`/chat/completions`）。按 token 数分批：CJK 1.5 tok/字、拉丁 0.35 tok/字，目标 1500 tok/批。并行 3 批并发。仅 429/5xx 重试（最多 3 次），4xx 不重试。Temperature 0.1。发送 `thinking: { type: 'disabled' }` 阻止推理模型产生空内容。`max_tokens` 根据 prompt 长度动态估算。`parseResponse()` 支持 `[N]`、`N.`、`N)`、`N、` 格式。
- **`src/background/cache.ts`** — IndexedDB 封装（依赖 `idb`）。Key：`segmentKey(text, targetLang)` = djb2 hash + 文本长度 + 目标语言。Value：`{ original, translated, timestamp }`。**原文存储并在查找时校验**，防止哈希碰撞。`cacheGetBulk` 用并行 `Promise.all`。`dbPromise` 打开失败时重置以支持重试。
- **`src/background/router.ts`** — 编排缓存查找 + API 调用。缓存 key 含目标语言（`segmentKey(text, targetLang)`），切换目标语言不会命中旧缓存。结果用位置映射（position map）排序，避免 O(n²) 的 `findIndex`。`handleTranslate(segments, tabId?)`。每次翻译前重新读取 settings 以获取最新 targetLang。
- **`src/content/extractor.ts`** — 纯 DOM 提取层，不做内容过滤。`extractRawSegments(root?)` 遍历所有元素，筛选有直接文本节点的元素，按块级祖先（`P/DIV/LI/H1-H6` 等）分组，产出 `RawSegment[]`（含 `id`、`text`、`blockElement`、`isHeading`、`leafElements`）。结构过滤（`isSkippable`）跳过 `SKIP_TAGS` / `SKIP_CLASS_NAMES` / ARIA 角色 / `hidden` / `aria-hidden` / `itranslate-translation` 类。叶子级 ≤3 字符文本（非标题）丢弃。**CSS 隐藏元素（`display:none`）通过 `offsetParent === null` 跳过**，减少无效 API 消耗。文件内 `extractSegments()` 为向后兼容死代码，活跃入口在 `filters/index.ts`。
- **`src/content/filters/` — 标准过滤器模块**。`SegmentFilter` 接口定义在 `types.ts`（`{ name, filter(segments: RawSegment[]): FilterResult }`），第三方实现此接口即可接入。`registry.ts` 提供 `registerFilter()` / `setActiveFilter()` / `getActiveFilter()` 纯内存注册机制。`index.ts` 为 barrel 入口，自动注册内建过滤器并默认激活 `structured-filter`，同时导出 `extractSegments()`（内部调用 `extractRawSegments()` + 活跃过滤器）。内建两个实现：
  - **`structured-filter`**（默认）— 结构化过滤 + 标题豁免。`hasSkippableAncestor()` 沿祖先链检查 `SKIP_CLASS_NAMES`（`\b` 词边界防误匹配，含 `ad`/`footer`/`nav`/`sidebar`/`avatar`/`byline`/`publishTime`/`addMore`/`view-more` 等 30 个关键词）。标题（H1-H6）直接保留不做字符数限制。非标题无字符数阈值。噪音模式过滤纯数字、时间戳（`HH:MM`、`DD-Mon-YYYY`）、"COMING UP"、相对时间（`/\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago/i`）。
  - **`default-filter`** — 旧 CJK/Latin 字符数阈值（CJK ≥12，Latin ≥20），兼容原行为。
  - **`debug-visualization.ts`** — 调试可视化（独立 dev 入口）。绿色/红色高亮标注保留/过滤元素，通过 `window.__itranslateFilterV2` 暴露。
- **`src/content/renderer.ts`** — 两阶段渲染：`renderPlaceholders()` 注入 3 点动画的克隆元素（clone 后清空 display/visibility/overflow 内联样式，不调用 `applyTextStyles` 避免源页面样式遮盖）；`renderTranslations()` 替换为真实翻译文本。`findTextLeaf()` 选文本最长的后代节点获取代表性样式。`applyTextStyles()` 从文本叶节点复制 color、fontSize、fontWeight、lineHeight（不复制 fontFamily，CSS 全局设为 `sans-serif`）。重置高度约束使翻译可扩展/收缩。白色文字设为 opacity=1。通过 `cloneNode(false)` 克隆，`afterend` 插入。去重检查 `nextElementSibling`。`removeTranslations()` 清除所有 `.itranslate-translation`。
- **`src/content/observer.ts`** — MutationObserver 封装，默认 1000ms 防抖。`startObserving(root, callback)` / `stopObserving()`。监听 `childList` + `subtree` + `attributes`（`attributeFilter: ['class', 'style']`），捕获 CSS 类名切换导致的隐藏/显示变化。回调触发 `catchUpNewContent()`（增量），非完整 `translatePage()`。
- **`src/content/toast.ts`** — 死代码，不再被任何模块引用，可安全删除。
- **`src/shared/i18n.ts`** — 国际化辅助模块。`t(key, substitutions?)` 封装 `chrome.i18n.getMessage`，缺失 key 时回退显示 key 本身。`detectUILanguage()` 根据浏览器 UI 语言返回 `'en'` 或 `'zh_CN'`。
- **`src/shared/theme.css`** — CSS 变量主题系统。`:root` 上定义 33 个 `--itranslate-*` 变量。popup/settings 通过 `@import` 引入，内容脚本中通过 Vite `?inline` 导入为字符串、注入时创建 `<style>` 标签。修改变量值即可全局切换主题。
- **`src/shared/storage.ts`** — `chrome.storage.sync` 封装。`getSettings()` 将已保存的值合并到默认值之上，新增字段（如 `sourceLang`、`targetLang`、`*Locked`）对旧用户自动获得默认值。
- **`src/shared/constants.ts`** — `DEFAULT_SETTINGS`（sourceLang: English、targetLang: Chinese、`sourceLangLocked`/`targetLangLocked` 均为 false）、`LANGUAGE_OPTIONS`（6 种语言，含 label/value 对）、缓存 DB/store 名称、storage key。
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

**主题系统：** `src/shared/theme.css` 集中定义 33 个 `--itranslate-*` CSS 变量。popup/settings 通过 `@import` 引入，内容脚本通过 Vite `?inline` 内联注入。替换变量值即可全局切换主题，当前为**极地冰川主题**（米白基底 `#F5F3EF` + 冰川蓝 `#6BAECF`/`#94C8E0` + 深炭灰文字 `#2A3038`）。

**组件视觉：** popup logo 纯色冰川蓝，主按钮/开关/Toast 微渐变（同色系浅→深）。进度指示器：浅冰蓝 3 个圆点依次弹跳（`itranslate-dot`）。划词翻译泡泡（`itranslate-selection-bubble`）：极地冰川主题 — 米白渐变底（`#FCFBF9`→`#F5F3EF`）、14px 圆角、冰川蓝微边框、4px 三色渐变顶条；Header 左侧"通译"品牌名兼拖拽手柄；原文折叠 3 行渐变淡出；译文上方细分割线；复制按钮胶囊形（`border-radius: 14px`）、关闭按钮正圆形。划词触发小球（`itranslate-selection-ball`）：12px 冰川蓝圆点，悬停 `translateY(-12px) scale(2)` 膨胀弹跳动画 + 光环扩散 0.55s spring 缓动，`::after` 通过 `attr(data-label)` 显示"译"/"Tr"。翻译文本：`sans-serif`，opacity 0.85，颜色等样式从原文元素动态复制。`::selection` 高亮色通过 CSS 变量注入。无 toast 通知栏。

### Test Strategy

Vitest + jsdom + `fake-indexeddb` (auto-loaded via `setupFiles`)。70 个测试分布在 9 个文件中（`__tests__/` 目录）。`setup.ts` mock `HTMLElement.prototype.offsetParent` 为非 null（jsdom 无布局引擎）。用 `vi.stubGlobal('chrome', {...})` 模拟 `chrome.*` API，然后在测试中动态 import 模块。Cache 测试条目中包含 `original` 字段。Storage 测试覆盖默认值、合并、向后兼容和 `*Locked` 标志读写。Lang-detect 测试覆盖所有支持的 BCP 47 标签、null/空输入以及基于字符的回退检测。i18n 测试覆盖语言检测（zh-CN/zh-TW/zh/en-US/en-GB/不支持的语言）和 `t()` 函数（已知 key、缺失 key 回退、单占位符替换、多占位符替换）。`structured-filter` 测试使用 `RawSegment[]` 构造输入（不依赖 DOM），覆盖标题豁免、噪音过滤、结构过滤、边界值。

Remotes: `origin` → Gitee (`https://gitee.com/fuzheng0312/i-translate.git`), `github` → GitHub (`https://github.com/FuZhengCN/iTranslate.git`).
