# Popup UX Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move language selection from deep Settings page to popup, remove stats, add gear icon + version footer, switch to icon+text buttons.

**Architecture:** Pure UI refactor — popup and settings page HTML/TS/CSS changes. Shared storage layer (`getSettings`/`saveSettings`) unchanged. No backend or content script changes.

**Tech Stack:** TypeScript, Chrome Extension Manifest V3, Vite + @crxjs/vite-plugin

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/popup/popup.html` | Modify | New DOM structure: language row, gear icon, version footer, no stats |
| `src/popup/popup.ts` | Modify | Language select logic, swap, load/save from storage |
| `src/popup/popup.css` | Modify | New styles for language row, gear btn, footer, icon buttons |
| `src/settings/settings.html` | Modify | Remove Translation Direction section |
| `src/settings/settings.ts` | Modify | Remove language-related code (generateSystemPrompt, swap, etc.) |

---

### Task 1: Update popup.html structure

**Files:**
- Modify: `src/popup/popup.html`

- [ ] **Step 1: Replace popup.html with new structure**

Replace the entire file content:

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
      <div class="header-left">
        <span class="logo">iTranslate</span>
      </div>
      <button id="settingsBtn" class="icon-btn" title="Settings">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    </div>

    <div class="lang-row">
      <div class="lang-col">
        <select id="sourceLang" class="lang-select"></select>
      </div>
      <button id="swapBtn" class="swap-btn" title="Swap languages">⇄</button>
      <div class="lang-col">
        <select id="targetLang" class="lang-select"></select>
      </div>
    </div>

    <button id="translateBtn" class="btn-primary">Translate This Page</button>

    <div class="actions">
      <button id="clearCacheBtn" class="btn-secondary">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Clear Cache
      </button>
    </div>

    <div id="error" class="error hidden"></div>

    <div class="footer">
      <span class="version">iTranslate v1.0.1</span>
    </div>
  </div>

  <script src="popup.ts" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: Verify HTML is well-formed**

```bash
npx tsc --noEmit
```

Expected: No errors from malformed HTML (Vite handles HTML parsing).

- [ ] **Step 3: Commit**

```bash
git add src/popup/popup.html
git commit -m "feat: restructure popup HTML — language row, gear icon, version footer, remove stats"
```

---

### Task 2: Update popup.css styles

**Files:**
- Modify: `src/popup/popup.css`

- [ ] **Step 1: Replace popup.css with new styles**

Replace the entire file content:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #1a1a2e;
}

.popup { padding: 16px; }

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.logo {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.icon-btn {
  padding: 4px 6px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  line-height: 1;
}

.icon-btn:hover {
  background: #f8f7fc;
  color: #7c3aed;
  border-color: rgba(124, 58, 237, 0.3);
}

/* Language row */
.lang-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  background: #f8f7fc;
  border-radius: 8px;
  padding: 6px 8px;
}

.lang-col {
  flex: 1;
}

.lang-select {
  width: 100%;
  padding: 5px 6px;
  font-size: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: #fff;
  color: #1a1a2e;
  font-family: inherit;
  cursor: pointer;
}

.lang-select:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}

.swap-btn {
  width: 28px;
  height: 28px;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 4px;
  color: #7c3aed;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

.swap-btn:hover {
  background: rgba(124, 58, 237, 0.15);
}

/* Primary button */
.btn-primary {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 10px;
}

.btn-primary:hover { background: linear-gradient(135deg, #4338ca, #6d28d9); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Actions */
.actions { display: flex; gap: 8px; margin-bottom: 8px; }

.btn-secondary {
  flex: 1;
  padding: 6px 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #4a5568;
  font-family: inherit;
}

.btn-secondary:hover {
  background: #f8f7fc;
}

.btn-secondary svg {
  flex-shrink: 0;
}

/* Error */
.error {
  padding: 8px 12px;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 4px;
  color: #c53030;
  font-size: 12px;
}

.error.hidden { display: none; }

/* Footer */
.footer {
  display: flex;
  justify-content: center;
  padding-top: 6px;
  margin-top: 4px;
  border-top: 1px solid #f0f0f0;
}

.version {
  font-size: 9px;
  color: #cbd5e0;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/popup/popup.css
git commit -m "feat: update popup styles — language row, icon buttons, version footer"
```

---

### Task 3: Update popup.ts logic

**Files:**
- Modify: `src/popup/popup.ts`

- [ ] **Step 1: Replace popup.ts with new logic**

Replace the entire file content:

```typescript
import { getSettings, saveSettings } from '../shared/storage';
import { LANGUAGE_OPTIONS } from '../shared/constants';

const translateBtn = document.getElementById('translateBtn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
const clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;
const sourceLangEl = document.getElementById('sourceLang') as HTMLSelectElement;
const targetLangEl = document.getElementById('targetLang') as HTMLSelectElement;
const swapBtn = document.getElementById('swapBtn') as HTMLButtonElement;
const errorDiv = document.getElementById('error') as HTMLDivElement;

let isTranslated = false;
let activeTabId: number | null = null;

function populateLanguageSelects(): void {
  for (const lang of LANGUAGE_OPTIONS) {
    const opt1 = document.createElement('option');
    opt1.value = lang.value;
    opt1.textContent = lang.label;
    sourceLangEl.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = lang.value;
    opt2.textContent = lang.label;
    targetLangEl.appendChild(opt2);
  }
}

async function loadLanguageSettings(): Promise<void> {
  const settings = await getSettings();
  sourceLangEl.value = settings.sourceLang;
  targetLangEl.value = settings.targetLang;
}

async function saveLanguageSettings(): Promise<void> {
  const settings = await getSettings();
  settings.sourceLang = sourceLangEl.value;
  settings.targetLang = targetLangEl.value;
  await saveSettings(settings);
}

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function syncState(): Promise<void> {
  try {
    const tab = await getActiveTab();
    if (!tab.id) return;
    activeTabId = tab.id;

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getState' });
    if (response?.isTranslated) {
      isTranslated = true;
      translateBtn.textContent = 'Undo Translation';
    }
  } catch {
    // Content script not injected or not responding — stay with defaults
  }
}

populateLanguageSelects();
loadLanguageSettings();
syncState();

sourceLangEl.addEventListener('change', () => {
  saveLanguageSettings();
});

targetLangEl.addEventListener('change', () => {
  saveLanguageSettings();
});

swapBtn.addEventListener('click', async () => {
  const srcVal = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = srcVal;
  await saveLanguageSettings();
});

translateBtn.addEventListener('click', async () => {
  errorDiv.classList.add('hidden');

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error('No active tab');

    activeTabId = tab.id;

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
    isTranslated = false;
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
    setTimeout(() => {
      clearCacheBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear Cache';
    }, 1500);
  } catch (err) {
    errorDiv.textContent = 'Failed to clear cache.';
    errorDiv.classList.remove('hidden');
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab?.id !== activeTabId) return;

  if (message.action === 'translationComplete') {
    isTranslated = true;
    translateBtn.disabled = false;
    translateBtn.textContent = 'Undo Translation';
  }
  if (message.action === 'translationError') {
    isTranslated = false;
    translateBtn.disabled = false;
    translateBtn.textContent = 'Translate This Page';
  }
});
```

Key changes from original:
- Removed: `statsDiv`, `segCountEl`, `cacheHitsEl`, `apiCallsEl`, `langBadge` element refs
- Added: `sourceLangEl`, `targetLangEl`, `swapBtn` element refs
- Added: `populateLanguageSelects()`, `loadLanguageSettings()`, `saveLanguageSettings()`
- Language selects: change event auto-saves to storage
- Swap: exchanges values and auto-saves
- `syncState()` no longer reads language badge (removed)
- `clearCacheBtn` uses `innerHTML` to restore icon+text (replaces `textContent`)
- `translationComplete` handler no longer updates stats (removed from DOM)
- `translationError` handler simplified (was unused, kept for safety)

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/popup/popup.ts
git commit -m "feat: update popup logic — language selects, swap, gear icon, remove stats"
```

---

### Task 4: Update settings.html — remove language section

**Files:**
- Modify: `src/settings/settings.html`

- [ ] **Step 1: Remove Translation Direction section**

Remove lines 13–26 (the `<section class="form-group">` containing Translation Direction, source/target selects, and swap button):

```html
    <section class="form-group">
      <label>Translation Direction</label>
      <div class="lang-row">
        <div class="lang-col">
          <span class="hint">Source</span>
          <select id="sourceLang" class="lang-select"></select>
        </div>
        <button id="swapBtn" class="swap-btn" title="Swap languages">⇄</button>
        <div class="lang-col">
          <span class="hint">Target</span>
          <select id="targetLang" class="lang-select"></select>
        </div>
      </div>
    </section>
```

The resulting HTML should be:

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
      <span class="hint">Any OpenAI-compatible API endpoint</span>
    </section>

    <section class="form-group">
      <label for="apiKey">API Key</label>
      <input type="password" id="apiKey" placeholder="sk-..." />
      <span class="hint">Stored locally in your browser</span>
    </section>

    <section class="form-group">
      <label for="model">Model</label>
      <input type="text" id="model" placeholder="deepseek-chat" />
    </section>

    <section class="form-group">
      <label for="systemPrompt">System Prompt <span class="hint-inline">(auto-generated, editable)</span></label>
      <textarea id="systemPrompt" rows="4" placeholder="You are a professional translator..."></textarea>
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

Note: System Prompt hint text changed from "auto-generated, editable" to just "editable" since auto-generation on language change is removed.

- [ ] **Step 2: Commit**

```bash
git add src/settings/settings.html
git commit -m "refactor: remove language direction from settings page"
```

---

### Task 5: Update settings.ts — remove language-related code

**Files:**
- Modify: `src/settings/settings.ts`

- [ ] **Step 1: Replace settings.ts with simplified version**

Replace the entire file content:

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
    sourceLang: '',
    targetLang: '',
  };
}

saveBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required.', 'error');
    return;
  }
  // Preserve language settings from storage (not managed on this page)
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  await saveSettings(settings);
  showStatus('Settings saved.', 'success');
});

testBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required to test connection.', 'error');
    return;
  }
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  await saveSettings(settings);

  try {
    const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
    if (response.success && response.connected) {
      showStatus('Connection successful.', 'success');
    } else {
      showStatus('Connection failed. Check your API key and endpoint.', 'error');
    }
  } catch (err) {
    showStatus(`Connection error: ${(err as Error).message}`, 'error');
  }
});

loadSettings();
```

Key changes from original:
- Removed: `sourceLangEl`, `targetLangEl`, `swapBtn`, `generateSystemPrompt()`, `populateLanguageSelects()`, `promptEdited` variable, `trySetPrompt()`, language change listeners, swap click listener
- `getFormSettings()` sets `sourceLang: ''` and `targetLang: ''` as placeholders
- `saveBtn` and `testBtn` handlers now fetch current language settings from storage before saving, preserving popup-managed values
- `loadSettings()` no longer loads language selects (removed from page)

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/settings/settings.ts
git commit -m "refactor: remove language logic from settings page, preserve popup-managed values on save"
```

---

### Task 6: Build verification + version bump

**Files:**
- Modify: `manifest.json`
- Modify: `src/popup/popup.html`

- [ ] **Step 1: Bump version to 1.0.2 in manifest.json**

```diff
-  "version": "1.0.1",
+  "version": "1.0.2",
```

- [ ] **Step 2: Bump version in popup.html footer**

```diff
-    <span class="version">iTranslate v1.0.1</span>
+    <span class="version">iTranslate v1.0.2</span>
```

- [ ] **Step 3: Build the extension**

```bash
npm run build
```

Expected: Clean build, no errors. `dist/` populated with bundled extension.

- [ ] **Step 4: Run existing tests to verify no regressions**

```bash
npm test
```

Expected: All 28 tests pass. No test changes needed since this is a pure UI refactor.

- [ ] **Step 5: Commit version bump and build**

```bash
git add manifest.json src/popup/popup.html
git commit -m "chore: bump version to 1.0.2"
```
