# i18n Chinese/English Bilingual UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add bilingual (zh_CN / en) support to all user-facing surfaces using Chrome's built-in i18n API, with language auto-detected from browser UI language.

**Architecture:** Chrome Extension `_locales` system with `chrome.i18n.getMessage()` for JS strings and `__MSG_*__` placeholders for HTML and manifest. A thin `src/shared/i18n.ts` helper provides typed access and the `detectUILanguage()` utility.

**Tech Stack:** Chrome i18n API, TypeScript, Vitest

---

## File Structure

```
_locales/
  en/messages.json       — English translations (Create)
  zh_CN/messages.json    — Chinese translations (Create)
src/shared/
  i18n.ts                — t() wrapper, detectUILanguage() (Create)
  __tests__/
    i18n.test.ts         — Tests for i18n module (Create)
manifest.json            — Add default_locale, __MSG_*__ placeholders (Modify)
src/popup/popup.html     — Replace hardcoded strings with __MSG_*__ (Modify)
src/popup/popup.ts       — Replace hardcoded strings with t() (Modify)
src/settings/settings.html — Replace hardcoded strings with __MSG_*__ (Modify)
src/settings/settings.ts — Replace hardcoded strings with t() (Modify)
```

---

### Task 1: Create English translation file

**Files:**
- Create: `_locales/en/messages.json`

- [ ] **Step 1: Create `_locales/en/messages.json`**

```json
{
  "appName":                { "message": "iTranslate" },
  "settings":               { "message": "Settings" },
  "swapLanguages":          { "message": "Swap languages" },
  "translatePage":          { "message": "Translate This Page" },
  "undoTranslation":        { "message": "Undo Translation" },
  "translating":            { "message": "Translating..." },
  "clearCache":             { "message": "Clear Cache" },
  "cacheCleared":           { "message": "Cache Cleared!" },
  "cannotTranslatePage":    { "message": "Could not translate this page. Make sure you are on a webpage (not a browser internal page)." },
  "failedToClearCache":     { "message": "Failed to clear cache." },
  "version":                { "message": "iTranslate v$VERSION$" },
  "settingsTitle":          { "message": "iTranslate Settings" },
  "apiEndpoint":            { "message": "API Endpoint" },
  "apiEndpointHint":        { "message": "Any OpenAI-compatible API endpoint" },
  "apiKey":                 { "message": "API Key" },
  "apiKeyHint":             { "message": "Stored locally in your browser" },
  "model":                  { "message": "Model" },
  "systemPrompt":           { "message": "System Prompt" },
  "systemPromptEditable":   { "message": "editable" },
  "save":                   { "message": "Save" },
  "testConnection":         { "message": "Test Connection" },
  "apiKeyRequired":         { "message": "API key is required." },
  "settingsSaved":          { "message": "Settings saved." },
  "apiKeyRequiredForTest":  { "message": "API key is required to test connection." },
  "connectionSuccessful":   { "message": "Connection successful." },
  "connectionFailed":       { "message": "Connection failed. Check your API key and endpoint." },
  "connectionError":        { "message": "Connection error: $1" },
  "extName":                { "message": "iTranslate" },
  "extDescription":         { "message": "Immersive bilingual translation using DeepSeek AI" },
  "extDefaultTitle":        { "message": "iTranslate — Translate this page" }
}
```

- [ ] **Step 2: Commit**

```bash
git add _locales/en/messages.json
git commit -m "feat: add English i18n messages"
```

---

### Task 2: Create Chinese translation file

**Files:**
- Create: `_locales/zh_CN/messages.json`

- [ ] **Step 1: Create `_locales/zh_CN/messages.json`**

```json
{
  "appName":                { "message": "灵译" },
  "settings":               { "message": "设置" },
  "swapLanguages":          { "message": "交换语言" },
  "translatePage":          { "message": "翻译此页面" },
  "undoTranslation":        { "message": "撤销翻译" },
  "translating":            { "message": "翻译中..." },
  "clearCache":             { "message": "清除缓存" },
  "cacheCleared":           { "message": "缓存已清除" },
  "cannotTranslatePage":    { "message": "无法翻译此页面，请确认您正在浏览网页（非浏览器内部页面）。" },
  "failedToClearCache":     { "message": "清除缓存失败。" },
  "version":                { "message": "灵译 v$VERSION$" },
  "settingsTitle":          { "message": "灵译设置" },
  "apiEndpoint":            { "message": "API 端点" },
  "apiEndpointHint":        { "message": "任意 OpenAI 兼容的 API 端点" },
  "apiKey":                 { "message": "API 密钥" },
  "apiKeyHint":             { "message": "存储在浏览器本地" },
  "model":                  { "message": "模型" },
  "systemPrompt":           { "message": "系统提示" },
  "systemPromptEditable":   { "message": "可编辑" },
  "save":                   { "message": "保存" },
  "testConnection":         { "message": "测试连接" },
  "apiKeyRequired":         { "message": "需要填写 API 密钥" },
  "settingsSaved":          { "message": "设置已保存" },
  "apiKeyRequiredForTest":  { "message": "测试连接需要填写 API 密钥" },
  "connectionSuccessful":   { "message": "连接成功" },
  "connectionFailed":       { "message": "连接失败，请检查 API 密钥和端点" },
  "connectionError":        { "message": "连接错误：$1" },
  "extName":                { "message": "灵译" },
  "extDescription":         { "message": "使用 DeepSeek AI 的沉浸式双语翻译" },
  "extDefaultTitle":        { "message": "灵译 — 翻译此页面" }
}
```

- [ ] **Step 2: Commit**

```bash
git add _locales/zh_CN/messages.json
git commit -m "feat: add Chinese i18n messages"
```

---

### Task 3: Create i18n helper module with tests

**Files:**
- Create: `src/shared/i18n.ts`
- Create: `src/shared/__tests__/i18n.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/shared/__tests__/i18n.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';

// Mock chrome.i18n before importing the module
let mockUILanguage = 'en-US';
let mockMessages: Record<string, string> = {};

beforeEach(() => {
  mockUILanguage = 'en-US';
  mockMessages = {};
});

vi.stubGlobal('chrome', {
  i18n: {
    getUILanguage: () => mockUILanguage,
    getMessage: (key: string, substitutions?: string | string[]) => {
      let msg = mockMessages[key];
      if (msg === undefined || msg === '') return '';
      if (substitutions) {
        if (Array.isArray(substitutions)) {
          substitutions.forEach((s, i) => {
            msg = msg.replace(`$${i + 1}`, s);
          });
        } else {
          msg = msg.replace('$1', substitutions);
        }
      }
      return msg;
    },
  },
});

describe('detectUILanguage', () => {
  it('returns zh_CN for zh-CN browser language', async () => {
    mockUILanguage = 'zh-CN';
    const { detectUILanguage } = await import('../i18n');
    expect(detectUILanguage()).toBe('zh_CN');
  });

  it('returns zh_CN for zh-TW browser language', async () => {
    mockUILanguage = 'zh-TW';
    const { detectUILanguage } = await import('../i18n');
    expect(detectUILanguage()).toBe('zh_CN');
  });

  it('returns zh_CN for zh browser language', async () => {
    mockUILanguage = 'zh';
    const { detectUILanguage } = await import('../i18n');
    expect(detectUILanguage()).toBe('zh_CN');
  });

  it('returns en for en-US browser language', async () => {
    mockUILanguage = 'en-US';
    const { detectUILanguage } = await import('../i18n');
    expect(detectUILanguage()).toBe('en');
  });

  it('returns en for en-GB browser language', async () => {
    mockUILanguage = 'en-GB';
    const { detectUILanguage } = await import('../i18n');
    expect(detectUILanguage()).toBe('en');
  });

  it('returns en for unsupported languages (ja, ko, fr, de)', async () => {
    mockUILanguage = 'ja';
    const { detectUILanguage } = await import('../i18n');
    expect(detectUILanguage()).toBe('en');
  });
});

describe('t', () => {
  it('returns translated message for known key', async () => {
    mockMessages = { hello: 'Hello' };
    const { t } = await import('../i18n');
    expect(t('hello')).toBe('Hello');
  });

  it('returns key as fallback when message is missing', async () => {
    mockMessages = {};
    const { t } = await import('../i18n');
    expect(t('unknown_key')).toBe('unknown_key');
  });

  it('substitutes $1 placeholder', async () => {
    mockMessages = { error: 'Error: $1' };
    const { t } = await import('../i18n');
    expect(t('error', 'timeout')).toBe('Error: timeout');
  });

  it('substitutes multiple placeholders', async () => {
    mockMessages = { range: '$1 to $2' };
    const { t } = await import('../i18n');
    expect(t('range', ['1', '10'])).toBe('1 to 10');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/shared/__tests__/i18n.test.ts
```
Expected: FAIL — `Cannot find module '../i18n'`

- [ ] **Step 3: Write `src/shared/i18n.ts`**

```ts
export function detectUILanguage(): 'en' | 'zh_CN' {
  const lang = chrome.i18n.getUILanguage();
  if (lang.startsWith('zh')) return 'zh_CN';
  return 'en';
}

export function t(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/shared/__tests__/i18n.test.ts
```
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/shared/i18n.ts src/shared/__tests__/i18n.test.ts
git commit -m "feat: add i18n helper module with language detection"
```

---

### Task 4: Localize manifest.json

**Files:**
- Modify: `manifest.json`

- [ ] **Step 1: Update `manifest.json`**

Add `"default_locale": "en"` and replace hardcoded strings with `__MSG_*__` placeholders:

```json
{
  "manifest_version": 3,
  "name": "__MSG_extName__",
  "version": "1.0.2",
  "default_locale": "en",
  "description": "__MSG_extDescription__",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "src/background/index.ts"
  },
  "content_scripts": [
    {
      "matches": ["http://*/*", "https://*/*"],
      "js": ["src/content/index.ts"],
      "css": ["src/content/styles.css"]
    }
  ],
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_title": "__MSG_extDefaultTitle__"
  },
  "options_page": "src/settings/settings.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add manifest.json
git commit -m "feat: localize manifest with __MSG_*__ placeholders"
```

---

### Task 5: Localize popup.html

**Files:**
- Modify: `src/popup/popup.html`

- [ ] **Step 1: Replace all hardcoded strings with `__MSG_*__` placeholders**

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
        <span class="logo">__MSG_appName__</span>
      </div>
      <button id="settingsBtn" class="icon-btn" title="__MSG_settings__">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    </div>

    <div class="lang-row">
      <div class="lang-col">
        <select id="sourceLang" class="lang-select"></select>
      </div>
      <button id="swapBtn" class="swap-btn" title="__MSG_swapLanguages__">⇄</button>
      <div class="lang-col">
        <select id="targetLang" class="lang-select"></select>
      </div>
    </div>

    <button id="translateBtn" class="btn-primary">__MSG_translatePage__</button>

    <div class="actions">
      <button id="clearCacheBtn" class="btn-secondary">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        __MSG_clearCache__
      </button>
    </div>

    <div id="error" class="error hidden"></div>

    <div class="footer">
      <span class="version" id="versionLabel"></span>
    </div>
  </div>

  <script src="popup.ts" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/popup/popup.html
git commit -m "feat: localize popup.html with __MSG_*__ placeholders"
```

---

### Task 6: Localize popup.ts

**Files:**
- Modify: `src/popup/popup.ts`

- [ ] **Step 1: Update `popup.ts` to use `t()` for all strings**

The changes:
1. Add `import { t } from '../shared/i18n';` at the top
2. Replace all hardcoded English strings with `t()` calls
3. Set the version label via JS with `t('version', [manifestVersion])`

```ts
import { getSettings, saveSettings } from '../shared/storage';
import { LANGUAGE_OPTIONS } from '../shared/constants';
import { detectPageLang, detectLangFromText } from '../shared/lang-detect';
import { t } from '../shared/i18n';

const translateBtn = document.getElementById('translateBtn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
const clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;
const sourceLangEl = document.getElementById('sourceLang') as HTMLSelectElement;
const targetLangEl = document.getElementById('targetLang') as HTMLSelectElement;
const swapBtn = document.getElementById('swapBtn') as HTMLButtonElement;
const errorDiv = document.getElementById('error') as HTMLDivElement;
const versionLabel = document.getElementById('versionLabel') as HTMLSpanElement;

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

  // Auto-detect page language if user hasn't locked source manually
  if (!settings.sourceLangLocked) {
    try {
      const tab = await getActiveTab();
      if (tab.id) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.documentElement.lang,
        });
        const pageLang = results[0]?.result ?? null;
        let detected = detectPageLang(pageLang);

        // Fallback: character-based detection when <html lang> is missing
        if (!detected) {
          const textResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText.slice(0, 2000),
          });
          const bodyText = textResults[0]?.result ?? '';
          detected = detectLangFromText(bodyText);
        }

        if (detected && detected !== settings.sourceLang) {
          settings.sourceLang = detected;
          sourceLangEl.value = detected;
        }
      }
    } catch {
      // chrome:// page or restricted — silently skip
    }
  }

  // Auto-detect target language from browser UI language if user hasn't locked it
  if (!settings.targetLangLocked) {
    const detected = detectPageLang(navigator.language);
    if (detected && detected !== settings.targetLang) {
      settings.targetLang = detected;
      targetLangEl.value = detected;
    }
  }

  settings.systemPrompt = generateSystemPrompt(settings.sourceLang, settings.targetLang);
  await saveSettings(settings);
}

function generateSystemPrompt(sourceLang: string, targetLang: string): string {
  return `You are a professional ${sourceLang}-to-${targetLang} translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the ${targetLang} translation, nothing else.`;
}

async function saveLanguageSettings(lockSource = false, lockTarget = false): Promise<void> {
  const settings = await getSettings();
  settings.sourceLang = sourceLangEl.value;
  settings.targetLang = targetLangEl.value;
  if (lockSource) settings.sourceLangLocked = true;
  if (lockTarget) settings.targetLangLocked = true;
  settings.systemPrompt = generateSystemPrompt(settings.sourceLang, settings.targetLang);
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
      translateBtn.textContent = t('undoTranslation');
    }
  } catch {
    // Content script not injected or not responding — stay with defaults
  }
}

// Set version label
versionLabel.textContent = t('version', [chrome.runtime.getManifest().version]);

populateLanguageSelects();
loadLanguageSettings();
syncState();

sourceLangEl.addEventListener('change', () => {
  saveLanguageSettings(true);
});

targetLangEl.addEventListener('change', () => {
  saveLanguageSettings(false, true);
});

swapBtn.addEventListener('click', async () => {
  const srcVal = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = srcVal;
  await saveLanguageSettings(true, true);
});

async function ensureContentScript(tabId: number): Promise<void> {
  const manifest = chrome.runtime.getManifest();
  const csFiles = manifest.content_scripts?.[0]?.js;
  if (csFiles && csFiles.length > 0) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: csFiles,
    });
  }
}

translateBtn.addEventListener('click', async () => {
  errorDiv.classList.add('hidden');

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error('No active tab');

    activeTabId = tab.id;

    if (!isTranslated) {
      translateBtn.disabled = true;
      translateBtn.textContent = t('translating');
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
      } catch {
        // Content script may be stale after extension update — re-inject and retry
        await ensureContentScript(tab.id!);
        await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
      }
      window.close();
    } else {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'undoTranslation' });
      } catch {
        await ensureContentScript(tab.id!);
        await chrome.tabs.sendMessage(tab.id, { action: 'undoTranslation' });
      }
      isTranslated = false;
      translateBtn.textContent = t('translatePage');
      window.close();
    }
  } catch (err) {
    errorDiv.textContent = t('cannotTranslatePage');
    errorDiv.classList.remove('hidden');
    isTranslated = false;
    translateBtn.disabled = false;
    translateBtn.textContent = t('translatePage');
  }
});

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

clearCacheBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'clearCache' });
    clearCacheBtn.textContent = t('cacheCleared');
    setTimeout(() => {
      clearCacheBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> ' + t('clearCache');
    }, 1500);
  } catch (err) {
    errorDiv.textContent = t('failedToClearCache');
    errorDiv.classList.remove('hidden');
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab?.id !== activeTabId) return;

  if (message.action === 'translationComplete') {
    isTranslated = true;
    translateBtn.disabled = false;
    translateBtn.textContent = t('undoTranslation');
  }
  if (message.action === 'translationError') {
    isTranslated = false;
    translateBtn.disabled = false;
    translateBtn.textContent = t('translatePage');
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add src/popup/popup.ts
git commit -m "feat: localize popup.ts with t() calls"
```

---

### Task 7: Localize settings.html

**Files:**
- Modify: `src/settings/settings.html`

- [ ] **Step 1: Replace all hardcoded strings with `__MSG_*__` placeholders**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="settings.css" />
  <title>__MSG_settingsTitle__</title>
</head>
<body>
  <div class="container">
    <h1>__MSG_settingsTitle__</h1>

    <section class="form-group">
      <label for="apiEndpoint">__MSG_apiEndpoint__</label>
      <input type="text" id="apiEndpoint" placeholder="https://api.deepseek.com/v1" />
      <span class="hint">__MSG_apiEndpointHint__</span>
    </section>

    <section class="form-group">
      <label for="apiKey">__MSG_apiKey__</label>
      <input type="password" id="apiKey" placeholder="sk-..." />
      <span class="hint">__MSG_apiKeyHint__</span>
    </section>

    <section class="form-group">
      <label for="model">__MSG_model__</label>
      <input type="text" id="model" placeholder="deepseek-chat" />
    </section>

    <section class="form-group">
      <label for="systemPrompt">__MSG_systemPrompt__ <span class="hint-inline">(__MSG_systemPromptEditable__)</span></label>
      <textarea id="systemPrompt" rows="4" placeholder="You are a professional English-to-Chinese translator..."></textarea>
    </section>

    <div class="actions">
      <button id="saveBtn" class="btn-primary">__MSG_save__</button>
      <button id="testBtn" class="btn-secondary">__MSG_testConnection__</button>
    </div>

    <div id="status" class="status hidden"></div>
  </div>

  <script src="settings.ts" type="module"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/settings/settings.html
git commit -m "feat: localize settings.html with __MSG_*__ placeholders"
```

---

### Task 8: Localize settings.ts

**Files:**
- Modify: `src/settings/settings.ts`

- [ ] **Step 1: Update `settings.ts` to use `t()` for all strings**

The changes:
1. Add `import { t } from '../shared/i18n';` at the top
2. Replace all `showStatus()` string arguments with `t()` calls

```ts
import { getSettings, saveSettings } from '../shared/storage';
import { DEFAULT_SETTINGS } from '../shared/constants';
import type { Settings } from '../shared/types';
import { t } from '../shared/i18n';

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
    sourceLangLocked: false,
    targetLangLocked: false,
  };
}

saveBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus(t('apiKeyRequired'), 'error');
    return;
  }
  // Preserve language settings from storage (not managed on this page)
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  settings.sourceLangLocked = current.sourceLangLocked;
  settings.targetLangLocked = current.targetLangLocked;
  await saveSettings(settings);
  showStatus(t('settingsSaved'), 'success');
});

testBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus(t('apiKeyRequiredForTest'), 'error');
    return;
  }
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  settings.sourceLangLocked = current.sourceLangLocked;
  settings.targetLangLocked = current.targetLangLocked;
  await saveSettings(settings);

  try {
    const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
    if (response.success && response.connected) {
      showStatus(t('connectionSuccessful'), 'success');
    } else {
      showStatus(t('connectionFailed'), 'error');
    }
  } catch (err) {
    showStatus(t('connectionError', [(err as Error).message]), 'error');
  }
});

loadSettings();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    loadSettings();
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add src/settings/settings.ts
git commit -m "feat: localize settings.ts with t() calls"
```

---

### Task 9: Build and verify

**Files:**
- No code changes — verification only

- [ ] **Step 1: Run full test suite**

```bash
npm test
```
Expected: All tests pass (44 existing + 9 new = 53 tests)

- [ ] **Step 2: Build production bundle**

```bash
npm run build
```
Expected: No TypeScript errors, dist/ produced successfully

- [ ] **Step 3: Verify `_locales` are copied to dist/**

```bash
ls dist/_locales/en/messages.json dist/_locales/zh_CN/messages.json
```
Expected: Both files exist in dist/

- [ ] **Step 4: Verify `__MSG_*__` placeholders in dist HTML**

```bash
grep -c "__MSG_" dist/src/popup/popup.html dist/src/settings/settings.html
```
Expected: Both files contain `__MSG_` placeholders (non-zero count)

- [ ] **Step 5: Commit (if any build artifacts are tracked)**

```bash
git status
```
If nothing to commit, done. Otherwise review and commit any build output changes.
```

