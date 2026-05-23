# 极地冰川主题 · 设计规范

## 概述

将 iTranslate 扩展从靛紫渐变主题切换为 **极地清冷风**，米白基底搭配冰川浅蓝点缀，低饱和撞色，哑光质感。

### 用户指定四核心色

| 角色 | 色值 | 用途 |
|------|------|------|
| 极地米白 | `#F5F3EF` | 页面大面积背景、行背景（brand-bg-soft） |
| 冰川浅蓝 | `#94C8E0` | 边框、分割线、点缀色（brand-indigo） |
| 深炭灰 | `#2A3038` | 正文标题字体色（text-primary） |
| 冰荧蓝 | `#62B8D9` | hover 动效、重点标签（brand-hover） |

### 微调衍生色

| 角色 | 色值 | 映射变量 |
|------|------|----------|
| 纯白卡片 | `#ffffff` | `--itranslate-surface-white`（不变，卡片层浮于米白底上） |
| 冰川蓝加深 | `#6BAECF` | `--itranslate-brand-purple`（交互主色，比 #94C8E0 深 12%） |
| 冰蓝淡底 | `#E8F4F8` | `--itranslate-brand-100`（按钮按下态等） |
| 浅冰蓝 | `#B8DCEB` | `--itranslate-brand-200`（加载点、hover 边框） |
| 暖灰加深 | `#EDEAE6` | `--itranslate-surface-hover`（米白加深，hover 反馈） |
| 冰蓝灰 | `#D9E4EA` | `--itranslate-border-primary` |
| 冷灰 | `#9BA8B5` | `--itranslate-text-muted` |
| 浅冷灰 | `#C5CDD5` | `--itranslate-text-disabled` |
| 炭灰变体 | `#5A6270` | `--itranslate-text-secondary` |

### 渐变策略

- **保留微渐变**：按钮（135deg）、顶条（90deg），同一色系内浅→深
- **弃用跨色渐变**：Logo 从渐变文字改为纯色 `#6BAECF`（渐变文字在浅底上不可见）
- **渐变组合**：`linear-gradient(135deg, #6BAECF, #62B8D9)` — 品牌主色→冰荧蓝

## 完整 33 变量映射

### Brand Primitives
```
--itranslate-brand-indigo:       #94C8E0   (原 #4f46e5)  冰川浅蓝 — 边框/点缀
--itranslate-brand-purple:       #6BAECF   (原 #7c3aed)  冰川蓝加深 — 交互主色
--itranslate-brand-indigo-hover: #62B8D9   (原 #4338ca)  冰荧蓝 — hover 强调
--itranslate-brand-purple-hover: #62B8D9   (原 #6d28d9)  冰荧蓝 — hover 强调
```

### Gradients（由 primitives 组合，值自动派生）
```
--itranslate-gradient-brand:       linear-gradient(135deg, var(--itranslate-brand-purple), var(--itranslate-brand-purple-hover))
--itranslate-gradient-brand-hover: linear-gradient(135deg, var(--itranslate-brand-purple-hover), #4FA8CC)
--itranslate-gradient-accent:      linear-gradient(90deg, var(--itranslate-brand-purple), var(--itranslate-brand-purple-hover))
```

### Brand Light / Alpha Variants
```
--itranslate-brand-bg-soft:      #F5F3EF   (原 #f8f7fc)  极地米白
--itranslate-brand-100:          #E8F4F8   (原 #ede9fe)  冰蓝淡底
--itranslate-brand-200:          #B8DCEB   (原 #c4b5fd)  浅冰蓝 — 加载点/hover 边框
--itranslate-accent-bg-subtle:   rgba(107,174,207,0.12) (原 rgba(124,58,237,0.08))
--itranslate-accent-bg-hover:    rgba(107,174,207,0.25) (原 rgba(124,58,237,0.15))
--itranslate-accent-selection:   rgba(148,200,224,0.22) (原 rgba(124,58,237,0.18))
--itranslate-accent-border:      rgba(148,200,224,0.50) (原 rgba(124,58,237,0.2))
--itranslate-accent-border-hover:rgba(107,174,207,0.55) (原 rgba(124,58,237,0.3))
--itranslate-accent-shadow:      rgba(107,174,207,0.28) (原 rgba(79,70,229,0.4))
```

### Surfaces
```
--itranslate-surface-white:            #ffffff   (不变)
--itranslate-surface-inverse:          #2A3038   (原 #1a1a2e)  深炭灰
--itranslate-surface-hover:            #EDEAE6   (原 #f5f5f5)  暖灰加深
--itranslate-surface-secondary-hover:  #F5F3EF   (原 #f7fafc)  米白 hover
```

### Text
```
--itranslate-text-primary:    #2A3038   (原 #1a1a2e)  深炭灰
--itranslate-text-secondary:  #5A6270   (原 #4a5568)  炭灰变体
--itranslate-text-muted:      #9BA8B5   (原 #a0aec0)  冷灰
--itranslate-text-disabled:   #C5CDD5   (原 #cbd5e0)  浅冷灰
--itranslate-text-translated: #2A3038   (原 #334155)  深炭灰（翻译文本）
--itranslate-text-on-brand:   #2A3038   (原 #ffffff)  渐变/浅底上深色文字
--itranslate-text-icon:       #5A6270   (原 #666666)  图标文字
```

### Borders
```
--itranslate-border-primary: #D9E4EA   (原 #e2e8f0)  冰蓝灰
--itranslate-border-footer:  #D9E4EA   (原 #f0f0f0)  统一边框色
```

### Semantic（不变 — 语义色与品牌色独立）
```
--itranslate-success-bg:       #f0fff4
--itranslate-success-border:   #c6f6d5
--itranslate-success-text:     #276749
--itranslate-error-bg:         #fff5f5
--itranslate-error-border:     #feb2b2
--itranslate-error-text:       #c53030
--itranslate-copy-success-text:   #059669
--itranslate-copy-success-border: #a7f3d0
```

### Misc
```
--itranslate-close-color:    #9BA8B5   (原 #bbbbbb)  关闭按钮
--itranslate-toast-dot-bg:   rgba(255,255,255,0.3)    Toast 加载点
--itranslate-shadow-sm:      0 1px 3px rgba(0,0,0,0.06) (原 0.08)
--itranslate-shadow-bubble:  0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)
```

### Debug Visualization（不变）
```
--itranslate-debug-kept-outline:    rgba(34,197,94,0.7)
--itranslate-debug-kept-bg:         rgba(34,197,94,0.08)
--itranslate-debug-skipped-outline: rgba(239,68,68,0.7)
--itranslate-debug-skipped-bg:      rgba(239,68,68,0.08)
```

## 视觉层级规则

1. **米白铺底** — `#F5F3EF` 用于页面底色、行背景、hover 态
2. **纯白卡片** — `#ffffff` 用于卡片容器，浮于米白底上形成双层质感
3. **冰川蓝点睛** — `#6BAECF` 按钮/开关/焦点环等交互元素，`#94C8E0` 边框/分割线
4. **深灰承载文字** — `#2A3038` 正文，`#5A6270` 标签
5. **低对比柔和观感** — 无强对比撞色，阴影减弱，过渡柔和

## 实施范围

- **仅修改** `src/shared/theme.css` 一个文件（约 33 行值替换）
- 无需修改任何 CSS/TS/HTML 文件（变量引用全部不变）
- icon.svg 不变（静态构建资源）

## 验证

- `npm run build` 构建成功
- `npm test` 66 个测试通过
- 在 Chrome 中加载扩展，检查 popup/settings/content 三个上下文的视觉效果
