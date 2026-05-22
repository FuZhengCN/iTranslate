# 泡泡框重设计 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 划词翻译泡泡框重设计：只展示译文，增加复制/固定按钮，视觉与 Popup 紫色渐变风格统一。

**Architecture:** 只改 selection.ts（DOM 结构 + 交互逻辑）和 styles.css（样式），background/extractor/renderer/popup 全部不动。

**Tech Stack:** TypeScript, Vitest + jsdom

---

## 文件结构

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `src/content/selection.ts` | 重写 `showBubble` 气泡 DOM、新增固定/复制逻辑 |
| 修改 | `src/content/styles.css` | 替换所有泡泡相关 CSS |
| 修改 | `src/content/__tests__/selection.test.ts` | 更新测试 |

---

### Task 1: 更新 selection.ts — 重写 showBubble

**Files:**
- Modify: `src/content/selection.ts`

- [ ] **Step 1: 添加 pinned 状态变量**

在 `let debounceTimer` 行后新增：

```typescript
let isPinned = false;
```

- [ ] **Step 2: 更新 hideBubble — Esc 可强制关闭**

```typescript
function hideBubble(force = false): void {
  if (isPinned && !force) return;
  if (currentBubble) {
    currentBubble.remove();
    currentBubble = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  isPinned = false;
}
```

- [ ] **Step 3: 重写 showBubble 的 DOM 创建部分（替换整个函数体）**

```typescript
async function showBubble(rect: DOMRect, text: string): Promise<void> {
  hideBubble(true);

  // ── 容器 ──
  const bubble = document.createElement('div');
  bubble.className = 'itranslate-selection-bubble itranslate-translation';

  // ── 紫色顶条 ──
  const bar = document.createElement('div');
  bar.className = 'itranslate-bubble-header';

  // ── 译文 ──
  const body = document.createElement('div');
  body.className = 'itranslate-bubble-body';
  const translation = document.createElement('div');
  translation.className = 'itranslate-bubble-text';
  translation.textContent = '翻译中…';
  body.appendChild(translation);

  // ── 按钮栏 ──
  const actions = document.createElement('div');
  actions.className = 'itranslate-bubble-actions';

  // 复制按钮
  const copyBtn = document.createElement('button');
  copyBtn.className = 'itranslate-bubble-btn';
  copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制';
  copyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(translation.textContent || '');
    copyBtn.innerHTML = '已复制';
    copyBtn.style.color = '#059669';
    copyBtn.style.borderColor = '#a7f3d0';
    setTimeout(() => {
      copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制';
      copyBtn.style.color = '';
      copyBtn.style.borderColor = '';
    }, 1500);
  });

  // 固定按钮
  const pinBtn = document.createElement('button');
  pinBtn.className = 'itranslate-bubble-btn';
  pinBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="18 11 12 5 6 11"/></svg> 固定';
  pinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isPinned = !isPinned;
    if (isPinned) {
      pinBtn.classList.add('pinned');
      pinBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="18 11 12 5 6 11"/></svg> 已固定';
    } else {
      pinBtn.classList.remove('pinned');
      pinBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="18 11 12 5 6 11"/></svg> 固定';
    }
  });

  // 弹性间距
  const spacer = document.createElement('span');
  spacer.style.flex = '1';

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'itranslate-bubble-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble(true);
  });

  actions.appendChild(copyBtn);
  actions.appendChild(pinBtn);
  actions.appendChild(spacer);
  actions.appendChild(closeBtn);

  // ── 组装 ──
  bubble.appendChild(bar);
  bubble.appendChild(body);
  bubble.appendChild(actions);
  document.body.appendChild(bubble);

  const pos = getBubblePosition(rect);
  bubble.style.top = `${pos.top}px`;
  bubble.style.left = `${pos.left}px`;

  currentBubble = bubble;

  // ── 翻译请求（复用现有逻辑） ──
  try {
    const response = await sendToBgWithRetry({
      action: 'translate',
      segments: [{ id: 'sel_0', text }],
    });

    if (response?.success && response.results?.[0]) {
      translation.textContent = response.results[0].translated;
      console.log(`[iTranslate] 🔍 Selection translated: "${text.slice(0, 40)}" → "${response.results[0].translated.slice(0, 40)}"`);
    } else {
      translation.textContent = '翻译失败';
      console.warn('[iTranslate] 🔍 Selection translation failed:', response);
    }
  } catch (err) {
    translation.textContent = '翻译失败';
    console.warn('[iTranslate] 🔍 Selection translation error:', err);
  }
}
```

- [ ] **Step 4: 更新 onDocumentClick — 尊重固定状态**

```typescript
function onDocumentClick(e: MouseEvent): void {
  if (currentBubble && !currentBubble.contains(e.target as Node) && !isPinned) {
    hideBubble(true);
  }
}
```

- [ ] **Step 5: 更新 onKeyDown — Esc 强制关闭**

```typescript
function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') hideBubble(true);
}
```

- [ ] **Step 6: 删除不再使用的常量**

删除 `const MAX_ORIGINAL_LENGTH = 80;`（不再展示原文）。

- [ ] **Step 7: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

Expected: 零错误

---

### Task 2: 替换泡泡 CSS 样式

**Files:**
- Modify: `src/content/styles.css`

- [ ] **Step 1: 找到并删除所有旧泡泡样式（从 `/* ── Selection Translation Bubble ── */` 注释开始到文件末尾），替换为以下内容：**

```css
/* ── Selection Translation Bubble ── */
.itranslate-selection-bubble {
  all: initial;
  position: fixed;
  z-index: 99998;
  width: 320px;
  max-width: calc(100vw - 16px);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  animation: itranslate-bubble-in 0.2s ease-out;
}

@keyframes itranslate-bubble-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.itranslate-bubble-header {
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
}

.itranslate-bubble-body {
  padding: 14px 16px 10px;
}

.itranslate-bubble-text {
  font-size: 15px;
  color: #1a1a2e;
  line-height: 1.6;
  font-weight: 500;
}

.itranslate-bubble-actions {
  display: flex;
  gap: 6px;
  padding: 0 16px 12px;
  align-items: center;
}

.itranslate-bubble-btn {
  height: 28px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 11px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: all 0.12s;
  user-select: none;
}

.itranslate-bubble-btn:hover {
  background: #f8f7fc;
  border-color: #c4b5fd;
  color: #7c3aed;
}

.itranslate-bubble-btn:active {
  background: #ede9fe;
}

.itranslate-bubble-btn.pinned {
  background: #ede9fe;
  border-color: #c4b5fd;
  color: #7c3aed;
}

.itranslate-bubble-close {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  font-size: 16px;
  color: #bbb;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.itranslate-bubble-close:hover {
  background: #f5f5f5;
  color: #666;
}
```

- [ ] **Step 2: 编译检查（CSS 不参与 tsc，直接过）**

---

### Task 3: 更新测试文件

**Files:**
- Modify: `src/content/__tests__/selection.test.ts`

- [ ] **Step 1: 重写测试文件**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../retry', () => ({
  sendToBgWithRetry: vi.fn().mockResolvedValue({
    success: true,
    results: [{ id: 'sel_0', original: 'Hello', translated: '你好' }],
    stats: { hits: 0, misses: 1 },
  }),
}));

let isValidSelection: () => boolean;
let getBubblePosition: (rect: DOMRect) => { top: number; left: number };

beforeEach(async () => {
  document.body.innerHTML =
    '<p id="main">Hello world this is a long enough sentence for testing.</p>' +
    '<p class="itranslate-translation">已经翻译过的内容</p>';

  const mod = await import('../selection');
  isValidSelection = mod.isValidSelection;
  getBubblePosition = mod.getBubblePosition;
});

describe('isValidSelection', () => {
  it('returns false when there is no selection', () => {
    expect(isValidSelection()).toBe(false);
  });
});

describe('getBubblePosition', () => {
  it('places bubble below selection by default', () => {
    const rect = new DOMRect(100, 200, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.top).toBeGreaterThan(200);
    expect(result.left).toBeGreaterThanOrEqual(0);
  });

  it('shifts above when near the bottom of viewport', () => {
    const nearBottom = window.innerHeight - 30;
    const rect = new DOMRect(100, nearBottom, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.top).toBeLessThan(rect.top);
  });

  it('clamps horizontal position to left edge', () => {
    const rect = new DOMRect(-100, 200, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.left).toBeGreaterThanOrEqual(8);
  });
});
```

- [ ] **Step 2: 运行新增测试**

```bash
npx vitest run src/content/__tests__/selection.test.ts
```

Expected: 4 条测试通过

---

### Task 4: 构建与全量验证

- [ ] **Step 1: TypeScript 编译 + 全量测试**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: 零错误，58 条测试通过

- [ ] **Step 2: 构建**

```bash
npm run build
```

Expected: tsc + vite build 成功

- [ ] **Step 3: 手动 smoke test**

Chrome 加载 `dist/`：
1. 选中英文文字 → 泡泡弹出，只显示中文译文
2. 复制按钮 → 译文写入剪贴板，按钮短暂变绿"已复制"
3. 固定按钮 → 切换固定态，按钮变紫色"已固定"
4. 固定后点击页面对应位置 → 泡泡不消失
5. 固定后按 Esc → 泡泡消失
6. 不固定时点击外部 → 泡泡消失

- [ ] **Step 4: 提交**

```bash
git add src/content/selection.ts src/content/styles.css src/content/__tests__/selection.test.ts docs/superpowers/specs/2026-05-22-bubble-redesign.md docs/superpowers/plans/2026-05-22-bubble-redesign-plan.md
git commit -m "feat: 重设计划词翻译泡泡 — 只展示译文 + 复制/固定按钮"
```
