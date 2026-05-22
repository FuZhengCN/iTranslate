# 泡泡框重设计

**日期：** 2026-05-22
**状态：** 待实施

## 设计决策

- 只展示译文，不重复展示原文（原文在页面上用户刚选中，无需重复）
- 放弃原文/译文双栏布局，信息层级更清晰
- 延续紫色渐变顶条，与全页翻译视觉风格统一

## 视觉方案：精炼白

```
┌──────────────────────────┐
│ ████████████████████████ │ ← 4px 紫色渐变顶条 (#4f46e5 → #7c3aed)
│                          │
│  未来研究所              │ ← 15px 深色译文，font-weight: 500
│                          │
│  📋 复制  📌 固定    ×  │ ← 底部按钮栏
└──────────────────────────┘
```

- 白底 (#fff)，12px 圆角，大阴影
- 入场动画 0.2s ease-out（淡入 + 上移 6px）
- `position: fixed`，`z-index: 99998`
- 宽度 320px，max-width calc(100vw - 16px)

## 交互

| 操作 | 行为 |
|------|------|
| 选中文字 | 300ms 防抖后弹出泡泡，显示"翻译中…" → 翻译完成替换为译文 |
| 复制 | 点击 📋 → 译文写入剪贴板 → 按钮短暂显示"已复制" |
| 固定 | 点击 📌 → 泡泡不再随点击外部消失 → 按钮变为高亮紫色"已固定" |
| 取消固定 | 再次点击 📌 → 恢复可点击外部关闭 |
| 关闭 | 点击 × 或（未固定时）点击泡泡外部 → 泡泡消失 |
| Esc | 泡泡消失（无论是否固定） |
| 新选区 | 旧泡泡消失，新泡泡出现 |

## 精确 CSS 规格

以下数值必须与 `file:///private/tmp/bubble-v2.html` 完全一致：

**泡泡容器 (`.itranslate-selection-bubble`)**
- `background: #fff`
- `border-radius: 12px`
- `box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)`
- `overflow: hidden`
- `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- `animation: itranslate-bubble-in 0.2s ease-out`（`from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) }`）
- 加 `itranslate-translation` class 防止提取器扫到

**紫色顶条 (`.itranslate-bubble-header`)**
- `height: 4px`
- `background: linear-gradient(90deg, #4f46e5, #7c3aed)`

**译文区域 (`.itranslate-bubble-body`)**
- `padding: 14px 16px 10px`
- 文字：`font-size: 15px; color: #1a1a2e; line-height: 1.6; font-weight: 500`

**按钮栏 (`.itranslate-bubble-actions`)**
- `display: flex; gap: 6px; padding: 0 16px 12px; align-items: center`
- `.spacer { flex: 1 }` 撑开左右

**操作按钮 (`.itranslate-bubble-btn`)**
- `height: 28px; padding: 0 10px`
- `border: 1px solid #e2e8f0; background: #fff; border-radius: 6px`
- `font-size: 11px; color: #666; cursor: pointer`
- `transition: all 0.12s`
- hover: `background: #f8f7fc; border-color: #c4b5fd; color: #7c3aed`
- active: `background: #ede9fe`
- 固定态 (`.pinned`): `background: #ede9fe; border-color: #c4b5fd; color: #7c3aed`

**关闭按钮 (`.itranslate-bubble-close`)**
- `width: 28px; height: 28px; border: none; background: none`
- `font-size: 16px; color: #bbb; cursor: pointer; border-radius: 6px`
- `display: flex; align-items: center; justify-content: center; flex-shrink: 0`
- hover: `background: #f5f5f5; color: #666`

**复制成功反馈**
- 按钮文字变为"已复制"，1.5s 后恢复为"复制"

## 改动文件

| 文件 | 改动 |
|------|------|
| `src/content/selection.ts` | 重写 `showBubble` 气泡 DOM + 按钮逻辑 + 固定状态管理 |
| `src/content/styles.css` | 替换所有泡泡相关样式 |
| `src/content/__tests__/selection.test.ts` | 更新测试 |

## 不动

- Background、extractor、renderer、popup、settings 全部不变
- `isValidSelection`、`getBubblePosition` 逻辑不变
- `initSelection`/`enableSelection`/`disableSelection` 接口不变
