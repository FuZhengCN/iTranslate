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
| **Content script** | `src/content/index.ts` | Injected into every page. Extracts text elements, sends to background for translation, renders results into DOM. Listens for `translatePage` message from popup |
| **Popup** | `src/popup/popup.html` + `popup.ts` | Toolbar popup — "Translate This Page" button, stats display, cache clear |
| **Settings** | `src/settings/settings.html` + `settings.ts` | Options page — API endpoint, API key, model name, system prompt, test connection |

### Data Flow (translate action)

```
Popup (click) → content script (extractSegments) → background (router → cache check → DeepSeek API) → content script (renderTranslations)
```

Messages use `chrome.runtime.sendMessage` (content→bg) and `chrome.tabs.sendMessage` (popup→content).

### Key Modules

- **`src/background/translator.ts`** — DeepSeek API client (OpenAI-compatible `/chat/completions`). Batches segments, retries with exponential backoff, handles 429 rate limits. `translateBatch(texts)` and `testConnection(settings)`.
- **`src/background/cache.ts`** — IndexedDB wrapper via `idb` library. Key: hash of source text. Value: `{ translated, timestamp }`. `cacheGet`, `cacheSet`, `cacheGetBulk`, `cacheSetBulk`, `cacheClear`.
- **`src/background/router.ts`** — Orchestrates cache lookup + API call. Checks IndexedDB first, batches cache misses to translator, stores new results. Sorts results back to original order.
- **`src/content/extractor.ts`** — Walks ALL elements inside the content root (`querySelectorAll('*')`), filters to elements with direct text nodes, skips non-content (header/footer/nav by class/id/role), skips `<script>/<style>/hidden` elements, skips elements already bearing `itranslate-translation` class.
- **`src/content/renderer.ts`** — Two-phase: `renderPlaceholders()` inserts gray italic "Translating..." clones before API call; `renderTranslations()` replaces placeholder text with real translation (or updates existing). Clones the original element via `cloneNode(false)` and inserts as `afterend` sibling. Dedup: checks `nextElementSibling` before inserting.
- **`src/shared/storage.ts`** — Wraps `chrome.storage.sync` for settings persistence.

### Translation DOM Pattern

Original elements are left untouched. Translation is a **shallow clone** of the original element (same tag, classes, attributes), inserted immediately after via `insertAdjacentElement('afterend', clone)`. CSS class `itranslate-translation` marks all translation elements; the CSS file only adds italic gray styling to the `.itranslate-placeholder` loading state.

### Test Strategy

Vitest + jsdom + `fake-indexeddb` (auto-loaded via `setupFiles`). Tests live in `__tests__/` directories alongside source. Mock `chrome.*` APIs with `vi.stubGlobal('chrome', {...})` before dynamic imports.

### Branches

- `master` — original TreeWalker text-node approach with block-ancestor detection
- `cgtn-approach` — current development branch: element-based extraction (iterates all elements with direct text), simpler renderer (no block ancestor hunting), placeholder loading state

Switch with `git checkout <branch>`.
