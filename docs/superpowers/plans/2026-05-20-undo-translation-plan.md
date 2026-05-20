# Undo Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "Undo Translation" popup button that removes all translation elements from the page and restores the original content.

**Architecture:** Minimal changes across 3 files. `renderer.ts` gets a `removeTranslations()` function that removes all `.itranslate-translation` DOM elements. `index.ts` handles the `undoTranslation` message and cleans up before re-translation. `popup.ts` tracks translation state to toggle between "Translate This Page" and "Undo Translation."

**Tech Stack:** TypeScript, Chrome Extension MV3 APIs, vitest + jsdom

---

### Task 1: Add `removeTranslations()` — TDD

**Files:**
- Create: `src/content/__tests__/renderer.test.ts` (modify — add test block)
- Modify: `src/content/renderer.ts:43` (append after line 43)

- [ ] **Step 1: Write the failing test**

Add to `src/content/__tests__/renderer.test.ts` after the existing `describe` blocks:

```ts
import { removeTranslations } from '../renderer';

describe('removeTranslations', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('removes all translation elements and preserves originals', () => {
    const original = document.createElement('div');
    original.textContent = 'Original text';
    document.body.appendChild(original);

    for (let i = 0; i < 3; i++) {
      const clone = document.createElement('div');
      clone.classList.add('itranslate-translation');
      clone.textContent = `Translation ${i}`;
      document.body.appendChild(clone);
    }

    removeTranslations();

    expect(document.querySelectorAll('.itranslate-translation')).toHaveLength(0);
    expect(document.body.children).toHaveLength(1);
    expect(document.body.children[0].textContent).toBe('Original text');
  });

  it('is safe to call when no translations exist', () => {
    const original = document.createElement('div');
    original.textContent = 'Original text';
    document.body.appendChild(original);

    expect(() => removeTranslations()).not.toThrow();
    expect(document.body.children).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/__tests__/renderer.test.ts`
Expected: 2 failing tests — `removeTranslations is not a function` / `not exported`

- [ ] **Step 3: Implement `removeTranslations()`**

Append to `src/content/renderer.ts`:

```ts
export function removeTranslations(): void {
  document.querySelectorAll('.itranslate-translation').forEach(el => el.remove());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/__tests__/renderer.test.ts`
Expected: All tests pass (8 existing + 2 new = 10 tests)

- [ ] **Step 5: Commit**

```bash
git add src/content/renderer.ts src/content/__tests__/renderer.test.ts
git commit -m "feat: add removeTranslations() function"
```

---

### Task 2: Handle `undoTranslation` in content script

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: Update imports**

Change line 3 from:
```ts
import { renderPlaceholders, renderTranslations } from './renderer';
```
To:
```ts
import { removeTranslations, renderPlaceholders, renderTranslations } from './renderer';
```

- [ ] **Step 2: Add cleanup at start of `translatePage()`**

After the `translateInProgress = true;` line (line 11), add:

```ts
// Clean up any existing translations before re-running
removeTranslations();
```

The start of `translatePage()` should look like:

```ts
async function translatePage(): Promise<void> {
  if (translateInProgress) return;
  translateInProgress = true;

  try {
    stopObserving();

    // Clean up any existing translations before re-running
    removeTranslations();

    const extraction = extractSegments();
    // ... rest unchanged
```

- [ ] **Step 3: Add `undoTranslation` message handler**

In the `chrome.runtime.onMessage.addListener` block (after the existing `translatePage` handler, before the closing `});`), add:

```ts
if (message.action === 'undoTranslation') {
  removeTranslations();
  stopObserving();
  sendResponse({ received: true });
  return true; // keep channel open for async sendResponse
}
```

The full listener should look like:

```ts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'translatePage') {
    translatePage();
    sendResponse({ received: true });
  }
  if (message.action === 'undoTranslation') {
    removeTranslations();
    stopObserving();
    sendResponse({ received: true });
    return true;
  }
});
```

- [ ] **Step 4: Run all tests to verify no regressions**

Run: `npx vitest run`
Expected: All 25 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/content/index.ts
git commit -m "feat: handle undoTranslation message in content script"
```

---

### Task 3: Toggle popup button state

**Files:**
- Modify: `src/popup/popup.ts`

- [ ] **Step 1: Add translation state variable**

After line 8 (`const errorDiv = ...;`), add:

```ts
let isTranslated = false;
```

- [ ] **Step 2: Update button click handler to toggle behavior**

Replace the `translateBtn.addEventListener('click', ...)` block (lines 15-31) with:

```ts
translateBtn.addEventListener('click', async () => {
  errorDiv.classList.add('hidden');

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error('No active tab');

    if (!isTranslated) {
      translateBtn.disabled = true;
      translateBtn.textContent = 'Translating...';
      await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
    } else {
      await chrome.tabs.sendMessage(tab.id, { action: 'undoTranslation' });
      isTranslated = false;
      translateBtn.textContent = 'Translate This Page';
    }
  } catch (err) {
    errorDiv.textContent = 'Could not translate this page. Make sure you are on a webpage (not a browser internal page).';
    errorDiv.classList.remove('hidden');
    translateBtn.disabled = false;
    translateBtn.textContent = 'Translate This Page';
  }
});
```

- [ ] **Step 3: Update `translationComplete` handler to set done state**

Replace the `translationComplete` handler (lines 48-57) with:

```ts
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'translationComplete') {
    statsDiv.classList.remove('hidden');
    segCountEl.textContent = String(message.totalSegments);
    cacheHitsEl.textContent = String(message.stats?.hits ?? 0);
    apiCallsEl.textContent = String(message.stats?.misses ?? 0);
    isTranslated = true;
    translateBtn.disabled = false;
    translateBtn.textContent = 'Undo Translation';
  }
});
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/popup/popup.ts
git commit -m "feat: toggle popup button for undo translation"
```

---

### Task 4: Final verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All 25 tests pass (23 existing + 2 new)

- [ ] **Step 2: Build the extension**

Run: `npm run build`
Expected: TypeScript check + Vite build succeeds, output in `dist/`

- [ ] **Step 3: Manual smoke test checklist**

Load extension in Chrome, open any English page:
1. Open popup → button shows "Translate This Page"
2. Click it → button shows "Translating..." (disabled), stats hidden
3. Wait for translations to appear on page
4. Popup now shows "Undo Translation", stats visible
5. Click "Undo Translation" → translations disappear from page
6. Popup shows "Translate This Page", stats remain visible
7. Click "Translate This Page" again → translation works normally
