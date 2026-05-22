# Target Language Auto-Detect Design

**Date:** 2026-05-22
**Status:** approved

## Background

Following the source language auto-detect feature, the target language should also default intelligently. Currently it always falls back to `'Chinese'` from DEFAULT_SETTINGS. When the user has never manually selected a target language, the extension should detect the browser UI language via `navigator.language` and use it as the default target, with Chinese as fallback.

## Design

Mirror the `sourceLangLocked` pattern with a new `targetLangLocked` field.

### Changes

| File | Change |
|------|--------|
| `src/shared/types.ts` | Add `targetLangLocked: boolean` to Settings interface |
| `src/shared/constants.ts` | Add `targetLangLocked: false` to DEFAULT_SETTINGS |
| `src/settings/settings.ts` | `getFormSettings()` includes `targetLangLocked: false`; save preserves existing value |
| `src/popup/popup.ts` | Auto-detect target from `navigator.language`; lock on manual change; swap locks both |

### Popup Logic

**loadLanguageSettings():**
```ts
// When target not locked, detect from browser UI language
if (!settings.targetLangLocked) {
  const detected = detectPageLang(navigator.language);
  if (detected && detected !== settings.targetLang) {
    settings.targetLang = detected;
    targetLangEl.value = detected;
  }
  // No detection → keep default (Chinese)
}
```

**targetLangEl change handler:**
```ts
targetLangEl.addEventListener('change', () => {
  saveLanguageSettings(false, true); // lockTarget = true
});
```

**saveLanguageSettings signature change:**
```ts
async function saveLanguageSettings(lockSource = false, lockTarget = false): Promise<void> {
  // ...
  if (lockSource) settings.sourceLangLocked = true;
  if (lockTarget) settings.targetLangLocked = true;
  // ...
}
```

**swap handler:**
```ts
swapBtn.addEventListener('click', async () => {
  // ... swap values ...
  await saveLanguageSettings(true, true); // lock both
});
```

### Backward Compatibility

Existing users without `targetLangLocked` in storage will get `false` from DEFAULT_SETTINGS merge. On first popup open, auto-detect will run and set their target language to their browser language (or keep Chinese if not detected). This is the desired behavior — if they never manually chose, the extension learns from their browser.

### Reuses

- `detectPageLang()` from `src/shared/lang-detect.ts` — already maps BCP 47 prefixes (`zh`, `en`, `ja`, `ko`, `fr`, `de`) to language names
- Same detection mechanism as source language, just from a different input (`navigator.language` instead of `<html lang>`)

### Not Covered

- Character-based fallback (`detectLangFromText`) — only applicable to page content (source), not browser UI (target)
