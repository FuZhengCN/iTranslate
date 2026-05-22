# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**语言要求：所有回复、解释、注释、说明使用简体中文，代码关键字/标识符保留英文。**

## Build & Test Commands

```bash
npm install              # Install dependencies
npm run build            # 构建号 z+1 → tsc → vite build → dist/
npm run bump             # 手动递增构建号（build 已自动调用）
npm run dev              # Vite dev server with HMR
npm test                 # Run all tests (vitest run)
npm run test:watch       # Run tests in watch mode (vitest)
npx vitest run --reporter=verbose  # Detailed output
npx vitest run src/content/__tests__/renderer.test.ts  # Run single test file
npx tsc --noEmit         # TypeScript check only (no emit)
```

## Version Management

版本格式 `MAJOR.MINOR.BUILD`（x.y.z），`package.json` 为唯一版本源。

- **每次 `npm run build` 自动 z+1**（`scripts/bump-build.js`）
- **`manifest.json` 版本号由 `vite.config.ts` 构建时注入**，源文件为占位符 `0.0.0`
- 升 y（minor）或 x（major）时手动运行 `npm version minor` / `npm version major`，后续构建 z 继续累加

## Architecture

**Manifest V3 浏览器扩展**（Chrome/Edge），多语种双语翻译（默认英→中）。TypeScript 编写，Vite + `@crxjs/vite-plugin` 构建。

**扩展加载方式：**
- 开发：`npm run dev` 启动 Vite dev server，Chrome 加载**源码目录**（项目根目录，非 `dist/`）
- 生产：`npm run build`，Chrome 加载 `dist/` 目录

**国际化（i18n）：** 支持简体中文/英文双语，根据 `navigator.language` 自动选择。翻译文件 `_locales/{en,zh_CN}/messages.json`（各 31 条）。JS 通过 `src/shared/i18n.ts` 的 `t()` 函数获取文本。**注意：HTML 中不能使用 `__MSG_*__` 占位符**（Vite/Crxjs dev server 会拦截），所有 UI 文本在 TS 初始化时通过 JS 设置。

### Extension Contexts (4 isolated execution environments)

| Context | Entry | 用途 |
|---------|-------|------|
| **Background** (service worker) | `src/background/index.ts` | 处理 AI API 调用，管理 IndexedDB 缓存，校验消息 |
| **Content script** | `src/content/index.ts` | 注入 http/https 页面。提取文本块，发送到 background 翻译，结果渲染到 DOM |
| **Popup** | `src/popup/popup.html` + `popup.ts` | 工具栏弹窗 — 翻译/撤销按钮，源/目标语言选择 + 互换，清除缓存，划词翻译开关。打开时自动从 `<html lang>` 检测源语言、从 `navigator.language` 检测目标语言（若用户手动选择过则尊重锁定标志）。打开时同步按钮状态和划词翻译开关状态 |
| **Settings** | `src/settings/settings.html` + `settings.ts` | 选项页 — API endpoint、API key、模型名称、自动生成的 system prompt（可编辑）、测试连接 |

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
| `clearCache` | popup → background | 清空 IndexedDB 缓存 |
| `testConnection` | settings → background | 验证 API key/endpoint 可用 |

Popup 消息监听按 `sender.tab.id` 与 `activeTabId` 过滤，避免跨标签 UI 污染。

Background 校验翻译请求：segments 必须是数组且 ≤5000 项，每项含 `id` 和 `text` 字符串。校验失败的具体原因记录到 service worker 控制台。

### Data Flow (translate action)

```
Popup click → content script
  ├─ stopObserving()         // 停止 MutationObserver，防止重入
  ├─ removeTranslations()    // 清理上次结果
  ├─ extractSegments()       // 遍历 body DOM，按块级祖先分组文本
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

### Key Modules

- **`src/content/retry.ts`** — `sendToBgWithRetry()` 提取至独立模块，避免 `index.ts` ↔ `selection.ts` 循环依赖。仅对 "Receiving end does not exist" / "Could not establish connection" 类错误重试（3 次 / 600ms 间隔），应对 MV3 Service Worker 冷启动竞态。
- **`src/content/selection.ts`** — 划词翻译。`initSelection()` 注册 document mouseup 监听器，用户选中文字后 300ms 防抖弹出翻译气泡。气泡复用 Background translate 消息链路（含缓存），仅展示译文（无原文），加载时复用全页翻译的 3 点动画。`enableSelection()` 注入 `::selection` 淡紫色背景（`rgba(124,58,237,0.18)`）提示划词翻译已开启。仅 × / Esc 可关闭泡泡。包含复制到剪贴板功能。**每个页面默认关闭**，需通过 Popup 开关手动开启，状态不持久化（仅对当前标签生效）。
- **`src/background/translator.ts`** — OpenAI 兼容 API 客户端（`/chat/completions`）。按 token 数分批：CJK 1.5 tok/字、拉丁 0.35 tok/字，目标 1500 tok/批。并行 3 批并发。仅 429/5xx 重试（最多 3 次），4xx 不重试。Temperature 0.1。发送 `thinking: { type: 'disabled' }` 阻止推理模型产生空内容。`max_tokens` 根据 prompt 长度动态估算。`parseResponse()` 支持 `[N]`、`N.`、`N)`、`N、` 格式。
- **`src/background/cache.ts`** — IndexedDB 封装（依赖 `idb`）。Key：`segmentKey(text, targetLang)` = djb2 hash + 文本长度 + 目标语言。Value：`{ original, translated, timestamp }`。**原文存储并在查找时校验**，防止哈希碰撞。`cacheGetBulk` 用并行 `Promise.all`。`dbPromise` 打开失败时重置以支持重试。
- **`src/background/router.ts`** — 编排缓存查找 + API 调用。缓存 key 含目标语言（`segmentKey(text, targetLang)`），切换目标语言不会命中旧缓存。结果用位置映射（position map）排序，避免 O(n²) 的 `findIndex`。`handleTranslate(segments, tabId?)`。每次翻译前重新读取 settings 以获取最新 targetLang。
- **`src/content/extractor.ts`** — 从 `document.body` 全页提取文本块。遍历所有元素，筛选有直接文本节点的元素，按最近块级祖先（`P/DIV/LI/H1-H6` 等）分组。按语种设最低字符数：CJK ≥12 字，拉丁 ≥20 字。CJK 检测（`isCJK`）覆盖汉字、平假名、片假名、CJK 标点。过滤噪音（时间戳、日期、纯数字）。跳过带 `itranslate-translation` 类或匹配 `SKIP_CLASS_NAMES`/ARIA 角色的元素。
- **`src/content/renderer.ts`** — 两阶段渲染：`renderPlaceholders()` 注入 3 点动画的克隆元素（clone 后清空 display/visibility/overflow 内联样式，不调用 `applyTextStyles` 避免源页面样式遮盖）；`renderTranslations()` 替换为真实翻译文本。`findTextLeaf()` 选文本最长的后代节点获取代表性样式。`applyTextStyles()` 从文本叶节点复制 color、fontSize、fontWeight、lineHeight（不复制 fontFamily，CSS 全局设为 `sans-serif`）。重置高度约束使翻译可扩展/收缩。白色文字设为 opacity=1。通过 `cloneNode(false)` 克隆，`afterend` 插入。去重检查 `nextElementSibling`。`removeTranslations()` 清除所有 `.itranslate-translation`。
- **`src/content/observer.ts`** — MutationObserver 封装，默认 1000ms 防抖。`startObserving(root, callback)` / `stopObserving()`。监听 `childList` + `subtree`。回调触发 `catchUpNewContent()`（增量），非完整 `translatePage()`。
- **`src/content/toast.ts`** — 死代码，不再被任何模块引用，可安全删除。
- **`src/shared/i18n.ts`** — 国际化辅助模块。`t(key, substitutions?)` 封装 `chrome.i18n.getMessage`，缺失 key 时回退显示 key 本身。`detectUILanguage()` 根据浏览器 UI 语言返回 `'en'` 或 `'zh_CN'`。
- **`src/shared/storage.ts`** — `chrome.storage.sync` 封装。`getSettings()` 将已保存的值合并到默认值之上，新增字段（如 `sourceLang`、`targetLang`、`*Locked`）对旧用户自动获得默认值。
- **`src/shared/constants.ts`** — `DEFAULT_SETTINGS`（sourceLang: English、targetLang: Chinese、`sourceLangLocked`/`targetLangLocked` 均为 false）、`LANGUAGE_OPTIONS`（6 种语言，含 label/value 对）、缓存 DB/store 名称、storage key。
- **`src/shared/lang-detect.ts`** — 语言检测工具。`detectPageLang(tag)` 通过 `LANG_TAG_MAP`（zh/en/ja/ko/fr/de → 中/英/日/韩/法/德）将 BCP 47 标签映射为语言名。`detectLangFromText(text)` 扫描 Unicode 脚本范围（CJK、平假名、片假名、谚文）从正文检测语言，用于 `<html lang>` 缺失时的回退。

### Translation DOM Pattern

原始元素保持不变。翻译是块级祖先元素的**浅克隆**（相同标签、类、属性），通过 `insertAdjacentElement('afterend', clone)` 插入其后。CSS 类 `itranslate-translation` 标记所有翻译元素（`opacity: 0.85`，`font-family: sans-serif`）。`.itranslate-placeholder` 类显示 3 点进度指示器，翻译完成后移除。

### Visual Design

统一紫色渐变（#4f46e5 → #7c3aed）：popup logo、按钮、泡泡顶条、开关滑块。进度指示器：半透明背景上 3 个圆点依次亮起（全页翻译占位点样式，`itranslate-dot` 类）。划词翻译泡泡：白底、12px 圆角、紫色渐变顶条、石板灰译文 `#334155`，加载中复用三点动画。翻译字体：`sans-serif`（浏览器默认，语言无关）。翻译透明度：0.85，与原文形成视觉区分。无 toast 通知栏。

### Test Strategy

Vitest + jsdom + `fake-indexeddb` (auto-loaded via `setupFiles`)。58 个测试分布在 8 个文件中（`__tests__/` 目录）。用 `vi.stubGlobal('chrome', {...})` 模拟 `chrome.*` API，然后在测试中动态 import 模块。Cache 测试条目中包含 `original` 字段。Storage 测试覆盖默认值、合并、向后兼容和 `*Locked` 标志读写。Lang-detect 测试覆盖所有支持的 BCP 47 标签、null/空输入以及基于字符的回退检测。i18n 测试覆盖语言检测（zh-CN/zh-TW/zh/en-US/en-GB/不支持的语言）和 `t()` 函数（已知 key、缺失 key 回退、单占位符替换、多占位符替换）。

Remotes: `origin` → Gitee (`https://gitee.com/fuzheng0312/i-translate.git`), `github` → GitHub (`https://github.com/FuZhengCN/iTranslate.git`).
