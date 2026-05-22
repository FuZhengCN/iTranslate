# 划词翻译 — 设计文档

**日期：** 2026-05-22
**状态：** 待实施

## 问题

`extractor.ts` 中按字符数阈值过滤短文本块（CJK <12 字、拉丁 <20 字），导致导航标签、按钮文字、短标题等有意义但较短的文本被跳过。需要一种兜底方案让用户手动翻译这些被过滤的文本。

## 方案

**选中自动弹出气泡**：用户在页面任意位置选中文字，0.3 秒后在选区附近浮出翻译气泡。不修改页面 DOM 结构，复用现有 Background 翻译链路。

## 交互流程

```
mouseup 结束拖选
  ├─ 选区为空/仅空格？           → 忽略
  ├─ 选区在 .itranslate-translation 内？ → 忽略（已有翻译，不重复弹窗）
  └─ 有效选区 →
        ├─ 300ms 防抖
        ├─ 获取选区边界矩形 (getBoundingClientRect)
        ├─ sendToBgWithRetry({ action: 'translate', segments: [{ id: 'sel_0', text }] })
        │     └─ 复用 Background router → cache → translator 完整链路
        ├─ 创建翻译气泡 (position: fixed)
        │     ├─ 紫色渐变顶部条 (延续现有视觉风格)
        │     ├─ 原文 (灰色，最多 80 字截断)
        │     ├─ 译文
        │     └─ 关闭按钮
        └─ 定位：优先选区下方，空间不够则上方

关闭方式：
  - 点击气泡外部 (document click)
  - 按 Esc
  - 新选区开始（关闭上一个气泡）
```

## 新增模块

```
src/content/selection.ts    ← 新文件
src/content/styles.css      ← 追加气泡样式
src/content/index.ts        ← 顶部 import + initSelection()
```

## selection.ts 设计

```
initSelection(): void
  注册 document mouseup 监听器

showBubble(rect: DOMRect, text: string): Promise<void>
  1. 调用 sendToBgWithRetry({ action: 'translate', segments: [{ id: 'sel_0', text }] })
  2. 创建气泡 DOM
  3. 用 getBubblePosition(rect) 计算位置
  4. 插入 document.body
  5. 绑定关闭处理器

hideBubble(): void
  移除当前气泡 DOM

isValidSelection(): boolean
  - Selection.rangeCount === 0 → false
  - selection.toString().trim() === '' → false
  - 选区起点/终点在 .itranslate-translation 内 → false

getBubblePosition(rect: DOMRect): { top, left }
  优先选区下方，距选区 8px
  若超出视口底部 → 选区上方
  水平居中于选区
```

## 气泡 DOM 结构

```html
<div class="itranslate-selection-bubble">
  <div class="itranslate-bubble-header"></div>
  <div class="itranslate-bubble-original">原文</div>
  <div class="itranslate-bubble-translation">译文</div>
  <button class="itranslate-bubble-close">×</button>
</div>
```

样式隔离：所有样式限定在 `.itranslate-selection-bubble` 下，`all: initial` 重置防页面样式污染。

## 对现有模块的影响

- **Background：零改动。** 直接发 `{ action: 'translate', segments }` 消息，校验条件 id/segments 格式与现有一致
- **extractor.ts：零改动**
- **renderer.ts：零改动**
- **Popup：零改动**

## 测试

- `isValidSelection()` 边界用例（空选区、已翻译区域内外）
- `getBubblePosition()` 边界计算（正常/贴底/贴顶）
- 气泡 DOM 生成与关闭行为
- 不测试实际 API 调用（translator 测试已覆盖）
