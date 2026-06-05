# 翻译悬浮开关 — 设计规格

**日期**：2026-06-05
**状态**：已确认

## 概述

在页面右上角添加一个竖型迷你浮动面板，包含页面翻译和划词翻译两个按钮，让用户无需打开 popup 即可开关翻译。

## 架构

新增模块 `src/content/floating-panel.ts`，职责单一：创建/管理浮动面板 DOM 和交互。

```
src/content/
  floating-panel.ts   ← 新增：面板创建、按钮状态切换、点击处理
  index.ts            ← 修改：init 时调用 createFloatingPanel()
  selection.ts        ← 不改：复用 isSelectionEnabled() getter
```

面板按钮直接调用已有函数：
- 翻译按钮 → `translatePage('floating-panel')` 或 `removeTranslations()` + `stopObserving()`
- 划词按钮 → `enableSelection()` / `disableSelection()`

不新增消息类型，不修改 background，不碰 popup。浮动面板是纯内容脚本 UI 组件。

## UI 规格

### 面板容器

- `position: fixed; right: 0; top: 50%; transform: translateY(-50%)`
- `width: 32px; padding: 8px 6px; display: flex; flex-direction: column; align-items: center; gap: 6px`
- 背景米白渐变，边框冰川蓝描边，`border-right: none`
- `border-radius: 10px 0 0 10px`（左圆右直，表达吸附感）
- `z-index: 99996`（低于划词小球 99997 / 气泡 99998）
- `box-shadow` 左侧投影
- CSS 类：`itranslate-float-panel`
- CSS 变量复用 `--itranslate-*` 主题变量

### 翻译按钮（上）

| 状态 | 背景 | 图标 |
|------|------|------|
| 未翻译 | 冰川蓝渐变 `--itranslate-gradient-brand` | `文` 字 |
| 翻译中 | 冰川蓝 + 脉冲动画 | 三点闪烁 |
| 已翻译 | 暖陶色渐变 `--itranslate-gradient-undo` | `撤` 字 |

26×26px，圆角 6px，白色文字，`box-shadow` 微投影

### 划词按钮（下）

| 状态 | 背景 | 描边 |
|------|------|------|
| 关闭 | 透明/白色 | 冰川蓝 0.2 透明度 |
| 开启 | 冰川蓝填充 | 无 |

26×26px，圆角 6px，`选` 字图标

## 交互行为

### 状态同步

浮动面板不主动判断翻译进度，由 `index.ts` 在关键节点调用面板的 setter：

```ts
export function setTranslateState(state: 'translate' | 'translating' | 'undo'): void
export function setSelectionState(enabled: boolean): void
```

`index.ts` 调用时机：
- `translatePage()` 开始时 → `setTranslateState('translating')`
- 翻译成功 → `setTranslateState('undo')`
- 翻译失败 → `setTranslateState('translate')`
- `undoTranslation` 消息处理 → `setTranslateState('translate')`
- `toggleSelection` 消息处理后 → `setSelectionState(enabled)`

### 按钮点击

**翻译按钮：**
- 未翻译态 → 调用 `translatePage('floating-panel')`
- 翻译中态 → 忽略
- 已翻译态 → 调用 `removeTranslations()` + `stopObserving()`

**划词按钮：**
- 关闭态 → 调用 `enableSelection()`
- 开启态 → 调用 `disableSelection()`

### 面板生命周期

- 内容脚本注入后创建（`index.ts` init 末尾调用 `createFloatingPanel()`）
- 内容脚本卸载时面板随 DOM 消失
- 页面刷新后内容脚本重新注入时重新创建
- 提供 `removeFloatingPanel()` 供测试/清理

## 测试策略

新增 `src/content/__tests__/floating-panel.test.ts`：

| 用例 | 验证点 |
|------|--------|
| 面板创建 | DOM 结构（容器 + 2 个按钮）、CSS 类名、fixed 定位 |
| `setTranslateState('translate')` | 按钮背景冰川蓝，图标 `文` |
| `setTranslateState('translating')` | 脉冲动画类，点击忽略 |
| `setTranslateState('undo')` | 按钮背景暖陶色，图标 `撤` |
| `setSelectionState(true)` | 划词按钮填充态 |
| `setSelectionState(false)` | 划词按钮空心态 |
| 翻译按钮点击 | 未翻译→调 translatePage；已翻译→调 removeTranslations |
| 划词按钮点击 | 关闭→调 enableSelection；开启→调 disableSelection |
| `removeFloatingPanel()` | 面板 DOM 移除 |

Mock 策略：`translatePage`、`removeTranslations`、`enableSelection`、`disableSelection` 通过 `vi.mock()` 注入 mock，这些函数本身逻辑已在各自模块测试中覆盖。

## 文件变更

| 文件 | 动作 |
|------|------|
| `src/content/floating-panel.ts` | 新增 ~120 行 |
| `src/content/__tests__/floating-panel.test.ts` | 新增 ~100 行 |
| `src/content/index.ts` | 修改 ~5 行（import + init 调用 + 状态通知） |
