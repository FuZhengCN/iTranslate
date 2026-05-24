# 划词翻译触发优化设计

**日期**: 2026-05-24 | **状态**: 已确认

## 背景

当前划词翻译使用 300ms 防抖后自动触发：用户选中文字 → 等待 300ms → 自动弹出翻译气泡。问题在于用户打开划词翻译后，任何一次选中都会触发翻译请求，即使只是普通阅读中的选中操作。

参考沉浸式翻译的做法：选中文字后出现一个小标记，用户需要主动将鼠标移到标记上才触发翻译，避免无意义触发。

## 交互流程

```
选中文字 → 小球出现（选区末尾右上方，∅12px 纯色圆点）
                │
                ├─ 鼠标悬停小球 → 小球放大至 20px + 光环扩散 + 显示"译"字
                │                    └─ 同时发起翻译请求 → 翻译气泡出现，小球消失
                │
                └─ 取消选中/点击别处 → 小球消失（交互自然结束）

翻译气泡关闭（×/Esc） → 清除文字选中 → 小球同步消失
```

## 设计要点

### 小球外观

- **默认态**: 12px 纯色圆点，冰川蓝渐变，`box-shadow` 微光晕
- **悬停态**: 放大至 20px，外围光环扩散（6px blur ring），内部显示"译"字
- 所有过渡动画 0.2s ease

### 小球定位

- `position: fixed`，选区最后一个 Range 的 `getBoundingClientRect()` 末端右上方
- 水平偏移：`rect.right + 2px`
- 垂直偏移：`rect.top - 16px`（在文字行上方）
- 边界检测：超出视口时向内收缩

### 生命周期

- **出现**: `mouseup` 事件 → 检测有效选中 → 创建小球（不再有 300ms 防抖）
- **持续**: 小球与 `window.getSelection()` 状态绑定。`selectionchange` 事件监听选区消失 → 小球消失
- **消失**: 三种路径 — (1) 选区被清除 (2) 悬停触发翻译后小球替换为气泡 (3) 已有小球时新选中替换旧小球
- **关闭气泡**: ×/Esc 关闭气泡 → 同时 `window.getSelection().removeAllRanges()` 清除选中 → 小球随之消失

### 翻译触发

- `mouseenter` 事件触发翻译（悬停即译，无需点击）
- 复用现有 `sendToBgWithRetry` → background translate 链路
- 翻译请求发出后小球立即移除，显示翻译气泡（复用现有 `showBubble` 逻辑）
- 快速悬停又移开：翻译请求已发出的仍展示结果气泡，不做请求取消

## 实现范围

### 改动文件

| 文件 | 改动 |
|------|------|
| `src/content/selection.ts` | 重写 `onMouseUp`：移除 300ms debounce 和自动 `showBubble`；新增 `createBall`/`removeBall`/`positionBall` 逻辑；新增 `mouseenter` 翻译触发；新增 `selectionchange` 监听 |
| `src/content/styles.css` | 新增 `.itranslate-selection-ball` 及 `:hover` 样式、`@keyframes itranslate-ball-glow` 光环动画 |

### 不变部分

- 翻译请求链路（retry → background → cache/API）
- 翻译气泡渲染（`showBubble` 函数改为由 ball hover 调用）
- 划词翻译开关机制（`enableSelection`/`disableSelection`）
- 工具函数（`isValidSelection`、`getBubblePosition`）
- 键盘 Esc 关闭

## 边界情况

- 已有气泡时选中新文字 → 先关闭旧气泡和旧小球
- iframe 内部选中 → 小球不出现在 iframe 内（内容脚本不注入 iframe）
- 输入框/textarea 内选中 → 小球正常出现
- 页面滚动 → 小球消失（滚动意味着用户已转移注意力，选区虽在但无实际意义）
