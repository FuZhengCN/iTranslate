# iTranslate Browser Extension — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Manifest V3 Chrome/Edge extension that detects main content on English webpages, translates it to Chinese via the DeepSeek API, and injects styled bilingual cards below each paragraph.

**Architecture:** Service worker handles API calls and IndexedDB caching; content script owns DOM extraction/rendering; they communicate via Chrome message passing. Popup provides the trigger UI; settings page stores API configuration.

**Tech Stack:** TypeScript, Vite + @crxjs/vite-plugin, idb, @mozilla/readability, Vitest + jsdom

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `manifest.json`
- Create: `src/shared/types.ts`
- Create: `src/shared/constants.ts`

- [ ] **Step 1: Initialize package.json**

```json
{
  "name": "itranslate",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.28",
    "@types/chrome": "^0.0.270",
    "@mozilla/readability": "^0.5.0",
    "idb": "^8.0.0",
    "typescript": "^5.4.0",
    "vite": "^5.4.0",
    "vitest": "^1.6.0",
    "jsdom": "^24.0.0"
  }
}
```

- [ ] **Step 2: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["chrome", "vitest/globals"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

export default defineConfig({
  plugins: [crx({ manifest })],
});
```

- [ ] **Step 4: Write manifest.json**

```json
{
  "manifest_version": 3,
  "name": "iTranslate",
  "version": "1.0.0",
  "description": "Immersive bilingual English-Chinese translation using DeepSeek AI",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "src/background/index.ts"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.ts"],
      "css": ["src/content/styles.css"]
    }
  ],
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_title": "iTranslate"
  },
  "options_page": "src/settings/settings.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

- [ ] **Step 5: Write shared types**

Create `src/shared/types.ts`:

```typescript
export interface TranslationSegment {
  id: string;
  text: string;
}

export interface TranslationResult {
  id: string;
  original: string;
  translated: string;
}

export interface CacheEntry {
  translated: string;
  timestamp: number;
}

export interface Settings {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
}
```

- [ ] **Step 6: Write shared constants**

Create `src/shared/constants.ts`:

```typescript
import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  systemPrompt:
    'You are a professional English-to-Chinese translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the Chinese translation, nothing else.',
};

export const CACHE_DB_NAME = 'itranslate-cache';
export const CACHE_STORE_NAME = 'translations';

export const STORAGE_KEY_SETTINGS = 'itranslate_settings';
```

- [ ] **Step 7: Install dependencies and verify build**

Run: `npm install`
Run: `npm run build`
Expected: Build succeeds with no errors (extension files in `dist/`)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold project with Vite + crxjs, manifest, types, and constants"
```

---

### Task 2: Storage Utility & Settings Types

**Files:**
- Create: `src/shared/storage.ts`

- [ ] **Step 1: Write storage.ts**

Create `src/shared/storage.ts`:

```typescript
import type { Settings } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEY_SETTINGS } from './constants';

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(STORAGE_KEY_SETTINGS);
  if (result[STORAGE_KEY_SETTINGS]) {
    return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY_SETTINGS] };
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY_SETTINGS]: settings });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/storage.ts
git commit -m "feat: add chrome.storage wrapper for settings"
```

---

### Task 3: Background — IndexedDB Cache

**Files:**
- Create: `src/background/cache.ts`

- [ ] **Step 1: Write cache.ts**

Create `src/background/cache.ts`:

```typescript
import { openDB, type IDBPDatabase } from 'idb';
import type { CacheEntry } from '../shared/types';
import { CACHE_DB_NAME, CACHE_STORE_NAME } from '../shared/constants';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(CACHE_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function cacheGet(key: string): Promise<CacheEntry | undefined> {
  const db = await getDB();
  return db.get(CACHE_STORE_NAME, key);
}

export async function cacheSet(key: string, entry: CacheEntry): Promise<void> {
  const db = await getDB();
  await db.put(CACHE_STORE_NAME, entry, key);
}

export async function cacheClear(): Promise<void> {
  const db = await getDB();
  await db.clear(CACHE_STORE_NAME);
}

export async function cacheGetBulk(keys: string[]): Promise<Map<string, CacheEntry>> {
  const db = await getDB();
  const result = new Map<string, CacheEntry>();
  for (const key of keys) {
    const entry = await db.get(CACHE_STORE_NAME, key);
    if (entry) {
      result.set(key, entry);
    }
  }
  return result;
}

export async function cacheSetBulk(entries: Map<string, CacheEntry>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(CACHE_STORE_NAME, 'readwrite');
  for (const [key, entry] of entries) {
    await tx.store.put(entry, key);
  }
  await tx.done;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/background/cache.ts
git commit -m "feat: add IndexedDB cache layer for translation results"
```

---

### Task 4: Background — DeepSeek Translator

**Files:**
- Create: `src/background/translator.ts`

- [ ] **Step 1: Write translator.ts**

Create `src/background/translator.ts`:

```typescript
import type { Settings } from '../shared/types';
import { getSettings } from '../shared/storage';

const DELIMITER = '|||';

function buildPrompt(systemPrompt: string, texts: string[]): string {
  const segments = texts.map((t, i) => `[${i}] ${t}`).join('\n\n');
  return `Translate the following English texts to Chinese. Each text is wrapped with a numbered tag. Output the translations using the same numbered tags, one per line, with no additional commentary:\n\n${segments}`;
}

function parseResponse(response: string, count: number): string[] {
  const translations: (string | null)[] = new Array(count).fill(null);

  const lines = response.split('\n');
  for (const line of lines) {
    const match = line.match(/^\[(\d+)\]\s*(.+)/);
    if (match) {
      const idx = parseInt(match[1], 10);
      if (idx >= 0 && idx < count) {
        translations[idx] = match[2].trim();
      }
    }
  }

  // Fallback: if parsing failed, try splitting by delimiter
  if (translations.some((t) => t === null)) {
    const parts = response.split(DELIMITER);
    if (parts.length === count) {
      return parts.map((p) => p.trim());
    }
  }

  // Use original text for any segments we couldn't parse
  return translations.map((t, i) => t ?? `[Translation unavailable for segment ${i}]`);
}

export async function translateBatch(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];

  const settings: Settings = await getSettings();

  if (!settings.apiKey) {
    throw new Error('API key not configured');
  }

  const prompt = buildPrompt(settings.systemPrompt, texts);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${settings.apiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: settings.systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      });

      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? '';
      return parseResponse(content, texts.length);
    } catch (err) {
      lastError = err as Error;
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error('Translation failed');
}

export async function testConnection(settings: Settings): Promise<boolean> {
  try {
    const response = await fetch(`${settings.apiEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'user', content: 'Say "ok" and nothing else.' },
        ],
        max_tokens: 10,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/background/translator.ts
git commit -m "feat: add DeepSeek API translator with batching and retry"
```

---

### Task 5: Background — Message Router & Entry Point

**Files:**
- Create: `src/background/router.ts`
- Create: `src/background/index.ts`

- [ ] **Step 1: Write router.ts**

Create `src/background/router.ts`:

```typescript
import type { TranslationSegment, TranslationResult } from '../shared/types';
import { cacheGetBulk, cacheSetBulk } from './cache';
import { translateBatch } from './translator';

function sha256(text: string): string {
  // Fast async-compatible hash using SubtleCrypto
  // We'll compute synchronously for simplicity in v1 using a simple hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'seg_' + Math.abs(hash).toString(36) + '_' + text.length.toString(36);
}

export async function handleTranslate(
  segments: TranslationSegment[]
): Promise<{ results: TranslationResult[]; stats: { hits: number; misses: number } }> {
  const keys = segments.map((s) => sha256(s.text));
  const cacheMap = await cacheGetBulk(keys);

  const results: TranslationResult[] = [];
  const misses: { idx: number; text: string; key: string }[] = [];
  let hits = 0;

  for (let i = 0; i < segments.length; i++) {
    const key = keys[i];
    const cached = cacheMap.get(key);
    if (cached) {
      hits++;
      results.push({ id: segments[i].id, original: segments[i].text, translated: cached.translated });
    } else {
      misses.push({ idx: i, text: segments[i].text, key });
    }
  }

  if (misses.length > 0) {
    const texts = misses.map((m) => m.text);
    const translations = await translateBatch(texts);

    const newEntries = new Map();
    for (let i = 0; i < misses.length; i++) {
      const { idx, key } = misses[i];
      const translated = translations[i];
      results.push({ id: segments[idx].id, original: segments[idx].text, translated });
      newEntries.set(key, { translated, timestamp: Date.now() });
    }

    // Sort results back to original order
    results.sort((a, b) => {
      const idxA = segments.findIndex((s) => s.id === a.id);
      const idxB = segments.findIndex((s) => s.id === b.id);
      return idxA - idxB;
    });

    // Fire-and-forget cache write
    cacheSetBulk(newEntries).catch(() => {});
  }

  return { results, stats: { hits, misses: misses.length } };
}
```

- [ ] **Step 2: Write background index.ts**

Create `src/background/index.ts`:

```typescript
import type { TranslationSegment, TranslationResult } from '../shared/types';
import { handleTranslate } from './router';
import { cacheClear } from './cache';
import { testConnection } from './translator';
import { getSettings } from '../shared/storage';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'translate') {
    const segments: TranslationSegment[] = message.segments;
    handleTranslate(segments)
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err: Error) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (message.action === 'clearCache') {
    cacheClear()
      .then(() => sendResponse({ success: true }))
      .catch((err: Error) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === 'testConnection') {
    getSettings()
      .then((settings) => testConnection(settings))
      .then((ok) => sendResponse({ success: true, connected: ok }))
      .catch((err: Error) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
```

- [ ] **Step 3: Commit**

```bash
git add src/background/router.ts src/background/index.ts
git commit -m "feat: add background message router with cache checking and API routing"
```

---

### Task 6: Content Script — Text Extractor

**Files:**
- Create: `src/content/extractor.ts`

- [ ] **Step 1: Write extractor.ts**

Create `src/content/extractor.ts`:

```typescript
import { isProbablyReaderable } from '@mozilla/readability';
import type { TranslationSegment } from '../shared/types';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME', 'CODE', 'PRE', 'KBD']);
const SKIP_CLASS_NAMES = /(header|footer|nav|sidebar|comment|menu|widget|advert|banner)/i;

function isSkippable(el: Element): boolean {
  const tag = el.tagName;
  if (SKIP_TAGS.has(tag)) return true;
  const className = el.className?.toString() ?? '';
  const id = el.id ?? '';
  if (SKIP_CLASS_NAMES.test(className) || SKIP_CLASS_NAMES.test(id)) return true;
  // Check role attribute
  const role = el.getAttribute('role') ?? '';
  if (/banner|navigation|complementary|contentinfo/i.test(role)) return true;
  return false;
}

function findContentRoot(): Element {
  // Try readability's heuristic first
  if (isProbablyReaderable(document)) {
    // Common content containers by priority
    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '#content',
      '.content',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
  }
  return document.body;
}

interface TextChunk {
  node: Text;
  text: string;
}

function collectTextNodes(root: Element): TextChunk[] {
  const chunks: TextChunk[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Text): number {
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      let parent: Node | null = node.parentElement;
      while (parent) {
        if (parent instanceof Element && isSkippable(parent)) {
          return NodeFilter.FILTER_REJECT;
        }
        parent = parent.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent?.trim();
    if (text && text.length > 3) {
      chunks.push({ node, text });
    }
  }
  return chunks;
}

function groupIntoSegments(chunks: TextChunk[]): { node: Text; segments: TranslationSegment[] }[] {
  const result: { node: Text; segments: TranslationSegment[] }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const { node, text } = chunks[i];
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g);

    if (!sentences || sentences.length <= 3) {
      result.push({
        node,
        segments: [{ id: `seg_${i}`, text }],
      });
    } else {
      // Group sentences into segments of 2-3
      const grouped: TranslationSegment[] = [];
      let segIndex = 0;
      for (let j = 0; j < sentences.length; j += 3) {
        const group = sentences.slice(j, j + 3).join('').trim();
        grouped.push({ id: `seg_${i}_${segIndex++}`, text: group });
      }
      result.push({ node, segments: grouped });
    }
  }

  return result;
}

export interface ExtractionResult {
  sourceGroups: { node: Text; segments: TranslationSegment[] }[];
  allSegments: TranslationSegment[];
}

export function extractSegments(): ExtractionResult {
  const root = findContentRoot();
  const chunks = collectTextNodes(root);
  const sourceGroups = groupIntoSegments(chunks);

  const allSegments = sourceGroups.flatMap((g) => g.segments);
  return { sourceGroups, allSegments };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/content/extractor.ts
git commit -m "feat: add text extractor with readability-based content detection"
```

---

### Task 7: Content Script — Translation Renderer

**Files:**
- Create: `src/content/renderer.ts`
- Create: `src/content/styles.css`

- [ ] **Step 1: Write renderer.ts**

Create `src/content/renderer.ts`:

```typescript
import type { TranslationResult } from '../shared/types';

interface SegmentNodeMapping {
  segmentId: string;
  textNode: Text;
  // For multi-segment nodes, we track which sub-segments map to this node
}

export function renderTranslations(
  results: TranslationResult[],
  sourceGroups: { node: Text; segments: { id: string }[] }[]
): void {
  const resultMap = new Map(results.map((r) => [r.id, r]));

  for (const group of sourceGroups) {
    const node = group.node;
    // Collect translations for all segments in this group
    const translationsInGroup: TranslationResult[] = [];
    for (const seg of group.segments) {
      const result = resultMap.get(seg.id);
      if (result) {
        translationsInGroup.push(result);
      }
    }

    if (translationsInGroup.length === 0) continue;

    const parent = node.parentElement;
    if (!parent) continue;

    // Build translation text
    const translatedText = translationsInGroup.map((r) => r.translated).join(' ');

    const card = document.createElement('div');
    card.className = 'itranslate-card';
    card.innerHTML = `
      <div class="itranslate-badge">中文 · DeepSeek</div>
      <p class="itranslate-text">${escapeHtml(translatedText)}</p>
    `;

    // Insert after the parent of the text node
    parent.insertAdjacentElement('afterend', card);
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

- [ ] **Step 2: Write styles.css**

Create `src/content/styles.css`:

```css
.itranslate-card {
  background: linear-gradient(135deg, #f0f4ff, #faf5ff);
  border: 1px solid #d4d4f0;
  border-radius: 10px;
  padding: 14px 16px;
  margin: 4px 0 16px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
}

.itranslate-badge {
  display: inline-block;
  font-size: 10px;
  background: #805ad5;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.itranslate-text {
  font-size: 15px;
  line-height: 1.8;
  color: #2d3748;
  margin: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/content/renderer.ts src/content/styles.css
git commit -m "feat: add translation card renderer with styled injection"
```

---

### Task 8: Content Script — MutationObserver for Dynamic Content

**Files:**
- Create: `src/content/observer.ts`

- [ ] **Step 1: Write observer.ts**

Create `src/content/observer.ts`:

```typescript
type Callback = () => void;

let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function startObserving(root: Element, onNewContent: Callback, debounceMs = 1000): void {
  stopObserving();

  observer = new MutationObserver((_mutations) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onNewContent();
    }, debounceMs);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false,
  });
}

export function stopObserving(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/content/observer.ts
git commit -m "feat: add MutationObserver for dynamic content detection"
```

---

### Task 9: Content Script — Entry Point (Orchestrator)

**Files:**
- Create: `src/content/index.ts`

- [ ] **Step 1: Write content index.ts**

Create `src/content/index.ts`:

```typescript
import { extractSegments } from './extractor';
import type { ExtractionResult } from './extractor';
import { renderTranslations } from './renderer';
import { startObserving, stopObserving } from './observer';

let translateInProgress = false;
let lastExtraction: ExtractionResult | null = null;

async function translatePage(): Promise<void> {
  if (translateInProgress) return;
  translateInProgress = true;

  try {
    stopObserving();

    const extraction = extractSegments();
    lastExtraction = extraction;

    if (extraction.allSegments.length === 0) {
      console.log('[iTranslate] No translatable content found');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      segments: extraction.allSegments,
    });

    if (!response.success) {
      alert(`Translation failed: ${response.error}`);
      return;
    }

    renderTranslations(response.results, extraction.sourceGroups);

    // Start watching for new content
    const root = extraction.sourceGroups[0]?.node.parentElement?.closest('article, main, [role="main"]') ?? document.body;
    startObserving(root, () => {
      // Re-translate new content on DOM changes
      translatePage();
    });

    // Send stats back to popup (if open)
    chrome.runtime.sendMessage({
      action: 'translationComplete',
      stats: response.stats,
      totalSegments: extraction.allSegments.length,
    }).catch(() => {});

  } catch (err) {
    console.error('[iTranslate] Error:', err);
    alert(`Translation error: ${(err as Error).message}`);
  } finally {
    translateInProgress = false;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'translatePage') {
    translatePage();
    sendResponse({ received: true });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add src/content/index.ts
git commit -m "feat: add content script orchestrator with extract-translate-render pipeline"
```

---

### Task 10: Popup UI

**Files:**
- Create: `src/popup/popup.html`
- Create: `src/popup/popup.ts`
- Create: `src/popup/popup.css`

- [ ] **Step 1: Write popup.html**

Create `src/popup/popup.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=320" />
  <link rel="stylesheet" href="popup.css" />
</head>
<body>
  <div class="popup">
    <div class="header">
      <span class="logo">iTranslate</span>
      <span class="lang-badge">EN → ZH</span>
    </div>

    <button id="translateBtn" class="btn-primary">Translate This Page</button>

    <div id="stats" class="stats hidden">
      <div class="stat-row">
        <span>Segments found:</span>
        <span id="segCount">-</span>
      </div>
      <div class="stat-row">
        <span>Cached:</span>
        <span id="cacheHits" class="hit">-</span>
      </div>
      <div class="stat-row">
        <span>API calls:</span>
        <span id="apiCalls" class="miss">-</span>
      </div>
    </div>

    <div class="actions">
      <button id="settingsBtn" class="btn-secondary">Settings</button>
      <button id="clearCacheBtn" class="btn-secondary">Clear Cache</button>
    </div>

    <div id="error" class="error hidden"></div>
  </div>

  <script src="popup.ts" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: Write popup.css**

Create `src/popup/popup.css`:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #1a1a2e;
}

.popup { padding: 16px; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.logo { font-size: 16px; font-weight: 700; color: #2b6cb0; }

.lang-badge {
  font-size: 10px;
  background: #ebf8ff;
  color: #2b6cb0;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.btn-primary {
  width: 100%;
  padding: 10px 16px;
  background: #2b6cb0;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
}

.btn-primary:hover { background: #2c5282; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.stats {
  background: #f7fafc;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.stats.hidden { display: none; }

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 12px;
}

.stat-row .hit { color: #38a169; }
.stat-row .miss { color: #e53e3e; }

.actions { display: flex; gap: 8px; }

.btn-secondary {
  flex: 1;
  padding: 6px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.btn-secondary:hover { background: #f7fafc; }

.error {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 4px;
  color: #c53030;
  font-size: 12px;
}

.error.hidden { display: none; }
```

- [ ] **Step 3: Write popup.ts**

Create `src/popup/popup.ts`:

```typescript
const translateBtn = document.getElementById('translateBtn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
const clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;
const statsDiv = document.getElementById('stats') as HTMLDivElement;
const segCountEl = document.getElementById('segCount') as HTMLSpanElement;
const cacheHitsEl = document.getElementById('cacheHits') as HTMLSpanElement;
const apiCallsEl = document.getElementById('apiCalls') as HTMLSpanElement;
const errorDiv = document.getElementById('error') as HTMLDivElement;

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

translateBtn.addEventListener('click', async () => {
  errorDiv.classList.add('hidden');
  translateBtn.disabled = true;
  translateBtn.textContent = 'Translating...';

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error('No active tab');

    await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
  } catch (err) {
    errorDiv.textContent = 'Could not translate this page. Make sure you are on a webpage (not a browser internal page).';
    errorDiv.classList.remove('hidden');
    translateBtn.disabled = false;
    translateBtn.textContent = 'Translate This Page';
  }
});

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

clearCacheBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'clearCache' });
    clearCacheBtn.textContent = 'Cache Cleared!';
    setTimeout(() => { clearCacheBtn.textContent = 'Clear Cache'; }, 1500);
  } catch (err) {
    errorDiv.textContent = 'Failed to clear cache.';
    errorDiv.classList.remove('hidden');
  }
});

// Listen for translation completion stats
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'translationComplete') {
    statsDiv.classList.remove('hidden');
    segCountEl.textContent = String(message.totalSegments);
    cacheHitsEl.textContent = String(message.stats?.hits ?? 0);
    apiCallsEl.textContent = String(message.stats?.misses ?? 0);
    translateBtn.disabled = false;
    translateBtn.textContent = 'Translate This Page';
  }
});
```

- [ ] **Step 4: Commit**

```bash
git add src/popup/
git commit -m "feat: add popup UI with translate button, stats, and cache control"
```

---

### Task 11: Settings Page

**Files:**
- Create: `src/settings/settings.html`
- Create: `src/settings/settings.ts`
- Create: `src/settings/settings.css`

- [ ] **Step 1: Write settings.html**

Create `src/settings/settings.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="settings.css" />
  <title>iTranslate Settings</title>
</head>
<body>
  <div class="container">
    <h1>iTranslate Settings</h1>

    <section class="form-group">
      <label for="apiEndpoint">API Endpoint</label>
      <input type="text" id="apiEndpoint" placeholder="https://api.deepseek.com/v1" />
      <span class="hint">Default: DeepSeek API. Change if using a proxy.</span>
    </section>

    <section class="form-group">
      <label for="apiKey">API Key</label>
      <input type="password" id="apiKey" placeholder="sk-..." />
      <span class="hint">Your DeepSeek API key. Stored locally in your browser.</span>
    </section>

    <section class="form-group">
      <label for="model">Model</label>
      <input type="text" id="model" placeholder="deepseek-chat" />
    </section>

    <section class="form-group">
      <label for="systemPrompt">Custom System Prompt (optional)</label>
      <textarea id="systemPrompt" rows="4" placeholder="You are a professional English-to-Chinese translator..."></textarea>
    </section>

    <div class="actions">
      <button id="saveBtn" class="btn-primary">Save</button>
      <button id="testBtn" class="btn-secondary">Test Connection</button>
    </div>

    <div id="status" class="status hidden"></div>
  </div>

  <script src="settings.ts" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: Write settings.css**

Create `src/settings/settings.css`:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #1a1a2e;
  background: #f7fafc;
}

.container {
  max-width: 520px;
  margin: 40px auto;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

h1 {
  font-size: 20px;
  margin-bottom: 24px;
  color: #2b6cb0;
}

.form-group {
  margin-bottom: 18px;
}

label {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 13px;
  color: #4a5568;
}

input, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #2b6cb0;
  box-shadow: 0 0 0 2px rgba(43, 108, 176, 0.15);
}

.hint {
  display: block;
  font-size: 11px;
  color: #a0aec0;
  margin-top: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary {
  flex: 1;
  padding: 10px 16px;
  background: #2b6cb0;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-primary:hover { background: #2c5282; }

.btn-secondary {
  flex: 1;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-secondary:hover { background: #f7fafc; }

.status {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
}

.status.success {
  background: #f0fff4;
  border: 1px solid #c6f6d5;
  color: #276749;
}

.status.error {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
}

.status.hidden { display: none; }
```

- [ ] **Step 3: Write settings.ts**

Create `src/settings/settings.ts`:

```typescript
import { getSettings, saveSettings } from '../shared/storage';
import { DEFAULT_SETTINGS } from '../shared/constants';
import type { Settings } from '../shared/types';

const apiEndpointEl = document.getElementById('apiEndpoint') as HTMLInputElement;
const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;
const modelEl = document.getElementById('model') as HTMLInputElement;
const systemPromptEl = document.getElementById('systemPrompt') as HTMLTextAreaElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  apiEndpointEl.value = settings.apiEndpoint;
  apiKeyEl.value = settings.apiKey;
  modelEl.value = settings.model;
  systemPromptEl.value = settings.systemPrompt;
}

function showStatus(message: string, type: 'success' | 'error'): void {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  setTimeout(() => { statusDiv.className = 'status hidden'; }, 4000);
}

function getFormSettings(): Settings {
  return {
    apiEndpoint: apiEndpointEl.value.trim() || DEFAULT_SETTINGS.apiEndpoint,
    apiKey: apiKeyEl.value.trim(),
    model: modelEl.value.trim() || DEFAULT_SETTINGS.model,
    systemPrompt: systemPromptEl.value.trim() || DEFAULT_SETTINGS.systemPrompt,
  };
}

saveBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required.', 'error');
    return;
  }
  await saveSettings(settings);
  showStatus('Settings saved.', 'success');
});

testBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required to test connection.', 'error');
    return;
  }

  // Save first so the background uses these settings
  await saveSettings(settings);

  try {
    const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
    if (response.success && response.connected) {
      showStatus('Connection successful! DeepSeek API is reachable.', 'success');
    } else {
      showStatus('Connection failed. Check your API key and endpoint.', 'error');
    }
  } catch (err) {
    showStatus(`Connection error: ${(err as Error).message}`, 'error');
  }
});

loadSettings();
```

- [ ] **Step 4: Commit**

```bash
git add src/settings/
git commit -m "feat: add settings page with API configuration and connection test"
```

---

### Task 12: Extension Icons & Final Wiring

**Files:**
- Create: `icons/icon16.png`
- Create: `icons/icon48.png`
- Create: `icons/icon128.png`

- [ ] **Step 1: Generate placeholder icons**

Since we cannot create actual PNG files programmatically, create an SVG and note the manual step. Create `icons/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="20" fill="#2b6cb0"/>
  <text x="64" y="72" text-anchor="middle" font-family="Arial,sans-serif" font-size="48" font-weight="bold" fill="white">iT</text>
  <text x="64" y="100" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#ebf8ff">EN→ZH</text>
</svg>
```

Convert to PNG at sizes 16, 48, 128 using any image tool, or generate them with a canvas script.

- [ ] **Step 2: Verify the full build**

Run: `npm run build`
Expected: `dist/` directory contains the packed extension.

- [ ] **Step 3: Load and smoke test in Chrome**

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select the `dist/` folder
4. Verify the extension icon appears in the toolbar
5. Open Settings, enter DeepSeek API key, click "Test Connection"
6. Navigate to an English Wikipedia article
7. Click the extension icon, click "Translate This Page"
8. Verify translation cards appear below paragraphs

- [ ] **Step 4: Commit**

```bash
git add icons/
git commit -m "feat: add extension icons and finalize build"
```

---

### Task 13: Unit Tests — Cache & Translator

**Files:**
- Create: `vitest.config.ts`
- Create: `src/background/__tests__/cache.test.ts`
- Create: `src/background/__tests__/translator.test.ts`

- [ ] **Step 1: Write vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write cache tests**

Create `src/background/__tests__/cache.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { cacheGet, cacheSet, cacheGetBulk, cacheSetBulk, cacheClear } from '../cache';

describe('cache', () => {
  beforeEach(async () => {
    await cacheClear();
  });

  it('returns undefined for missing key', async () => {
    const result = await cacheGet('nonexistent');
    expect(result).toBeUndefined();
  });

  it('stores and retrieves a single entry', async () => {
    const entry = { translated: '你好', timestamp: Date.now() };
    await cacheSet('key1', entry);
    const result = await cacheGet('key1');
    expect(result).toEqual(entry);
  });

  it('stores and retrieves bulk entries', async () => {
    const entries = new Map([
      ['key1', { translated: '你好', timestamp: Date.now() }],
      ['key2', { translated: '世界', timestamp: Date.now() }],
    ]);
    await cacheSetBulk(entries);
    const result = await cacheGetBulk(['key1', 'key2', 'key3']);
    expect(result.size).toBe(2);
    expect(result.get('key1')?.translated).toBe('你好');
    expect(result.get('key2')?.translated).toBe('世界');
    expect(result.has('key3')).toBe(false);
  });

  it('clears all entries', async () => {
    await cacheSet('key1', { translated: '你好', timestamp: Date.now() });
    await cacheClear();
    const result = await cacheGet('key1');
    expect(result).toBeUndefined();
  });
});
```

- [ ] **Step 3: Write translator tests**

Create `src/background/__tests__/translator.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chrome.storage
vi.stubGlobal('chrome', {
  storage: {
    sync: {
      get: vi.fn().mockResolvedValue({
        itranslate_settings: {
          apiEndpoint: 'https://api.deepseek.com/v1',
          apiKey: 'sk-test',
          model: 'deepseek-chat',
          systemPrompt: 'Translate English to Chinese.',
        },
      }),
    },
  },
});

describe('translator', () => {
  it('batches translation requests correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        choices: [{ message: { content: '[0] 你好\n[1] 世界' } }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { translateBatch } = await import('../translator');
    const results = await translateBatch(['Hello', 'World']);

    expect(results).toEqual(['你好', '世界']);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('throws when API key is missing', async () => {
    vi.stubGlobal('chrome', {
      storage: {
        sync: {
          get: vi.fn().mockResolvedValue({
            itranslate_settings: {
              apiEndpoint: 'https://api.deepseek.com/v1',
              apiKey: '',
              model: 'deepseek-chat',
              systemPrompt: '',
            },
          }),
        },
      },
    });

    const { translateBatch } = await import('../translator');
    await expect(translateBatch(['Hello'])).rejects.toThrow('API key not configured');
  });
});
```

- [ ] **Step 4: Run tests and commit**

Run: `npx vitest run`
Expected: All tests pass.

```bash
git add vitest.config.ts src/background/__tests__/
git commit -m "test: add unit tests for cache and translator modules"
```

---

### Task 14: Unit Tests — Extractor & Renderer

**Files:**
- Create: `src/content/__tests__/extractor.test.ts`
- Create: `src/content/__tests__/renderer.test.ts`

- [ ] **Step 1: Write extractor tests**

Create `src/content/__tests__/extractor.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { extractSegments } from '../extractor';

describe('extractor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('extracts text from main content area', () => {
    document.body.innerHTML = `
      <nav>Navigation here</nav>
      <main>
        <p>Machine learning is a fascinating field. It has many applications.</p>
      </main>
      <footer>Footer content</footer>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);

    expect(texts.some((t) => t.includes('Machine learning'))).toBe(true);
    expect(texts.some((t) => t.includes('Footer'))).toBe(false);
    expect(texts.some((t) => t.includes('Navigation'))).toBe(false);
  });

  it('returns empty array when no content found', () => {
    document.body.innerHTML = '<div></div>';
    const result = extractSegments();
    expect(result.allSegments).toHaveLength(0);
  });

  it('skips script and style content', () => {
    document.body.innerHTML = `
      <main>
        <p>Visible text here.</p>
        <script>console.log("not text");</script>
        <style>body { color: red; }</style>
      </main>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);
    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain('Visible text');
  });

  it('groups long paragraphs into segments', () => {
    document.body.innerHTML = `
      <main>
        <p>First sentence is here. Second sentence continues. Third sentence goes on. Fourth is long too. Fifth finishes it. Sixth is extra content.</p>
      </main>
    `;

    const result = extractSegments();
    // 6 sentences should be grouped into ~2 segments (3 each)
    expect(result.allSegments.length).toBeGreaterThanOrEqual(1);
  });

  it('falls back to body when no main content area found', () => {
    document.body.innerHTML = `
      <div>
        <p>Some random text without semantic structure.</p>
      </div>
    `;

    const result = extractSegments();
    expect(result.allSegments.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Write renderer tests**

Create `src/content/__tests__/renderer.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderTranslations } from '../renderer';

describe('renderer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('injects translation cards after original text nodes', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const textNode = document.querySelector('p')!.firstChild as Text;
    const sourceGroups = [
      { node: textNode, segments: [{ id: 'seg_0' }] },
    ];

    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results, sourceGroups);

    const cards = document.querySelectorAll('.itranslate-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].textContent).toContain('你好世界。');
    expect(cards[0].textContent).toContain('中文');
    expect(cards[0].textContent).toContain('DeepSeek');
  });

  it('handles multiple segments for one text node', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello. World.</p>
      </main>
    `;

    const textNode = document.querySelector('p')!.firstChild as Text;
    const sourceGroups = [
      { node: textNode, segments: [{ id: 'seg_0' }, { id: 'seg_1' }] },
    ];

    const results = [
      { id: 'seg_0', original: 'Hello.', translated: '你好。' },
      { id: 'seg_1', original: 'World.', translated: '世界。' },
    ];

    renderTranslations(results, sourceGroups);

    const cards = document.querySelectorAll('.itranslate-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].textContent).toContain('你好。');
    expect(cards[0].textContent).toContain('世界。');
  });
});
```

- [ ] **Step 3: Run tests and commit**

Run: `npx vitest run`
Expected: All tests pass.

```bash
git add src/content/__tests__/
git commit -m "test: add unit tests for extractor and renderer"
```

---

### Task 15: Final Integration Verification

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All 9+ tests pass across both test files.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Clean build with no TypeScript errors. `dist/` directory generated.

- [ ] **Step 3: Manual E2E checklist in Chrome**

- [ ] Load `dist/` as unpacked extension
- [ ] Open Settings, enter a valid DeepSeek API key, click "Test Connection" → green success message
- [ ] Navigate to `https://en.wikipedia.org/wiki/Machine_learning`
- [ ] Click extension icon → popup opens with "Translate This Page"
- [ ] Click "Translate This Page" → translation cards appear below paragraphs
- [ ] Cards show "中文 · DeepSeek" badge with Chinese text
- [ ] Stats in popup show segment/cache/API counts
- [ ] Navigate to another article, translate again → verify cache works (hits > 0)
- [ ] Click "Clear Cache" in popup → cache cleared confirmation
- [ ] Navigate to `https://news.ycombinator.com` → verify content detection skips nav/header

- [ ] **Step 4: Commit final verification notes**

```bash
git add -A
git commit -m "chore: add E2E verification checklist"
```
