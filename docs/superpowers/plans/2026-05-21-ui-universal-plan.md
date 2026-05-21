# UI 通用化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all hardcoded DeepSeek/EN→ZH assumptions, add language pair selection with auto-generated system prompts.

**Architecture:** Two new Settings fields (sourceLang, targetLang) drive the popup badge and system prompt. Settings page gets language pickers with swap button. All DeepSeek-specific copy replaced with generic messaging.

**Tech Stack:** TypeScript, vanilla DOM, Chrome Extension APIs (chrome.storage.sync)

---

### Task 1: Update Types & Constants

**Files:**
- Modify: `src/shared/types.ts:18-23`
- Modify: `src/shared/constants.ts:1-15`

Add `sourceLang` and `targetLang` to Settings. Define a language options array. Update the default system prompt to use language placeholders.

- [ ] **Step 1: Add language fields to Settings type**

```ts
// src/shared/types.ts — add to Settings interface
export interface Settings {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  sourceLang: string;
  targetLang: string;
}
```

- [ ] **Step 2: Add LANGUAGE_OPTIONS and update DEFAULT_SETTINGS**

```ts
// src/shared/constants.ts — add after imports, before DEFAULT_SETTINGS
export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'English' },
  { label: '中文', value: 'Chinese' },
  { label: '日本語', value: 'Japanese' },
  { label: '한국어', value: 'Korean' },
  { label: 'Français', value: 'French' },
  { label: 'Deutsch', value: 'German' },
];

// Update DEFAULT_SETTINGS
export const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  systemPrompt:
    'You are a professional English-to-Chinese translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the Chinese translation, nothing else.',
  sourceLang: 'English',
  targetLang: 'Chinese',
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: clean exit (no errors related to types/constants)

- [ ] **Step 4: Commit**

```bash
git add src/shared/types.ts src/shared/constants.ts
git commit -m "feat: add sourceLang/targetLang to Settings, define LANGUAGE_OPTIONS"
```

---

### Task 2: Settings HTML/CSS — Language Pickers & Generic Hints

**Files:**
- Modify: `src/settings/settings.html:10-43`
- Modify: `src/settings/settings.css:28-39`

Replace the single "Custom System Prompt" section with a language selection area above it. Update API hints to be provider-agnostic. Add CSS for the compact picker layout.

- [ ] **Step 1: Update settings.html form sections**

Replace the API endpoint hint, API key hint, and add language pickers before the system prompt.

```html
<!-- src/settings/settings.html — new body content -->
<body>
  <div class="container">
    <h1>iTranslate Settings</h1>

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
```

- [ ] **Step 2: Add CSS for language picker layout**

```css
/* Add to src/settings/settings.css */

.lang-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.lang-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.lang-col .hint {
  font-size: 11px;
  color: #a0aec0;
  margin-bottom: 4px;
}

.lang-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: white;
}

.lang-select:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}

.swap-btn {
  width: 36px;
  height: 36px;
  margin-bottom: 1px;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 6px;
  color: #7c3aed;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.swap-btn:hover {
  background: rgba(124, 58, 237, 0.15);
}

.hint-inline {
  font-weight: 400;
  color: #a0aec0;
  font-size: 11px;
}
```

- [ ] **Step 3: Verify TypeScript compiles and build**

```bash
npm run build
```

Expected: Build succeeds (settings.ts won't yet wire the new elements, but HTML changes are visible in dist)

- [ ] **Step 4: Commit**

```bash
git add src/settings/settings.html src/settings/settings.css
git commit -m "feat: add language picker UI and generic API hints to settings page"
```

---

### Task 3: Settings TS — Language Logic, Auto-Prompt, Swap

**Files:**
- Modify: `src/settings/settings.ts:1-68`

Wire up the language dropdowns, swap button, auto-generate system prompt from language selection, and fix the test connection success message.

- [ ] **Step 1: Rewrite settings.ts with language support**

```ts
import { getSettings, saveSettings } from '../shared/storage';
import { DEFAULT_SETTINGS, LANGUAGE_OPTIONS } from '../shared/constants';
import type { Settings } from '../shared/types';

const apiEndpointEl = document.getElementById('apiEndpoint') as HTMLInputElement;
const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;
const modelEl = document.getElementById('model') as HTMLInputElement;
const systemPromptEl = document.getElementById('systemPrompt') as HTMLTextAreaElement;
const sourceLangEl = document.getElementById('sourceLang') as HTMLSelectElement;
const targetLangEl = document.getElementById('targetLang') as HTMLSelectElement;
const swapBtn = document.getElementById('swapBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

function generateSystemPrompt(sourceLang: string, targetLang: string): string {
  return `You are a professional ${sourceLang}-to-${targetLang} translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the ${targetLang} translation, nothing else.`;
}

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

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  apiEndpointEl.value = settings.apiEndpoint;
  apiKeyEl.value = settings.apiKey;
  modelEl.value = settings.model;
  systemPromptEl.value = settings.systemPrompt;
  sourceLangEl.value = settings.sourceLang;
  targetLangEl.value = settings.targetLang;
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
    sourceLang: sourceLangEl.value,
    targetLang: targetLangEl.value,
  };
}

// Auto-update system prompt when language changes
sourceLangEl.addEventListener('change', () => {
  systemPromptEl.value = generateSystemPrompt(sourceLangEl.value, targetLangEl.value);
});

targetLangEl.addEventListener('change', () => {
  systemPromptEl.value = generateSystemPrompt(sourceLangEl.value, targetLangEl.value);
});

swapBtn.addEventListener('click', () => {
  const srcVal = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = srcVal;
  systemPromptEl.value = generateSystemPrompt(sourceLangEl.value, targetLangEl.value);
});

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

populateLanguageSelects();
loadSettings();
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: clean exit, no type errors

- [ ] **Step 3: Run existing tests**

```bash
npm test
```

Expected: All 25 tests pass (no existing tests touch settings.ts)

- [ ] **Step 4: Generate a settings storage test**

Create `src/shared/__tests__/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';

const mockStorage: Record<string, unknown> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

vi.stubGlobal('chrome', {
  storage: {
    sync: {
      get: (key: string) => Promise.resolve({ [key]: mockStorage[key] ?? null }),
      set: (items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      },
    },
  },
});

describe('storage', () => {
  it('returns defaults when no settings saved', async () => {
    const { getSettings } = await import('../storage');
    const settings = await getSettings();
    expect(settings.sourceLang).toBe('English');
    expect(settings.targetLang).toBe('Chinese');
  });

  it('merges saved settings over defaults', async () => {
    const { getSettings, saveSettings } = await import('../storage');
    await saveSettings({
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
      systemPrompt: 'Custom prompt',
      sourceLang: 'Japanese',
      targetLang: 'Korean',
    });
    const settings = await getSettings();
    expect(settings.sourceLang).toBe('Japanese');
    expect(settings.targetLang).toBe('Korean');
    expect(settings.apiEndpoint).toBe('https://api.openai.com/v1');
  });

  it('fills missing fields with defaults', async () => {
    // Simulate old settings without sourceLang/targetLang
    await chrome.storage.sync.set({
      itranslate_settings: {
        apiEndpoint: 'https://old.example.com',
        apiKey: 'old-key',
        model: 'old-model',
        systemPrompt: 'Old prompt',
      },
    });
    const { getSettings } = await import('../storage');
    const settings = await getSettings();
    expect(settings.sourceLang).toBe('English');
    expect(settings.targetLang).toBe('Chinese');
  });
});
```

- [ ] **Step 5: Run new tests**

```bash
npx vitest run src/shared/__tests__/storage.test.ts
```

Expected: 3/3 tests pass

- [ ] **Step 6: Commit**

```bash
git add src/settings/settings.ts src/shared/__tests__/storage.test.ts
git commit -m "feat: wire language pickers, auto-generate prompt, add storage tests"
```

---

### Task 4: Popup — Dynamic Language Badge

**Files:**
- Modify: `src/popup/popup.html:12`
- Modify: `src/popup/popup.ts:17-31`

Dynamically display the language pair from settings instead of hardcoded "EN → ZH".

- [ ] **Step 1: Update popup.html badge**

```html
<!-- src/popup/popup.html — line 12, replace hardcoded badge -->
<span id="langBadge" class="lang-badge">EN → ZH</span>
```

(Keep the same CSS class, just add an id for JS targeting)

- [ ] **Step 2: Update popup.ts syncState to load language pair**

In `src/popup/popup.ts`, add the import, element reference, and update `syncState()`:

```ts
// At top of file, add import:
import { getSettings } from '../shared/storage';

// Add element reference:
const langBadge = document.getElementById('langBadge') as HTMLSpanElement;

// In syncState(), add after activeTabId = tab.id:
    const settings = await getSettings();
    langBadge.textContent = `${settings.sourceLang} → ${settings.targetLang}`;

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getState' });
    if (response?.isTranslated) {
      isTranslated = true;
      translateBtn.textContent = 'Undo Translation';
    }
  } catch {
    // Content script not injected or not responding — stay with defaults
  }
}
```

Wait — `getSettings` is async but already imported at the top of settings.ts. However popup.ts is a different context. We need a way to read settings from the popup context. Since popup.ts runs in the extension's popup page (which has access to chrome.storage), we can directly import and call getSettings.

But actually, let's keep it cleaner: the popup should not import from shared/storage directly since that creates a dependency. Instead, use `chrome.storage.sync.get` inline, or import the helper. Actually, looking at the codebase, `getSettings` is already used in settings.ts — the popup can use it the same way. Let me just import it directly.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: Build succeeds

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: All 28 tests pass (25 existing + 3 new from Task 3)

- [ ] **Step 5: Commit**

```bash
git add src/popup/popup.html src/popup/popup.ts
git commit -m "feat: dynamic language badge in popup, reads from settings"
```

---

### Task 5: Integration Verification

**Files:**
- No new changes — verify everything works end to end

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: TypeScript check + Vite build, no errors

- [ ] **Step 2: Full test suite**

```bash
npm test
```

Expected: All tests pass (25 + 3 storage tests = 28)

- [ ] **Step 3: Manual verification checklist**

1. Open `chrome://extensions`, reload the extension
2. Open a new tab with any English webpage
3. Click popup — badge should show "English → 中文"
4. Click Translate — verify translation works as before
5. Open Settings page — verify language dropdowns show, default is English → 中文
6. Change language pair to 日本語 → English, save
7. Click popup — badge should show "Japanese → English"
8. Translate again — verify prompt is language-aware

- [ ] **Step 4: Commit any final tweaks**

```bash
git add -A
git commit -m "chore: final verification tweaks for UI universal update"
```
