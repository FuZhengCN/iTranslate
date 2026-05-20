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

This is a **Manifest V3 browser extension** (Chrome/Edge) for English→Chinese bilingual translation. Built with TypeScript, bundled with Vite + `@crxjs/vite-plugin`.

### Extension Contexts (4 isolated execution environments)

| Context | Entry | Purpose |
|---------|-------|---------|
| **Background** (service worker) | `src/background/index.ts` | Handles API calls to DeepSeek, manages IndexedDB cache. Listens for `chrome.runtime.onMessage` for actions: `translate`, `clearCache`, `testConnection` |
| **Content script** | `src/content/index.ts` | Injected into every page. Extracts text blocks, sends to background for translation, renders results into DOM. Listens for `translatePage` message from popup |
| **Popup** | `src/popup/popup.html` + `popup.ts` | Toolbar popup — "Translate This Page" button, stats display, cache clear |
| **Settings** | `src/settings/settings.html` + `settings.ts` | Options page — API endpoint, API key, model name, system prompt, test connection |

### Data Flow (translate action)

```
Popup (click) → content script (extractSegments → renderPlaceholders → chrome.runtime.sendMessage) → background (router → cache check → DeepSeek API batches of ≤30) → content script (renderTranslations replaces placeholders)
```

Messages use `chrome.runtime.sendMessage` (content→bg) and `chrome.tabs.sendMessage` (popup→content).

### Key Modules

- **`src/background/translator.ts`** — DeepSeek API client (OpenAI-compatible `/chat/completions`). Splits large batches into chunks of ≤30. Retries with exponential backoff, handles 429 rate limits. `translateBatch(texts)` and `testConnection(settings)`.
- **`src/background/cache.ts`** — IndexedDB wrapper via `idb` library. Key: simple hash of source text. Value: `{ translated, timestamp }`. `cacheGet`, `cacheSet`, `cacheGetBulk`, `cacheSetBulk`, `cacheClear`.
- **`src/background/router.ts`** — Orchestrates cache lookup + API call. Checks IndexedDB first, batches cache misses to translator, stores new results. Sorts results back to original order.
- **`src/content/extractor.ts`** — Block-level extraction: walks all elements (`querySelectorAll('*')`), filters to those with direct text, groups by nearest block ancestor (`P/DIV/LI/H1-H6` etc.), merges text within each block with newline separator. Filters noise (timestamps, dates, pure digits). Skips blocks with combined text < 20 chars. Skips elements with `itranslate-translation` class. `findContentRoot()` tries semantic selectors → CGTN-specific classes → generic fallbacks → body, preferring the root with the most child elements.
- **`src/content/renderer.ts`** — Two-phase: `renderPlaceholders()` injects three bouncing dots (`.itranslate-dot`) as clones before API call. `renderTranslations()` replaces placeholder content with real translation, removing the placeholder class. Clones original element via `cloneNode(false)`, inserts as `afterend` sibling. Dedup: checks `nextElementSibling` before inserting.
- **`src/shared/storage.ts`** — Wraps `chrome.storage.sync` for settings persistence.

### Translation DOM Pattern

Original elements untouched. Translation is a **shallow clone** of the block ancestor element (same tag, classes, attributes), inserted immediately after via `insertAdjacentElement('afterend', clone)`. CSS class `itranslate-translation` marks all translation elements (opacity 0.7). The `.itranslate-placeholder` class adds the bouncing dot animation; it is removed when real translation arrives.

### Visual Design

Unified purple-gradient color scheme matching the extension icon (#4f46e5 → #7c3aed): popup logo gradient text, gradient buttons, purple-focused inputs. Loading indicator uses three soft-purple (#a78bfa) bouncing dots.

### Test Strategy

Vitest + jsdom + `fake-indexeddb` (auto-loaded via `setupFiles`). 23 tests across 4 files. Tests live in `__tests__/` directories alongside source. Mock `chrome.*` APIs with `vi.stubGlobal('chrome', {...})` before dynamic imports. `fake-indexeddb` polyfills IndexedDB for cache tests.

### Branches

- `master` — original TreeWalker text-node approach with block-ancestor detection
- `cgtn-approach` — element-based extraction (iterates all elements with direct text), text placeholder
- `chunked-approach` — **current dev branch**: block-level grouping, batch chunking (≤30), noise filtering, 20-char minimum, body fallback, bouncing dot loader, purple theme

Switch with `git checkout <branch>`. Remote: `https://gitee.com/fuzheng0312/i-translate.git`.
