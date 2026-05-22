# Auto-Detect Source Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-detect page language from `<html lang>` on popup open and set as source language — only if user has never manually chosen.

**Architecture:** New shared module `lang-detect.ts` for BCP 47 prefix mapping. One new settings field `sourceLangLocked` gates the behavior. Popup's `loadLanguageSettings()` does the detection; `sourceLangEl` change listener sets the lock.

**Tech Stack:** TypeScript, Vitest, Chrome Extension Manifest V3

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/shared/lang-detect.ts` | Create | `detectPageLang(tag)` — prefix-based BCP 47 → language mapping |
| `src/shared/__tests__/lang-detect.test.ts` | Create | Pure function tests: known tags, unknown tags, empty/null |
| `src/shared/types.ts` | Modify | Add `sourceLangLocked: boolean` to `Settings` |
| `src/shared/constants.ts` | Modify | Add `sourceLangLocked: false` to `DEFAULT_SETTINGS` |
| `src/shared/__tests__/storage.test.ts` | Modify | Test `sourceLangLocked` default + merge |
| `src/popup/popup.ts` | Modify | Auto-detect in `loadLanguageSettings()`, lock in source change listener |

---

### Task 1: Create lang-detect.ts with TDD

**Files:**
- Create: `src/shared/lang-detect.ts`
- Create: `src/shared/__tests__/lang-detect.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/shared/__tests__/lang-detect.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

// Dynamic import to match existing test patterns
describe('detectPageLang', () => {
  it('maps zh prefix to Chinese', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('zh')).toBe('Chinese');
    expect(detectPageLang('zh-CN')).toBe('Chinese');
    expect(detectPageLang('zh-TW')).toBe('Chinese');
    expect(detectPageLang('zh-HK')).toBe('Chinese');
  });

  it('maps en prefix to English', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('en')).toBe('English');
    expect(detectPageLang('en-US')).toBe('English');
    expect(detectPageLang('en-GB')).toBe('English');
  });

  it('maps ja prefix to Japanese', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('ja')).toBe('Japanese');
    expect(detectPageLang('ja-JP')).toBe('Japanese');
  });

  it('maps ko prefix to Korean', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('ko')).toBe('Korean');
    expect(detectPageLang('ko-KR')).toBe('Korean');
  });

  it('maps fr prefix to French', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('fr')).toBe('French');
    expect(detectPageLang('fr-FR')).toBe('French');
  });

  it('maps de prefix to German', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('de')).toBe('German');
    expect(detectPageLang('de-DE')).toBe('German');
  });

  it('returns null for unknown languages', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('es')).toBeNull();
    expect(detectPageLang('ru')).toBeNull();
    expect(detectPageLang('ar')).toBeNull();
  });

  it('returns null for empty or null input', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('')).toBeNull();
    expect(detectPageLang(null as unknown as string)).toBeNull();
  });

  it('is case-insensitive and handles uppercase tags', async () => {
    const { detectPageLang } = await import('../lang-detect');
    expect(detectPageLang('EN')).toBe('English');
    expect(detectPageLang('ZH-CN')).toBe('Chinese');
    expect(detectPageLang('Ja')).toBe('Japanese');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/shared/__tests__/lang-detect.test.ts --reporter=verbose
```

Expected: All 9 tests FAIL — module doesn't exist.

- [ ] **Step 3: Implement detectPageLang**

Create `src/shared/lang-detect.ts`:

```typescript
const LANG_TAG_MAP: Record<string, string> = {
  zh: 'Chinese',
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  fr: 'French',
  de: 'German',
};

export function detectPageLang(tag: string | null): string | null {
  if (!tag) return null;
  const prefix = tag.split('-')[0].toLowerCase();
  return LANG_TAG_MAP[prefix] ?? null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/shared/__tests__/lang-detect.test.ts --reporter=verbose
```

Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lang-detect.ts src/shared/__tests__/lang-detect.test.ts
git commit -m "feat: add detectPageLang — BCP 47 prefix to language mapper"
```

---

### Task 2: Add sourceLangLocked to types and defaults

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `src/shared/constants.ts`

- [ ] **Step 1: Add field to Settings type**

Edit `src/shared/types.ts`:

```diff
  export interface Settings {
    apiEndpoint: string;
    apiKey: string;
    model: string;
    systemPrompt: string;
    sourceLang: string;
    targetLang: string;
+   sourceLangLocked: boolean;
  }
```

- [ ] **Step 2: Add field to DEFAULT_SETTINGS**

Edit `src/shared/constants.ts`:

```diff
  export const DEFAULT_SETTINGS: Settings = {
    ...
    sourceLang: 'English',
    targetLang: 'Chinese',
+   sourceLangLocked: false,
  };
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/shared/types.ts src/shared/constants.ts
git commit -m "feat: add sourceLangLocked field to Settings"
```

---

### Task 3: Update storage test for sourceLangLocked

**Files:**
- Modify: `src/shared/__tests__/storage.test.ts`

- [ ] **Step 1: Add test assertions**

Edit `src/shared/__tests__/storage.test.ts`, adding to each test case:

In the "returns defaults when no settings saved" test — add after existing expects:

```typescript
expect(settings.sourceLangLocked).toBe(false);
```

In the "merges saved settings over defaults" test — save with `sourceLangLocked: true` and assert:

```typescript
await saveSettings({
  apiEndpoint: 'https://api.openai.com/v1',
  apiKey: 'sk-test',
  model: 'gpt-4o',
  systemPrompt: 'Custom prompt',
  sourceLang: 'Japanese',
  targetLang: 'Korean',
  sourceLangLocked: true,
});
// ...after getSettings():
expect(settings.sourceLangLocked).toBe(true);
```

In the "fills missing fields with defaults" test — add:

```typescript
expect(settings.sourceLangLocked).toBe(false);
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/shared/__tests__/storage.test.ts --reporter=verbose
```

Expected: All 3 tests PASS with new assertions.

- [ ] **Step 3: Commit**

```bash
git add src/shared/__tests__/storage.test.ts
git commit -m "test: cover sourceLangLocked in storage tests"
```

---

### Task 4: Wire auto-detect into popup

**Files:**
- Modify: `src/popup/popup.ts`

- [ ] **Step 1: Add auto-detect to loadLanguageSettings**

Edit `src/popup/popup.ts`. Add import at top:

```diff
  import { getSettings, saveSettings } from '../shared/storage';
  import { LANGUAGE_OPTIONS } from '../shared/constants';
+ import { detectPageLang } from '../shared/lang-detect';
```

Replace `loadLanguageSettings()`:

```typescript
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
        const pageLang = results[0]?.result;
        const detected = detectPageLang(pageLang);
        if (detected && detected !== settings.sourceLang) {
          settings.sourceLang = detected;
          sourceLangEl.value = detected;
        }
      }
    } catch {
      // chrome:// page or restricted — silently skip
    }
  }

  settings.systemPrompt = generateSystemPrompt(settings.sourceLang, settings.targetLang);
  await saveSettings(settings);
}
```

- [ ] **Step 2: Add lock to sourceLangEl change listener**

Edit the existing `sourceLangEl` change listener:

```typescript
sourceLangEl.addEventListener('change', async () => {
  const settings = await getSettings();
  if (!settings.sourceLangLocked) {
    settings.sourceLangLocked = true;
    await saveSettings(settings);
  }
  saveLanguageSettings();
});
```

Note: `saveLanguageSettings()` does its own `getSettings()` → mutate → `saveSettings()` so the lock will be saved across both writes. The explicit lock-before call ensures the flag is set before the second write.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: All 37 tests pass (28 existing + 9 new).

- [ ] **Step 5: Build**

```bash
npm run build
```

Expected: Clean build.

- [ ] **Step 6: Commit**

```bash
git add src/popup/popup.ts
git commit -m "feat: auto-detect source language from page lang attribute"
```
