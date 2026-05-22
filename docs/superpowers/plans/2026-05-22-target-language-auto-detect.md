# Target Language Auto-Detect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-detect browser UI language as default target language when user hasn't manually selected one, with Chinese fallback.

**Architecture:** Mirror the existing `sourceLangLocked` pattern — add `targetLangLocked` to Settings, detect via `navigator.language` + existing `detectPageLang()` in popup's `loadLanguageSettings()`, lock on manual change and swap.

**Tech Stack:** TypeScript, Chrome Extension MV3, Vitest

---

### Task 1: Add `targetLangLocked` to Settings type and defaults

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `src/shared/constants.ts`

- [ ] **Step 1: Add `targetLangLocked` to Settings interface**

In `src/shared/types.ts`, add the field after `sourceLangLocked`:

```ts
export interface Settings {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  sourceLang: string;
  targetLang: string;
  sourceLangLocked: boolean;
  targetLangLocked: boolean;
}
```

- [ ] **Step 2: Add `targetLangLocked` to DEFAULT_SETTINGS**

In `src/shared/constants.ts`, add after `sourceLangLocked`:

```ts
export const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  systemPrompt:
    'You are a professional English-to-Chinese translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the Chinese translation, nothing else.',
  sourceLang: 'English',
  targetLang: 'Chinese',
  sourceLangLocked: false,
  targetLangLocked: false,
};
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors (settings.ts and popup.ts will still compile — `targetLangLocked` is optional in partial Settings objects)

- [ ] **Step 4: Commit**

```bash
git add src/shared/types.ts src/shared/constants.ts
git commit -m "feat: add targetLangLocked field to Settings type and defaults"
```

---

### Task 2: Update storage tests for `targetLangLocked`

**Files:**
- Modify: `src/shared/__tests__/storage.test.ts`

- [ ] **Step 1: Add `targetLangLocked` to the "returns defaults" test**

Change the assertion at the end of the first test:

```ts
it('returns defaults when no settings saved', async () => {
  const { getSettings } = await import('../storage');
  const settings = await getSettings();
  expect(settings.sourceLang).toBe('English');
  expect(settings.targetLang).toBe('Chinese');
  expect(settings.sourceLangLocked).toBe(false);
  expect(settings.targetLangLocked).toBe(false);
});
```

- [ ] **Step 2: Add `targetLangLocked` to the "merges saved settings" test**

Add `targetLangLocked: true` to the `saveSettings` call and assert it:

```ts
it('merges saved settings over defaults', async () => {
  const { getSettings, saveSettings } = await import('../storage');
  await saveSettings({
    apiEndpoint: 'https://api.openai.com/v1',
    apiKey: 'sk-test',
    model: 'gpt-4o',
    systemPrompt: 'Custom prompt',
    sourceLang: 'Japanese',
    targetLang: 'Korean',
    sourceLangLocked: true,
    targetLangLocked: true,
  });
  const settings = await getSettings();
  expect(settings.sourceLang).toBe('Japanese');
  expect(settings.targetLang).toBe('Korean');
  expect(settings.apiEndpoint).toBe('https://api.openai.com/v1');
  expect(settings.sourceLangLocked).toBe(true);
  expect(settings.targetLangLocked).toBe(true);
});
```

- [ ] **Step 3: Add `targetLangLocked` to the "fills missing fields" test**

Add the assertion:

```ts
it('fills missing fields with defaults', async () => {
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
  expect(settings.sourceLangLocked).toBe(false);
  expect(settings.targetLangLocked).toBe(false);
});
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/shared/__tests__/storage.test.ts`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/__tests__/storage.test.ts
git commit -m "test: cover targetLangLocked in storage tests"
```

---

### Task 3: Auto-detect target language in popup

**Files:**
- Modify: `src/popup/popup.ts`
- Modify: `src/settings/settings.ts`

- [ ] **Step 1: Update `getFormSettings()` in settings.ts**

Add `targetLangLocked: false` to the returned object:

```ts
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
```

- [ ] **Step 2: Preserve `targetLangLocked` when saving settings page**

In the save and test handlers, add `targetLangLocked` preservation:

In `saveBtn` click handler (after existing `settings.sourceLangLocked = current.sourceLangLocked`):

```ts
settings.targetLangLocked = current.targetLangLocked;
```

In `testBtn` click handler, add the same line after the existing sourceLangLocked line:

```ts
settings.targetLangLocked = current.targetLangLocked;
```

The full save handler becomes:

```ts
saveBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required.', 'error');
    return;
  }
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  settings.sourceLangLocked = current.sourceLangLocked;
  settings.targetLangLocked = current.targetLangLocked;
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
  // ... rest unchanged
});
```

Wait — the testBtn handler doesn't currently preserve sourceLangLocked. Let me re-read it. Looking at the code, testBtn does:

```ts
const current = await getSettings();
settings.sourceLang = current.sourceLang;
settings.targetLang = current.targetLang;
await saveSettings(settings);
```

It doesn't currently preserve `sourceLangLocked`. We need to add both. Let me update:

```ts
testBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required to test connection.', 'error');
    return;
  }
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  settings.sourceLangLocked = current.sourceLangLocked;
  settings.targetLangLocked = current.targetLangLocked;
  await saveSettings(settings);
  // ... test connection ...
});
```

- [ ] **Step 3: Add target language auto-detect in `loadLanguageSettings()`**

After the source language auto-detect block in `loadLanguageSettings()`, add the target language auto-detect block:

```ts
// Auto-detect target language from browser UI language if user hasn't locked it
if (!settings.targetLangLocked) {
  const detected = detectPageLang(navigator.language);
  if (detected && detected !== settings.targetLang) {
    settings.targetLang = detected;
    targetLangEl.value = detected;
  }
}
```

This goes right after the source auto-detect `try/catch` block and before the `generateSystemPrompt` call.

- [ ] **Step 4: Update `saveLanguageSettings()` to accept `lockTarget` parameter**

Change the function signature and body:

```ts
async function saveLanguageSettings(lockSource = false, lockTarget = false): Promise<void> {
  const settings = await getSettings();
  settings.sourceLang = sourceLangEl.value;
  settings.targetLang = targetLangEl.value;
  if (lockSource) settings.sourceLangLocked = true;
  if (lockTarget) settings.targetLangLocked = true;
  settings.systemPrompt = generateSystemPrompt(settings.sourceLang, settings.targetLang);
  await saveSettings(settings);
}
```

- [ ] **Step 5: Update `targetLangEl` change handler to lock target**

```ts
targetLangEl.addEventListener('change', () => {
  saveLanguageSettings(false, true);
});
```

- [ ] **Step 6: Update swap handler to lock both**

```ts
swapBtn.addEventListener('click', async () => {
  const srcVal = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = srcVal;
  await saveLanguageSettings(true, true);
});
```

- [ ] **Step 7: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Run all tests**

Run: `npm test`
Expected: All 28 tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/popup/popup.ts src/settings/settings.ts
git commit -m "feat: auto-detect target language from browser UI language"
```
