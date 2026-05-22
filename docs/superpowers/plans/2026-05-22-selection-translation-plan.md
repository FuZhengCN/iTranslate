# 划词翻译 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用户选中页面文字后自动弹出翻译气泡，作为短文本被阈值过滤时的兜底翻译方案。

**Architecture:** 不加新 Background 消息——复用消息链路 `{ action: 'translate', segments }`。新增 `src/content/selection.ts` 处理选区监听和 fixed 定位气泡的创建/销毁。Background/extractor/renderer/popup 全部不变。

**Tech Stack:** TypeScript, Vitest + jsdom

---

## 文件结构

| 操作 | 文件 | 职责 |
|------|------|------|
| 新增 | `src/content/selection.ts` | 选区监听、校验、气泡 DOM 创建/定位/销毁 |
| 修改 | `src/content/styles.css` | 追加 `.itranslate-selection-bubble` 样式 |
| 修改 | `src/content/index.ts` | export `sendToBgWithRetry` + import `initSelection()` + 调用 |
| 新增 | `src/content/__tests__/selection.test.ts` | `isValidSelection` / `getBubblePosition` 单元测试 |

---

### Task 1: 在 content/index.ts 中导出 sendToBgWithRetry

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: 将 `async function` 改为 `export async function`**

找到第 9 行：
```typescript
async function sendToBgWithRetry(message: unknown, retries = 3, delayMs = 600): Promise<any> {
```

改为：
```typescript
export async function sendToBgWithRetry(message: unknown, retries = 3, delayMs = 600): Promise<any> {
```

- [ ] **Step 2: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

Expected: 零错误

---

### Task 2: 创建 selection.ts 模块

**Files:**
- Create: `src/content/selection.ts`

- [ ] **Step 1: 编写 selection.ts**

```typescript
import { sendToBgWithRetry } from './index';

let currentBubble: HTMLElement | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;
const MAX_ORIGINAL_LENGTH = 80;

export function isValidSelection(): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;

  const text = sel.toString().trim();
  if (text.length === 0) return false;

  // 选区在已翻译元素内则跳过，避免对已有翻译二次弹窗
  const range = sel.getRangeAt(0);
  let node: Node | null = range.commonAncestorContainer;
  while (node) {
    if (node instanceof Element && node.classList.contains('itranslate-translation')) {
      return false;
    }
    node = node.parentNode;
  }

  return true;
}

export function getBubblePosition(rect: DOMRect): { top: number; left: number } {
  const GAP = 8;
  const bubbleWidth = 320;
  const bubbleMaxHeight = 200;

  // 默认放选区下方，水平居中
  let top = rect.bottom + GAP + window.scrollY;
  let left = rect.left + rect.width / 2 - bubbleWidth / 2 + window.scrollX;

  // 下方空间不足 → 放选区上方
  if (top + bubbleMaxHeight > window.scrollY + window.innerHeight) {
    top = rect.top - GAP - bubbleMaxHeight + window.scrollY;
    if (top < window.scrollY) top = window.scrollY + GAP;
  }

  // 水平边界保护
  if (left < window.scrollX + GAP) left = window.scrollX + GAP;
  if (left + bubbleWidth > window.scrollX + window.innerWidth) {
    left = window.scrollX + window.innerWidth - bubbleWidth - GAP;
  }

  return { top, left };
}

function hideBubble(): void {
  if (currentBubble) {
    currentBubble.remove();
    currentBubble = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

async function showBubble(rect: DOMRect, text: string): Promise<void> {
  hideBubble();

  const bubble = document.createElement('div');
  bubble.className = 'itranslate-selection-bubble';

  const header = document.createElement('div');
  header.className = 'itranslate-bubble-header';

  const original = document.createElement('div');
  original.className = 'itranslate-bubble-original';
  original.textContent = text.length > MAX_ORIGINAL_LENGTH
    ? text.slice(0, MAX_ORIGINAL_LENGTH) + '…'
    : text;

  const translation = document.createElement('div');
  translation.className = 'itranslate-bubble-translation';
  translation.textContent = '翻译中…';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'itranslate-bubble-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble();
  });

  bubble.appendChild(header);
  bubble.appendChild(original);
  bubble.appendChild(translation);
  bubble.appendChild(closeBtn);
  document.body.appendChild(bubble);

  const pos = getBubblePosition(rect);
  bubble.style.top = `${pos.top}px`;
  bubble.style.left = `${pos.left}px`;

  currentBubble = bubble;

  // 复用 Background 翻译链路（含重试、缓存）
  try {
    const response = await sendToBgWithRetry({
      action: 'translate',
      segments: [{ id: 'sel_0', text }],
    });

    if (response?.success && response.results?.[0]) {
      translation.textContent = response.results[0].translated;
    } else {
      translation.textContent = '翻译失败';
    }
  } catch {
    translation.textContent = '翻译失败';
  }
}

function onMouseUp(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!isValidSelection()) return;

    const sel = window.getSelection()!;
    const text = sel.toString().trim();
    const rect = sel.getRangeAt(0).getBoundingClientRect();

    showBubble(rect, text);
  }, DEBOUNCE_MS);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') hideBubble();
}

function onDocumentClick(e: MouseEvent): void {
  if (currentBubble && !currentBubble.contains(e.target as Node)) {
    hideBubble();
  }
}

export function initSelection(): void {
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onDocumentClick);
}
```

- [ ] **Step 2: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

Expected: 零错误

---

### Task 3: 追加气泡 CSS 样式

**Files:**
- Modify: `src/content/styles.css`

- [ ] **Step 1: 在 styles.css 末尾追加以下样式**

```css
/* ── Selection Translation Bubble ── */
.itranslate-selection-bubble {
  all: initial;
  position: fixed;
  z-index: 99998;
  width: 320px;
  max-width: calc(100vw - 16px);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  animation: itranslate-bubble-in 0.15s ease-out;
}

@keyframes itranslate-bubble-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.itranslate-bubble-header {
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
}

.itranslate-bubble-original {
  padding: 10px 14px 4px;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.itranslate-bubble-translation {
  padding: 4px 14px 14px;
  font-size: 14px;
  color: #1a1a2e;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.itranslate-bubble-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  line-height: 1;
  padding: 0;
}

.itranslate-bubble-close:hover {
  background: #f0f0f0;
  color: #333;
}
```

- [ ] **Step 2: 编译检查（CSS 不参与 tsc，直接过）**

---

### Task 4: 在 content/index.ts 中接线

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: 在 import 区末尾追加一行**

在最后一条 import（`import { startObserving, stopObserving } from './observer';`）之后新增：

```typescript
import { initSelection } from './selection';
```

- [ ] **Step 2: 在文件末尾追加调用**

在 `chrome.runtime.onMessage.addListener(...);` 块之后，文件最后，新增：

```typescript
initSelection();
```

- [ ] **Step 3: TypeScript 编译检查**

```bash
npx tsc --noEmit
```

Expected: 零错误

---

### Task 5: 编写单元测试

**Files:**
- Create: `src/content/__tests__/selection.test.ts`

- [ ] **Step 1: 编写测试文件**

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

vi.stubGlobal('chrome', {
  runtime: {
    sendMessage: vi.fn().mockResolvedValue({
      success: true,
      results: [{ id: 'sel_0', original: 'Hello', translated: '你好' }],
      stats: { hits: 0, misses: 1 },
    }),
  },
});

let dom: JSDOM;

beforeEach(async () => {
  dom = new JSDOM(
    '<!DOCTYPE html><html><body>' +
    '<p id="main">Hello world this is a long enough sentence for testing.</p>' +
    '<p class="itranslate-translation">已经翻译过的内容</p>' +
    '</body></html>',
    { url: 'http://localhost' }
  );
  globalThis.window = dom.window as any;
  globalThis.document = dom.window.document;
});

afterEach(() => {
  dom.window.close();
});

describe('isValidSelection', () => {
  it('returns false when there is no selection', async () => {
    const { isValidSelection } = await import('../selection');
    // jsdom getSelection() returns a Selection with rangeCount=0 by default
    const sel = dom.window.getSelection();
    expect(sel).not.toBeNull();
    expect(sel!.rangeCount).toBe(0);

    Object.defineProperty(dom.window, 'getSelection', {
      value: () => sel,
      writable: true,
    });

    // With no range, our guard (rangeCount === 0) returns false
    // but since our function uses window.getSelection() not the dom.window one,
    // we stub globalThis.getSelection
    const origGetSelection = (globalThis as any).getSelection;
    (globalThis as any).getSelection = () => sel;

    expect(isValidSelection()).toBe(false);

    (globalThis as any).getSelection = origGetSelection;
  });
});

describe('getBubblePosition', () => {
  it('places bubble below selection by default', async () => {
    const { getBubblePosition } = await import('../selection');
    const rect = new DOMRect(100, 200, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.top).toBeGreaterThan(200);
    expect(result.left).toBeGreaterThanOrEqual(0);
  });

  it('shifts above when near the bottom of viewport', async () => {
    const { getBubblePosition } = await import('../selection');
    const nearBottom = (globalThis as any).window.innerHeight - 30;
    const rect = new DOMRect(100, nearBottom, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.top).toBeLessThan(rect.top);
  });

  it('clamps horizontal position to left edge', async () => {
    const { getBubblePosition } = await import('../selection');
    const rect = new DOMRect(-100, 200, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.left).toBeGreaterThanOrEqual(8);
  });
});
```

**注意：** 只测纯函数 `isValidSelection` 和 `getBubblePosition`。`showBubble`/`hideBubble`/`initSelection` 涉及 DOM 操作和异步事件，jsdom 模拟 `getSelection`/`getBoundingClientRect` 比较 hacky，投入产出比不高，由手动 smoke test 覆盖。

- [ ] **Step 2: 运行新增测试**

```bash
npx vitest run src/content/__tests__/selection.test.ts
```

Expected: 3 条测试通过

---

### Task 6: 构建与全量验证

- [ ] **Step 1: 构建**

```bash
npm run build
```

Expected: tsc + vite build 成功

- [ ] **Step 2: 手动 smoke test**

Chrome 加载 `dist/` 目录：
1. 打开任意英文网页
2. 选中一段短文本（如一个按钮文字或导航标签）
3. 确认 0.3s 后弹出带紫色渐变顶条的气泡
4. 确认原文（灰色）和译文正确显示
5. 点击气泡外部 → 气泡消失
6. 按 Esc → 气泡消失
7. 在已翻译区域内选中文字（`.itranslate-translation` 内） → 不弹出气泡

- [ ] **Step 3: 运行全部测试确认无回归**

```bash
npm test
```

Expected: 57 条测试（原有 54 + 新增 3）全部通过

- [ ] **Step 4: 提交**

```bash
git add src/content/selection.ts src/content/__tests__/selection.test.ts src/content/styles.css src/content/index.ts
git commit -m "feat: 新增划词翻译气泡，兜底短文本阈值过滤场景"
```
