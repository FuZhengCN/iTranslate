# iTranslate — Browser Extension Design Spec

## Overview

A Chrome/Edge (Manifest V3) browser extension for immersive English-to-Chinese bilingual translation. Users manually trigger translation on a page; the extension detects the main content area, extracts text segments, translates them via the DeepSeek API, and injects styled translation cards below each original paragraph.

## Feature Summary

- **Manual trigger** via toolbar popup button (no auto-translate)
- **Smart content detection** — translates main article body, skips nav/footer/sidebar
- **Segment block rendering** — each paragraph gets a translation card (Mode C)
- **DeepSeek API** — user provides their own API key + optional custom endpoint
- **English → Chinese only** — source and target are fixed
- **Local page cache** — IndexedDB, reused on revisit, no expiration in v1

## Architecture

### Extension Structure (Manifest V3)

```
iTranslate/
├── manifest.json
├── src/
│   ├── background/          # Service Worker
│   │   ├── index.ts         # SW entry
│   │   ├── translator.ts    # DeepSeek API client
│   │   ├── cache.ts         # IndexedDB wrapper
│   │   └── router.ts        # Message handler
│   ├── content/             # Content Script
│   │   ├── index.ts         # CS entry, orchestrator
│   │   ├── extractor.ts     # Main content detection + text segmentation
│   │   ├── renderer.ts      # Translation card injection
│   │   ├── observer.ts      # MutationObserver for dynamic content
│   │   └── styles.css       # Card styles (injected)
│   ├── popup/               # Extension popup
│   │   ├── popup.html
│   │   ├── popup.ts
│   │   └── popup.css
│   ├── settings/            # Options page
│   │   ├── settings.html
│   │   ├── settings.ts
│   │   └── settings.css
│   └── shared/
│       ├── types.ts         # TypeScript interfaces
│       ├── constants.ts     # Default config
│       └── storage.ts       # chrome.storage wrapper
├── icons/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Component Responsibilities

**Content Script** (runs in page context):
- `extractor.ts` — Uses Mozilla Readability to identify main content. Walks the DOM, collects translatable text nodes, groups into segments (1-3 sentences). Assigns each segment a unique ID. Preserves DOM position references.
- `renderer.ts` — Receives `{id, original, translated}[]`. Creates card elements (original above, translation below with badge). Inserts after original text in DOM. Applies isolated CSS.
- `observer.ts` — MutationObserver on main content area. Debounces changes, triggers extraction for new content nodes only.
- `index.ts` — Entry point. Listens for popup messages, orchestrates the extract → translate → render pipeline.

**Background Service Worker** (persistent-ish, event-driven):
- `router.ts` — Message handler. Receives `{segmentId, text}[]` from content script, returns `{segmentId, translated}[]`. Routes to cache check first, translates misses, merges results.
- `translator.ts` — DeepSeek API client. Batches segments into one request with delimiter separation. Uses OpenAI-compatible `/chat/completions` endpoint. Configurable: endpoint, model, API key, system prompt.
- `cache.ts` — IndexedDB wrapper. Key: SHA-256 of source text. Value: `{translated, timestamp}`. Check-before-call pattern.

**UI Pages**:
- `popup/` — Compact panel: translate button, segment/cache/API stats, links to settings and cache clear.
- `settings/` — Full page: API endpoint, key (password field), model name, custom system prompt, test connection button.

### Tech Stack

| Choice | Rationale |
|--------|-----------|
| TypeScript | Type safety across service worker and content script |
| Vite + @crxjs/vite-plugin | Fast HMR, Manifest V3 support, clean build |
| idb | Clean IndexedDB promise wrapper |
| @mozilla/readability | Battle-tested content extraction |
| Vitest | Fast, Vite-native, good TS support |

## Data Flow

1. User opens popup, clicks "Translate This Page"
2. Popup sends message to content script via `chrome.tabs.sendMessage`
3. Content script `extractor.ts` walks DOM, produces `{id, text}[]`
4. Content script sends segments to background via `chrome.runtime.sendMessage`
5. Background `router.ts` checks IndexedDB cache for each segment (SHA-256 key)
6. For cache misses: `translator.ts` batches them, calls DeepSeek `/chat/completions`
7. Background caches new translations in IndexedDB
8. Background returns full `{id, translated}[]` to content script
9. Content script `renderer.ts` builds and injects translation cards
10. `observer.ts` begins watching for dynamic content

## Translation Card Design

Each card renders below the original paragraph:
- Light gradient background (#f0f4ff → #faf5ff)
- Subtle border and shadow
- Badge: "中文 · DeepSeek" (small, purple)
- Text in Chinese-friendly font stack (PingFang SC, Microsoft YaHei, sans-serif)
- Slightly smaller font than original for visual hierarchy

## Error Handling

| Scenario | Response |
|----------|----------|
| API key not configured | Background returns error → popup navigates to settings |
| API rate limit (429) | Exponential backoff 1s/2s/4s, max 3 retries |
| Network failure | Retry 3x, then error toast with retry button |
| Content detection finds nothing | Fall back to `document.body` text extraction |
| Page navigates away mid-translation | Abort in-flight request silently |

## Cache Strategy

- **Storage**: IndexedDB
- **Key**: SHA-256 hash of `source_text`
- **Value**: `{ translated: string, timestamp: number }`
- **TTL**: None in v1 (persists until manually cleared)
- **Clear**: Manual button in popup

## Testing Strategy

| Layer | Scope | Tool |
|-------|-------|------|
| Unit | extractor, renderer, translator, cache — isolated with mocks | Vitest |
| Integration | Content script ↔ background message passing, cache hit/miss | Vitest + chrome API mocks |
| E2E | Load unpacked extension in Chrome, test on Wikipedia, Medium, news | Manual + DevTools |

## Out of Scope (v1)

- Auto-translate on page load
- Firefox/Safari support
- Chinese → English or other language pairs
- Shadow DOM isolation
- Streaming translation responses
- User dictionary / custom translations
- Offline translation
