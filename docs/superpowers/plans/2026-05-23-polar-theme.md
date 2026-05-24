# 极地冰川主题 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `src/shared/theme.css` 中的 33 个 CSS 变量值从靛紫主题替换为极地冰川主题

**Architecture:** 单一文件值替换，CSS 变量名和引用关系不变。渐变变量由 brand primitives 组合派生，语义色/调试色保持原值

**Tech Stack:** CSS Custom Properties

---

### Task 1: 替换 theme.css 全部变量值

**Files:**
- Modify: `src/shared/theme.css`（完整重写）

- [ ] **Step 1: 用极地冰川色值替换 theme.css**

```css
/* ═══════════════════════════════════════════════════════════
   iTranslate Design Tokens — 极地冰川主题
   ═══════════════════════════════════════════════════════════ */

:root {
  /* ── Brand Primitives ──────────────────────────────── */
  --itranslate-brand-indigo: #94C8E0;
  --itranslate-brand-purple: #6BAECF;
  --itranslate-brand-indigo-hover: #62B8D9;
  --itranslate-brand-purple-hover: #62B8D9;

  /* ── Gradients ─────────────────────────────────────── */
  --itranslate-gradient-brand: linear-gradient(135deg, var(--itranslate-brand-purple), var(--itranslate-brand-purple-hover));
  --itranslate-gradient-brand-hover: linear-gradient(135deg, var(--itranslate-brand-purple-hover), #4FA8CC);
  --itranslate-gradient-accent: linear-gradient(90deg, var(--itranslate-brand-purple), var(--itranslate-brand-purple-hover));

  /* ── Brand Light / Alpha Variants ──────────────────── */
  --itranslate-brand-bg-soft: #F5F3EF;
  --itranslate-brand-100: #E8F4F8;
  --itranslate-brand-200: #B8DCEB;
  --itranslate-accent-bg-subtle: rgba(107, 174, 207, 0.12);
  --itranslate-accent-bg-hover: rgba(107, 174, 207, 0.25);
  --itranslate-accent-selection: rgba(148, 200, 224, 0.22);
  --itranslate-accent-border: rgba(148, 200, 224, 0.50);
  --itranslate-accent-border-hover: rgba(107, 174, 207, 0.55);
  --itranslate-accent-shadow: rgba(107, 174, 207, 0.28);

  /* ── Surfaces / Backgrounds ────────────────────────── */
  --itranslate-surface-white: #ffffff;
  --itranslate-surface-inverse: #2A3038;
  --itranslate-surface-hover: #EDEAE6;
  --itranslate-surface-secondary-hover: #F5F3EF;

  /* ── Text ──────────────────────────────────────────── */
  --itranslate-text-primary: #2A3038;
  --itranslate-text-secondary: #5A6270;
  --itranslate-text-muted: #9BA8B5;
  --itranslate-text-disabled: #C5CDD5;
  --itranslate-text-translated: #2A3038;
  --itranslate-text-on-brand: #2A3038;
  --itranslate-text-icon: #5A6270;

  /* ── Borders ───────────────────────────────────────── */
  --itranslate-border-primary: #D9E4EA;
  --itranslate-border-footer: #D9E4EA;

  /* ── Semantic: Success ─────────────────────────────── */
  --itranslate-success-bg: #f0fff4;
  --itranslate-success-border: #c6f6d5;
  --itranslate-success-text: #276749;

  /* ── Semantic: Error ───────────────────────────────── */
  --itranslate-error-bg: #fff5f5;
  --itranslate-error-border: #feb2b2;
  --itranslate-error-text: #c53030;

  /* ── Copy Success ──────────────────────────────────── */
  --itranslate-copy-success-text: #059669;
  --itranslate-copy-success-border: #a7f3d0;

  /* ── Misc ──────────────────────────────────────────── */
  --itranslate-close-color: #9BA8B5;
  --itranslate-toast-dot-bg: rgba(255, 255, 255, 0.3);
  --itranslate-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --itranslate-shadow-bubble: 0 8px 32px rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.04);

  /* ── Debug Visualization (dev only) ────────────────── */
  --itranslate-debug-kept-outline: rgba(34, 197, 94, 0.7);
  --itranslate-debug-kept-bg: rgba(34, 197, 94, 0.08);
  --itranslate-debug-skipped-outline: rgba(239, 68, 68, 0.7);
  --itranslate-debug-skipped-bg: rgba(239, 68, 68, 0.08);
}
```

- [ ] **Step 2: 构建验证**

```bash
npm run build
```
Expected: 28 modules transformed, build success

- [ ] **Step 3: 类型检查**

```bash
npx tsc --noEmit
```
Expected: no output (no errors)

- [ ] **Step 4: 运行测试**

```bash
npm test
```
Expected: 9 files, 66 tests passed

- [ ] **Step 5: 修复 index.ts toast 文字颜色**

原主题 `text-on-brand: #ffffff` 同时服务于"渐变按钮上的白字"和"深色 Toast 上的白字"两个场景。新主题渐变按钮变浅蓝（需深色文字），但 Toast 背景仍是深色（`surface-inverse: #2A3038`），`text-on-brand: #2A3038` 会导致深底深字不可见。

修改 `src/content/index.ts:76`：
```ts
// 将 color:var(--itranslate-text-on-brand) 改为 var(--itranslate-surface-white)
toast.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:var(--itranslate-surface-inverse);color:var(--itranslate-surface-white);padding:10px 24px;border-radius:8px;font-size:14px;z-index:99999;pointer-events:none;';
```

- [ ] **Step 7: 确认无遗漏硬编码色值**

```bash
grep -rn '#[0-9a-fA-F]\{3,6\}\|rgba(' src/shared/theme.css
```
Expected: 仅新主题色值，无旧值残留

- [ ] **Step 8: 提交**

```bash
git add src/shared/theme.css
git commit -m "feat: 极地冰川主题 — 米白基底 + 冰川浅蓝点缀"
```
