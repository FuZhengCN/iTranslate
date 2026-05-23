# 过滤方案 v2：结构化过滤 + 标题豁免

**日期**: 2026-05-23
**状态**: 设计中

## 目标

开发一个独立的过滤模块 `filter-v2.ts`，实验"结构化过滤 + 标题豁免"方案，替代当前基于字符数阈值（CJK 12 / Latin 20）的过滤逻辑。模块与现有插件隔离，通过 `window` 调试函数在真实页面上评估效果。

## 动机

当前 `extractor.ts` 使用硬性字符数阈值过滤短文本块，导致短标题（如 "Overview" 8 字符、"小结" 2 字符）被误杀。同类插件（Chrome 内置、沉浸式翻译）普遍不依赖字符数阈值，而是通过结构化手段区分正文与噪音。

## 文件布局

```
src/content/
  ├── extractor.ts           # 现有，不改
  ├── filter-v2.ts           # 新模块
  ├── index.ts               # 加一行 import './filter-v2'
  └── __tests__/
        └── filter-v2.test.ts
```

- `filter-v2.ts` 自包含，不 import 任何现有模块（实验阶段避免交叉依赖）
- `index.ts` 仅加一行 `import './filter-v2'` 侧载注册，不修改任何现有逻辑
- 测试文件独立，不修改现有 extractor 测试

## 过滤算法

### 第一层：结构过滤（继承现有逻辑）

- SKIP_TAGS: script, style, svg, iframe, code, pre, 表单/媒体元素等
- SKIP_CLASS_NAMES: header, footer, nav, sidebar, comment, menu, widget, advert, banner, social, share-btn, related, trending, recommend
- ARIA role: banner, navigation, complementary, contentinfo
- hidden / aria-hidden / itranslate-translation 类

### 第二层：文本级过滤

```
遍历第一层通过的元素：
  ├── 文本 ≤3 字符 → 跳过（纯数字、单字噪音）
  ├── 噪音模式匹配 → 跳过（时间戳、日期、纯数字、已知状态标签）
  ├── ⭐ 块级标签为 H1-H6 → 直接保留（标题豁免，不做长度限制）
  └── ⭐ 非标题独立短文本 <5 字符 → 跳过（兜底：按钮 "OK"、"Go" 等）
```

### 关键变化

- **删除** `MIN_BLOCK_CHARS_CJK`（12）和 `MIN_BLOCK_CHARS_LATIN`（20）
- **新增** 标题豁免：H1-H6 标签不作为块级祖先参与分组，而是自身作为独立块直接保留
- **新增** 5 字符兜底：非标题元素最终合并文本 <5 字符时跳过

## 数据结构

```ts
// 跳过原因枚举
type SkipReason = 'too-short-leaf' | 'noise-pattern' | 'too-short-non-heading' | 'structural';

// 跳过的记录
interface SkippedRecord {
  element: Element;
  text: string;
  reason: SkipReason;
}

// 过滤结果
interface FilterResult {
  kept: TranslationSegment[];       // 保留翻译的段
  keptElements: Element[];          // 对应的 DOM 元素
  skipped: SkippedRecord[];         // 被过滤的记录（含原因）
}
```

## window 调试接口

```ts
window.__itranslateFilterV2 = {
  run(): void      // 执行过滤 + 页面上绿色/红色高亮
  clear(): void    // 清除所有高亮
}
```

- `run()` 调用 `filterSegments(root)` → `visualize(result)`
- `clear()` 移除所有注入的高亮样式
- 仅在 content script 上下文可用

## 可视化规则

- **绿色**：保留翻译的块，`outline: 2px solid rgba(34,197,94,0.7)` + `background: rgba(34,197,94,0.08)`
- **红色**：过滤掉的元素，`outline: 2px solid rgba(239,68,68,0.7)` + `background: rgba(239,68,68,0.08)`
- 高亮样式通过 CSS 类注入，避免内联样式覆盖

## 测试策略

- 使用 Vitest + jsdom，与现有测试风格一致
- 核心用例：
  - 短标题（H2 "Overview" 8 字符）保留
  - 导航文字（<3 字符 "OK"）过滤
  - 正文段落正常保留
  - 噪音（纯数字、时间戳）过滤
  - 结构过滤（script/style/nav 类名）过滤
  - 空文档返回空数组
- `chrome` API 不需要 mock（filter-v2 不依赖 chrome）

## 非目标

- 不替换 `extractor.ts`（实验阶段）
- 不修改 `index.ts` 的翻译流程
- 不引入链接密度 / 链接兄弟数检测
- 不做站点特定规则
- 不持久化任何调试状态
