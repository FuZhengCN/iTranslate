# 翻译悬浮开关 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在页面右上角添加竖型迷你浮动面板，包含页面翻译按钮和划词翻译开关，无需打开 popup 即可操作。

**Architecture:** 新增 `src/content/floating-panel.ts`，通过 `PanelActions` 接口接收回调函数，与 `index.ts` 解耦。面板只负责 DOM 和状态展示，业务逻辑由 `index.ts` 通过 setter 驱动。

**Tech Stack:** TypeScript, Vitest + jsdom, 纯 DOM API

---

### 文件结构

| 文件 | 职责 |
|------|------|
| `src/content/floating-panel.ts` | 面板 DOM 创建/销毁、按钮状态切换、点击事件 → 调用 actions 回调 |
| `src/content/__tests__/floating-panel.test.ts` | 面板生命周期、状态切换、点击回调验证 |
| `src/content/styles.css` | 新增面板和按钮的 CSS 规则 |
| `src/content/index.ts` | 集成：init 时创建面板，翻译/划词关键节点同步状态 |

---

### Task 1: 在 styles.css 中添加浮动面板样式

**Files:**
- Modify: `src/content/styles.css`（末尾追加）

- [ ] **Step 1: 追加 CSS 规则**

在 `src/content/styles.css` 末尾追加：

```css
/* ── Floating Toggle Panel ── */
.itranslate-float-panel {
  all: initial;
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 99996;
  width: 32px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: linear-gradient(180deg, #FCFBF9, #F5F3EF);
  border: 1px solid rgba(107, 174, 207, 0.18);
  border-right: none;
  border-radius: 10px 0 0 10px;
  box-shadow: -2px 2px 14px rgba(42, 48, 56, 0.07);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.itranslate-float-btn-translate {
  all: unset;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--itranslate-gradient-brand);
  color: var(--itranslate-surface-white);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(107, 174, 207, 0.25);
  transition: background 0.2s;
}

.itranslate-float-btn-translate.undo {
  background: var(--itranslate-gradient-undo);
}

.itranslate-float-btn-translate.translating {
  animation: itranslate-float-pulse 0.8s ease-in-out infinite;
}

@keyframes itranslate-float-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.itranslate-float-btn-selection {
  all: unset;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  color: #6BAECF;
  border: 1px solid rgba(107, 174, 207, 0.2);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.itranslate-float-btn-selection.active {
  background: var(--itranslate-gradient-brand);
  color: var(--itranslate-surface-white);
  border-color: transparent;
}
```

- [ ] **Step 2: 构建验证**

```bash
npm run build
```

Expected: 构建成功，产物 `dist/assets/content.js` 中包含新增 CSS。

- [ ] **Step 3: Commit**

```bash
git add src/content/styles.css
git commit -m "feat: 添加浮动面板 CSS 规则"
```

---

### Task 2: 编写 floating-panel.ts 模块

**Files:**
- Create: `src/content/floating-panel.ts`

- [ ] **Step 1: 创建 floating-panel.ts**

```ts
interface PanelActions {
  onTranslate: () => void;
  onUndo: () => void;
  onSelectionToggle: (enable: boolean) => void;
}

let panelEl: HTMLElement | null = null;
let translateBtn: HTMLButtonElement | null = null;
let selectionBtn: HTMLButtonElement | null = null;
let translateState: 'translate' | 'translating' | 'undo' = 'translate';

export function createFloatingPanel(actions: PanelActions): void {
  if (panelEl) return;

  panelEl = document.createElement('div');
  panelEl.className = 'itranslate-float-panel';

  // 翻译按钮（上）
  translateBtn = document.createElement('button');
  translateBtn.className = 'itranslate-float-btn-translate';
  translateBtn.textContent = '文';
  translateBtn.title = '翻译此页';
  translateBtn.addEventListener('click', () => {
    if (translateState === 'translating') return;
    if (translateState === 'undo') {
      actions.onUndo();
    } else {
      actions.onTranslate();
    }
  });
  panelEl.appendChild(translateBtn);

  // 划词按钮（下）
  selectionBtn = document.createElement('button');
  selectionBtn.className = 'itranslate-float-btn-selection';
  selectionBtn.textContent = '选';
  selectionBtn.title = '划词翻译';
  selectionBtn.addEventListener('click', () => {
    const enabling = !selectionBtn?.classList.contains('active');
    actions.onSelectionToggle(enabling);
  });
  panelEl.appendChild(selectionBtn);

  document.body.appendChild(panelEl);
}

export function removeFloatingPanel(): void {
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
    translateBtn = null;
    selectionBtn = null;
  }
}

export function setTranslateState(state: 'translate' | 'translating' | 'undo'): void {
  translateState = state;
  if (!translateBtn) return;
  translateBtn.classList.remove('translating', 'undo');
  if (state === 'translating') {
    translateBtn.classList.add('translating');
    translateBtn.textContent = '...';
  } else if (state === 'undo') {
    translateBtn.classList.add('undo');
    translateBtn.textContent = '撤';
  } else {
    translateBtn.textContent = '文';
  }
}

export function setSelectionState(enabled: boolean): void {
  if (!selectionBtn) return;
  if (enabled) {
    selectionBtn.classList.add('active');
  } else {
    selectionBtn.classList.remove('active');
  }
}
```

- [ ] **Step 2: 类型检查**

```bash
npx tsc --noEmit
```

Expected: 无类型错误。

- [ ] **Step 3: Commit**

```bash
git add src/content/floating-panel.ts
git commit -m "feat: 新增 floating-panel 模块 — 面板创建与状态控制"
```

---

### Task 3: 编写浮动面板测试

**Files:**
- Create: `src/content/__tests__/floating-panel.test.ts`

- [ ] **Step 1: 创建测试文件**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

let createFloatingPanel: (actions: {
  onTranslate: () => void;
  onUndo: () => void;
  onSelectionToggle: (enable: boolean) => void;
}) => void;
let removeFloatingPanel: () => void;
let setTranslateState: (state: 'translate' | 'translating' | 'undo') => void;
let setSelectionState: (enabled: boolean) => void;

beforeEach(async () => {
  document.body.innerHTML = '';
  const mod = await import('../floating-panel');
  createFloatingPanel = mod.createFloatingPanel;
  removeFloatingPanel = mod.removeFloatingPanel;
  setTranslateState = mod.setTranslateState;
  setSelectionState = mod.setSelectionState;
});

describe('createFloatingPanel', () => {
  it('creates panel with container and two buttons', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);

    const panel = document.querySelector('.itranslate-float-panel');
    expect(panel).not.toBeNull();

    const translateBtn = panel!.querySelector('.itranslate-float-btn-translate');
    expect(translateBtn).not.toBeNull();
    expect(translateBtn!.textContent).toBe('文');

    const selectionBtn = panel!.querySelector('.itranslate-float-btn-selection');
    expect(selectionBtn).not.toBeNull();
    expect(selectionBtn!.textContent).toBe('选');
  });

  it('does not create duplicate panels', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    createFloatingPanel(actions);

    expect(document.querySelectorAll('.itranslate-float-panel').length).toBe(1);
  });

  it('panel has fixed position with right:0', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);

    const panel = document.querySelector('.itranslate-float-panel') as HTMLElement;
    const style = getComputedStyle(panel);
    expect(style.position).toBe('fixed');
    expect(style.right).toBe('0px');
  });
});

describe('setTranslateState', () => {
  it('sets button to "translate" state (glacier blue, 文字)', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translate');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.textContent).toBe('文');
    expect(btn.classList.contains('undo')).toBe(false);
    expect(btn.classList.contains('translating')).toBe(false);
  });

  it('sets button to "translating" state (pulse animation, 三点)', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translating');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.textContent).toBe('...');
    expect(btn.classList.contains('translating')).toBe(true);
  });

  it('sets button to "undo" state (warm terracotta, 撤字)', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('undo');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.textContent).toBe('撤');
    expect(btn.classList.contains('undo')).toBe(true);
  });

  it('ignores "translating" click when in translating state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translating');

    const btn = document.querySelector('.itranslate-float-btn-translate')! as HTMLButtonElement;
    btn.click();

    expect(actions.onTranslate).not.toHaveBeenCalled();
    expect(actions.onUndo).not.toHaveBeenCalled();
  });
});

describe('setSelectionState', () => {
  it('sets selection button to active (filled) state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);

    const btn = document.querySelector('.itranslate-float-btn-selection')!;
    expect(btn.classList.contains('active')).toBe(true);
  });

  it('sets selection button to inactive (hollow) state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);
    setSelectionState(false);

    const btn = document.querySelector('.itranslate-float-btn-selection')!;
    expect(btn.classList.contains('active')).toBe(false);
  });
});

describe('button click actions', () => {
  it('translate button click calls onTranslate when in translate state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translate');

    const btn = document.querySelector('.itranslate-float-btn-translate')! as HTMLButtonElement;
    btn.click();

    expect(actions.onTranslate).toHaveBeenCalledTimes(1);
    expect(actions.onUndo).not.toHaveBeenCalled();
  });

  it('translate button click calls onUndo when in undo state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('undo');

    const btn = document.querySelector('.itranslate-float-btn-translate')! as HTMLButtonElement;
    btn.click();

    expect(actions.onUndo).toHaveBeenCalledTimes(1);
    expect(actions.onTranslate).not.toHaveBeenCalled();
  });

  it('selection button click calls onSelectionToggle(true) when off', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);

    const btn = document.querySelector('.itranslate-float-btn-selection')! as HTMLButtonElement;
    btn.click();

    expect(actions.onSelectionToggle).toHaveBeenCalledWith(true);
  });

  it('selection button click calls onSelectionToggle(false) when on', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);

    const btn = document.querySelector('.itranslate-float-btn-selection')! as HTMLButtonElement;
    btn.click();

    expect(actions.onSelectionToggle).toHaveBeenCalledWith(false);
  });
});

describe('removeFloatingPanel', () => {
  it('removes panel from DOM', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    removeFloatingPanel();

    expect(document.querySelector('.itranslate-float-panel')).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试验证全部通过**

```bash
npx vitest run src/content/__tests__/floating-panel.test.ts --reporter=verbose
```

Expected: 11 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/content/__tests__/floating-panel.test.ts
git commit -m "test: 浮动面板 — 创建/状态切换/点击回调 11 用例"
```

---

### Task 4: 在 index.ts 中集成浮动面板

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: 添加 import**

在 `src/content/index.ts` 顶部现有 import 块末尾追加：

```ts
import { createFloatingPanel, setTranslateState, setSelectionState } from './floating-panel';
```

- [ ] **Step 2: 在 translatePage 中添加状态通知**

在 `translatePage()` 函数体内，`translateInProgress = true;` 之后添加：

```ts
setTranslateState('translating');
```

在翻译成功分支（`renderTranslations(response.results, extraction.sourceElements);` 之后、发送 `translationComplete` 之前）添加：

```ts
setTranslateState('undo');
```

在翻译失败分支（发送 `translationError` 之前）和 catch 块（`alert(...)` 之前）添加：

```ts
setTranslateState('translate');
```

- [ ] **Step 3: 在 undoTranslation handler 中添加状态通知**

在 `message.action === 'undoTranslation'` 处理块中，`stopObserving()` 之后添加：

```ts
setTranslateState('translate');
```

- [ ] **Step 4: 在 toggleSelection handler 中添加状态通知**

在 `message.action === 'toggleSelection'` 处理块中，`enableSelection()` / `disableSelection()` 调用之后添加：

```ts
setSelectionState(message.enabled);
```

- [ ] **Step 5: 在 init 末尾创建面板**

在 CSS 注入代码块（`document.head.appendChild(style)` 之后的 console.log）之后、所有函数定义完成之后的文件末尾，添加：

```ts
createFloatingPanel({
  onTranslate: () => translatePage('floating-panel'),
  onUndo: () => {
    removeTranslations();
    stopObserving();
    setTranslateState('translate');
  },
  onSelectionToggle: (enable: boolean) => {
    if (enable) {
      enableSelection();
    } else {
      disableSelection();
    }
    setSelectionState(enable);
  },
});
```

- [ ] **Step 6: 运行全部现有测试确保无回归**

```bash
npm test
```

Expected: 全部 90 tests PASS（原有 79 + 新增 11）。

- [ ] **Step 7: 构建验证**

```bash
npm run build
```

Expected: 构建成功。

- [ ] **Step 8: Commit**

```bash
git add src/content/index.ts
git commit -m "feat: index.ts 集成浮动面板 — init 创建 + 状态同步"
```

---
