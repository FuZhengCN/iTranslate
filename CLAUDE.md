# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

```bash
npm install              # Install dependencies
npm run build            # TypeScript check + Vite production build → dist/
npm run dev              # Vite dev server with HMR
npm test                 # Run all tests (vitest run)
npx vitest run           # Same as above
npx vitest run --reporter=verbose  # Detailed output
npx vitest run src/content/__tests__/renderer.test.ts  # Run single test file
npx tsc --noEmit         # TypeScript check only (no emit)
```

## Architecture

This is a **Manifest V3 browser extension** (Chrome/Edge) for multilingual bilingual translation (default EN→ZH). Built with TypeScript, bundled with Vite + `@crxjs/vite-plugin`.

### Extension Contexts (4 isolated execution environments)

| Context | Entry | Purpose |
|---------|-------|---------|
| **Background** (service worker) | `src/background/index.ts` | Handles API calls to DeepSeek, manages IndexedDB cache, validates incoming messages |
| **Content script** | `src/content/index.ts` | Injected into http/https pages. Extracts text blocks, sends to background for translation, renders results into DOM |
| **Popup** | `src/popup/popup.html` + `popup.ts` | Toolbar popup — translate/undo button, stats, cache clear. Syncs button state with page on open |
| **Settings** | `src/settings/settings.html` + `settings.ts` | Options page — source/target language pickers with swap button, API endpoint, API key, model name, auto-generated system prompt (editable), test connection |

### Message Catalog

| Action | Direction | Purpose |
|--------|-----------|---------|
| `translatePage` | popup → content | Trigger translation |
| `undoTranslation` | popup → content | Remove all translation clones, stop observer |
| `getState` | popup → content | Query whether page has active translations |
| `translationComplete` | content → runtime | Notify popup: translation succeeded (with stats) |
| `translationError` | content → runtime | Notify popup: translation failed |
| `translationProgress` | background → content | (unused — handler removed, toast is gone) |
| `translate` | content → background | Request translation of segments → returns results |
| `clearCache` | popup → background | Purge IndexedDB cache |
| `testConnection` | settings → background | Verify API key/endpoint works |

Popup listener filters by `sender.tab.id` against `activeTabId` to avoid cross-tab UI corruption.

Background validates translate payloads: segments must be an array ≤5000, each with `id` and `text` strings. Validation failures are logged with specific reasons to the service worker console.

### Data Flow (translate action)

```
Popup click → content script
  ├─ stopObserving()         // prevent MutationObserver re-trigger
  ├─ removeTranslations()    // clean previous run
  ├─ extractSegments()       // walk body DOM, group text by block ancestor
  ├─ renderPlaceholders()    // inject clones with 5-dot progress indicator
  ├─ chrome.runtime.sendMessage({ action: 'translate', segments })
  │     ↓
  │   background router
  │     ├─ cacheGetBulk()    // IndexedDB lookup with collision guard (stores original text)
  │     ├─ translateBatch()  // token-based batches, parallel (3 concurrent), retry 3x on 429/5xx
  │     └─ sort results, cacheSetBulk() new entries, return
  │     ↓
  ├─ renderTranslations()    // replace placeholder content with real translations
  ├─ send translationComplete to popup
  ├─ catchUpNewContent()     // re-extract for content loaded during API call window
  │     └─ filter blocks without translation sibling → translate → render
  └─ startObserving(root, () => catchUpNewContent())  // reconnect observer, incremental only
```

Observer is disconnected during translation to prevent our own DOM mutations from triggering re-translation. Catch-up scan compensates for content that loaded while the observer was offline. Observer is reconnected only after catch-up completes, so catch-up's DOM mutations don't trigger a re-translation loop.

### Key Modules

- **`src/background/translator.ts`** — OpenAI-compatible API client (`/chat/completions`). Batching is token-aware: segments accumulate by estimated token count (CJK 1.5 tok/char, Latin 0.35 tok/char, target 1500/batch) instead of fixed count. Batches run in parallel with `MAX_CONCURRENT_BATCHES=3` concurrency. `thinking: { type: 'disabled' }` sent to prevent DeepSeek reasoning mode from producing empty content. Retries only on 429/5xx (not 4xx). Temperature 0.1. Dynamic `max_tokens` estimated from prompt length. `parseResponse()` supports `[N]`, `N.`, `N)`, `N、` formats.
- **`src/background/cache.ts`** — IndexedDB wrapper via `idb` library. Key: `segmentKey(text)` (djb2 hash + text length as cache key). Value: `{ original, translated, timestamp }`. **Original text stored and verified on lookup** to guard against hash collisions. `cacheGetBulk` uses parallel `Promise.all` reads. `dbPromise` resets on open failure to allow retry.
- **`src/background/router.ts`** — Orchestrates cache lookup + API call. Sends progress messages (`translationProgress`) after cache check and after each batch. Results sorted with a position map (not O(n²) `findIndex`). `handleTranslate(segments, tabId?)`.
- **`src/content/extractor.ts`** — Full-page block extraction from `document.body`. Walks all elements, filters to those with direct text, groups by nearest block ancestor (`P/DIV/LI/H1-H6` etc.). Language-aware minimum chars: CJK blocks ≥12 chars, Latin blocks ≥20 chars. CJK detection (`isCJK`) covers Hanzi, Hiragana, Katakana, CJK punctuation. Filters noise (timestamps, dates, pure digits). Skips elements with `itranslate-translation` class or matching `SKIP_CLASS_NAMES`/ARIA roles.
- **`src/content/renderer.ts`** — Two-phase render: `renderPlaceholders()` injects clones with 5-dot progress indicator; `renderTranslations()` replaces with real text. `findTextLeaf()` picks the descendant with longest text to get representative computed styles. `applyTextStyles()` copies color, fontSize, fontWeight, lineHeight from text leaf (not fontFamily — CSS sets `sans-serif` globally). Resets height constraints so translation can expand/contract. White text gets opacity=1. Clones via `cloneNode(false)`, inserted via `afterend`. Dedup checks `nextElementSibling`. `removeTranslations()` clears all `.itranslate-translation`.
- **`src/content/toast.ts`** — Dead code (no longer imported). Previously showed a 5-dot progress toast; removed in favor of placeholder-only progress indication.
- **`src/content/observer.ts`** — MutationObserver wrapper with debounce (default 1000ms). `startObserving(root, callback)` / `stopObserving()`. Watches `childList` + `subtree`. Callback now fires `catchUpNewContent()` (incremental), not full `translatePage()`.
- **`src/shared/storage.ts`** — Wraps `chrome.storage.sync` for settings persistence. `getSettings()` merges saved values over defaults so new Settings fields (e.g. `sourceLang`, `targetLang`) get fallback values for users with old saved settings.
- **`src/shared/constants.ts`** — `DEFAULT_SETTINGS` (sourceLang: English, targetLang: Chinese), `LANGUAGE_OPTIONS` (6 languages with label/value pairs), cache DB/store names, storage key.

### Translation DOM Pattern

Original elements untouched. Translation is a **shallow clone** of the block ancestor element (same tag, classes, attributes), inserted immediately after via `insertAdjacentElement('afterend', clone)`. CSS class `itranslate-translation` marks all translation elements (`opacity: 0.85`, `font-family: sans-serif`). The `.itranslate-placeholder` class shows the 5-dot progress indicator; it is removed when real translation arrives.

### Visual Design

Unified purple gradient (#4f46e5 → #7c3aed): popup logo, buttons. Progress indicator: 5 white dots on translucent background, lighting up sequentially. Translation font: `sans-serif` (browser default, language-neutral). Translation opacity: 0.85 for visual distinction from original. No toast notification bar.

### Test Strategy

Vitest + jsdom + `fake-indexeddb` (auto-loaded via `setupFiles`). 28 tests across 5 files under `__tests__/` directories. Mock `chrome.*` APIs with `vi.stubGlobal('chrome', {...})` before dynamic imports. Cache tests include `original` field in entries. Storage tests verify defaults, merge, and backward compatibility for old settings.

### Branches

- `master` — original TreeWalker text-node approach
- `cgtn-approach` — element-based extraction, text placeholder
- `chunked-approach` — block-level grouping, batch chunking (≤30), noise filtering, progress dots, catch-up scan, undo support
- `ui-update` — **current dev branch**: language selection UI (source/target dropdowns with swap), dynamic popup badge, auto-generated system prompt, generic provider-agnostic messaging

Remote: `https://gitee.com/fuzheng0312/i-translate.git`.
