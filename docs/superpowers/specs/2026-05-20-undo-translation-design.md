# Undo Translation — Design Spec

**Date:** 2026-05-20
**Branch:** chunked-approach
**Status:** Approved

## Overview

Add an "Undo Translation" feature: after translating a page, the popup button changes to "Undo Translation." Clicking it removes all translation elements from the page, restoring the original content. The popup button then returns to "Translate This Page" so the user can re-translate.

## Data Flow

```
Undo:
  Popup → Content Script:  { action: "undoTranslation" }
  Content Script:          removeTranslations() — querySelectorAll('.itranslate-translation') → remove()
  Content Script:          stopObserving()
  Content Script → Popup:  { received: true }
  Popup:                   reset button to "Translate This Page", isTranslated = false, stats stay visible

Re-translate:
  Popup → Content Script:  { action: "translatePage" }
  Content Script:          removeTranslations() (clean slate) → extract → render → translate
```

## Button State Machine

| State   | Button Text          | Enabled | Stats    |
|---------|---------------------|---------|----------|
| Idle    | Translate This Page  | Yes     | Hidden   |
| Loading | Translating...       | No      | Hidden   |
| Done    | Undo Translation     | Yes     | Visible  |
| After undo → returns to Idle, stats remain visible              |

## File Changes

### `src/content/renderer.ts`

Add one export:

```ts
export function removeTranslations(): void {
  document.querySelectorAll('.itranslate-translation').forEach(el => el.remove());
}
```

Import it in `index.ts`.

### `src/content/index.ts`

1. Import `removeTranslations` from renderer.
2. At the start of `translatePage()`, call `removeTranslations()` to clean up any existing translations before re-extracting and re-rendering.
3. Add a message handler:

```ts
if (message.action === 'undoTranslation') {
  removeTranslations();
  stopObserving();
  sendResponse({ received: true });
  return true; // keep channel open for async
}
```

### `src/popup/popup.ts`

1. Add `let isTranslated = false;` state variable.
2. In the translate button click handler:
   - If `!isTranslated`: send `translatePage` (existing behavior).
   - If `isTranslated`: send `undoTranslation`, set `isTranslated = false`, button text → "Translate This Page".
3. In the `translationComplete` message handler: set `isTranslated = true`, button text → "Undo Translation", enable button.

### `src/popup/popup.html`

No changes. Button text is controlled entirely from JS.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Click undo during translation | Cannot happen — button disabled during loading |
| Click undo twice (reopen popup) | Harmless — querySelectorAll returns empty NodeList, forEach is a no-op |
| Reopen popup after translation | Popup resets to initial state. Clicking "Translate This Page" calls removeTranslations() first (clean slate), then re-runs |
| Content script unavailable | Popup's existing catch block handles the error |
| Observer re-triggers after undo | stopObserving() called during undo prevents this |

## Testing

One new unit test in `src/content/__tests__/renderer.test.ts`:

```ts
describe('removeTranslations', () => {
  it('removes all translation elements and preserves originals', () => {
    // Setup: original + 3 translation clones with .itranslate-translation class
    // Call removeTranslations()
    // Assert: 0 .itranslate-translation elements, original element preserved
  });
});
```

Existing 23 tests continue to pass — no breaking API changes.
