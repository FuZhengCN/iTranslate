# 划词翻译触发优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将划词翻译从 300ms 自动触发改为小球+悬停触发，减少无意义翻译。

**Architecture:** 在 `selection.ts` 中重写 mouseup 处理逻辑 — 选中文字后创建小球（不再 debounce 后自动弹泡），小球 mouseenter 才触发翻译。小球与 selection 状态绑定，selectionchange + scroll 事件管理小球生命周期。

**Tech Stack:** TypeScript, CSS animation, Chrome Extension MV3

---

### Task 1: 小球 CSS 样式

**Files:**
- Modify: `src/content/styles.css` (追加样式)

- [ ] **Step 1: 追加小球样式到 styles.css**

在文件末尾追加以下内容：

```css
/* ── Selection Trigger Ball ── */
.itranslate-selection-ball {
  all: initial;
  position: fixed;
  z-index: 99997;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--itranslate-gradient-accent);
  box-shadow: 0 1px 4px var(--itranslate-accent-shadow);
  cursor: pointer;
  transition: width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.itranslate-selection-ball::after {
  content: '';
  display: block;
  opacity: 0;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  transition: opacity 0.15s ease;
}

.itranslate-selection-ball:hover {
  width: 20px;
  height: 20px;
  box-shadow: 0 0 0 6px rgba(107, 174, 207, 0.2), 0 2px 8px rgba(107, 174, 207, 0.5);
}

.itranslate-selection-ball:hover::after {
  content: '译';
  opacity: 1;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/content/styles.css
git commit -m "feat: 划词翻译小球 CSS 样式 — 12px 圆点 + hover 放大光环"
```

---

### Task 2: 重写 selection.ts 交互逻辑

**Files:**
- Modify: `src/content/selection.ts` (核心改动)

- [ ] **Step 1: 移除 debounce 常量和 timer 变量**

在 `selection.ts` 顶部，将：

```ts
let currentBubble: HTMLElement | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;
```

改为：

```ts
let currentBubble: HTMLElement | null = null;
let currentBall: HTMLElement | null = null;
```

- [ ] **Step 2: 新增小球管理函数**

在 `hideBubble` 函数之后、`showBubble` 函数之前，插入以下代码：

```ts
function removeBall(): void {
  if (currentBall) {
    currentBall.remove();
    currentBall = null;
  }
}

function positionBall(rect: DOMRect): { top: number; left: number } {
  const BALL_SIZE = 12;
  const GAP = 2;

  let top = rect.top - BALL_SIZE - GAP;
  let left = rect.right + GAP;

  // Vertical boundary: don't go above viewport
  if (top < GAP) top = rect.bottom + GAP;

  // Horizontal boundary: don't go past right edge
  if (left + BALL_SIZE > window.innerWidth - GAP) {
    left = rect.left - BALL_SIZE - GAP;
  }

  return { top, left };
}

function createBall(rect: DOMRect): HTMLElement {
  removeBall();

  const ball = document.createElement('div');
  ball.className = 'itranslate-selection-ball';
  const pos = positionBall(rect);
  ball.style.top = `${pos.top}px`;
  ball.style.left = `${pos.left}px`;

  ball.addEventListener('mouseenter', () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const text = sel.toString().trim();
    if (!text) return;
    removeBall();
    showBubble(rect, text);
  });

  document.body.appendChild(ball);
  currentBall = ball;
  return ball;
}
```

- [ ] **Step 3: 重写 onMouseUp 函数**

将现有的 `onMouseUp` 函数（行 158-179）替换为：

```ts
function onMouseUp(e: MouseEvent): void {
  // Ignore clicks inside the bubble
  if (currentBubble && currentBubble.contains(e.target as Node)) {
    return;
  }

  // Defer to next tick so getSelection reflects the completed selection
  setTimeout(() => {
    if (!isValidSelection()) {
      removeBall();
      return;
    }

    const sel = window.getSelection()!;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    console.log(`[iTranslate] 🔍 Selection detected — "${sel.toString().trim().slice(0, 50)}"`);
    createBall(rect);
  }, 0);
}
```

- [ ] **Step 4: 新增加 selectionchange 和 scroll 监听**

在 `hideBubble` 函数中，现有代码只移除 bubble。改为同时清除选区：

```ts
function hideBubble(): void {
  if (currentBubble) {
    currentBubble.remove();
    currentBubble = null;
  }
  // Clear text selection so ball doesn't reappear
  window.getSelection()?.removeAllRanges();
  removeBall();
}
```

在 `let selectionEnabled = false;` 之前，新增两个监听函数：

```ts
function onSelectionChange(): void {
  if (!selectionEnabled) return;
  // If selection is cleared (e.g., user clicks elsewhere), remove ball
  if (!isValidSelection() && currentBall) {
    removeBall();
  }
}

function onScroll(): void {
  if (currentBall) {
    removeBall();
  }
}
```

- [ ] **Step 5: 更新 enableSelection/disableSelection 注册新监听**

在 `enableSelection` 中，添加 `selectionchange` 和 `scroll` 监听：

```ts
export function enableSelection(): void {
  if (selectionEnabled) {
    console.log('[iTranslate] 🔍 enableSelection: already enabled, skipping');
    return;
  }
  selectionEnabled = true;
  console.log('[iTranslate] 🔍 enableSelection: injecting selection style + adding listeners');
  injectSelectionStyle();
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('selectionchange', onSelectionChange);
  window.addEventListener('scroll', onScroll, { passive: true });
  console.log('[iTranslate] 🔍 enableSelection: done — selectionEnabled=true, listeners attached');
}
```

在 `disableSelection` 中，移除对应监听：

```ts
export function disableSelection(): void {
  if (!selectionEnabled) {
    console.log('[iTranslate] 🔍 disableSelection: already disabled, skipping');
    return;
  }
  selectionEnabled = false;
  console.log('[iTranslate] 🔍 disableSelection: removing bubble, ball, style, and listeners');
  hideBubble();
  removeBall();
  removeSelectionStyle();
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('selectionchange', onSelectionChange);
  window.removeEventListener('scroll', onScroll);
  console.log('[iTranslate] 🔍 disableSelection: done — selectionEnabled=false');
}
```

- [ ] **Step 6: 验证 TypeScript 编译**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/content/selection.ts
git commit -m "feat: 划词翻译小球+悬停触发替代 300ms 自动触发"
```

---

### Task 3: 更新单元测试

**Files:**
- Modify: `src/content/__tests__/selection.test.ts`

- [ ] **Step 1: 更新测试以覆盖新行为**

将测试文件内容替换为：

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

vi.mock('../retry', () => ({
  sendToBgWithRetry: vi.fn().mockResolvedValue({
    success: true,
    results: [{ id: 'sel_0', original: 'Hello', translated: '你好' }],
    stats: { hits: 0, misses: 1 },
  }),
}));

let isValidSelection: () => boolean;
let getBubblePosition: (rect: DOMRect) => { top: number; left: number };
let enableSelection: () => void;
let disableSelection: () => void;
let isSelectionEnabled: () => boolean;

beforeEach(async () => {
  document.body.innerHTML =
    '<p id="main">Hello world this is a long enough sentence for testing.</p>' +
    '<p class="itranslate-translation">已经翻译过的内容</p>';

  const mod = await import('../selection');
  isValidSelection = mod.isValidSelection;
  getBubblePosition = mod.getBubblePosition;
  enableSelection = mod.enableSelection;
  disableSelection = mod.disableSelection;
  isSelectionEnabled = mod.isSelectionEnabled;
});

afterEach(() => {
  // Clean up listeners
  if (isSelectionEnabled()) disableSelection();
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

describe('selection ball creation on mouseup', () => {
  it('creates a ball element when text is selected and mouseup fires', async () => {
    enableSelection();

    // Simulate text selection
    const range = document.createRange();
    const textNode = document.getElementById('main')!.firstChild!;
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    window.getSelection()!.addRange(range);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    // Ball is created in setTimeout(fn, 0) — wait for it
    await new Promise(r => setTimeout(r, 10));

    const ball = document.querySelector('.itranslate-selection-ball');
    expect(ball).not.toBeNull();
  });

  it('does not create a ball when there is no valid selection', async () => {
    enableSelection();
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    await new Promise(r => setTimeout(r, 10));

    const ball = document.querySelector('.itranslate-selection-ball');
    expect(ball).toBeNull();
  });
});

describe('selection ball removal on selectionchange', () => {
  it('removes ball when selection is cleared', async () => {
    enableSelection();

    // Create a selection first
    const range = document.createRange();
    const textNode = document.getElementById('main')!.firstChild!;
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    window.getSelection()!.addRange(range);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 10));

    expect(document.querySelector('.itranslate-selection-ball')).not.toBeNull();

    // Clear selection — trigger selectionchange
    window.getSelection()!.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange', { bubbles: true }));

    expect(document.querySelector('.itranslate-selection-ball')).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试验证通过**

```bash
npx vitest run src/content/__tests__/selection.test.ts --reporter=verbose
```
Expected: All tests PASS (7 tests).

- [ ] **Step 3: Commit**

```bash
git add src/content/__tests__/selection.test.ts
git commit -m "test: 更新划词翻译测试 — 小球创建/移除 + selectionchange 行为"
```

---

### Task 4: 运行全量测试 + 构建验证

**Files:** None (验证步骤)

- [ ] **Step 1: 运行全部测试**

```bash
npx vitest run --reporter=verbose
```
Expected: 所有 69~70 个测试通过（新增 3 个测试）。

- [ ] **Step 2: 完整构建**

```bash
npm run build
```
Expected: Build 成功，dist/ 下有完整产物。

- [ ] **Step 3: Commit（如有修复）**

```bash
git add -A
git commit -m "chore: 全量测试 + 构建验证通过"
```
（仅当有修复时才需要此步骤）
