# Auto-Detect Source Language from Page

## Summary

When the popup opens, automatically detect the current page's language from `document.documentElement.lang` and set it as the source language — but only if the user has never manually chosen a source language before.

## Motivation

Users browse pages in different languages. Manually switching source language for each page is tedious. The page's `<html lang>` attribute is a reliable signal that costs nothing to read.

## Design

### Detection Flow

```
popup opens → loadLanguageSettings()
  ├─ load saved language + lock state from storage
  ├─ if sourceLangLocked === false:
  │    ├─ chrome.scripting.executeScript → read document.documentElement.lang
  │    ├─ if tag matches a known language AND differs from current:
  │    │    └─ update sourceLang in popup selector + save to storage
  │    └─ if no match / same: do nothing
  └─ sync system prompt (existing logic)
```

### Lock Mechanism

- New setting: `sourceLangLocked: boolean`, default `false`
- Set to `true` when user manually changes `sourceLangEl` (change event)
- Once locked, auto-detect is permanently disabled for this user
- Changing target language or clicking swap does NOT lock source
- Future: Settings page could expose a reset button (out of scope for now)

### BCP 47 → Language Mapping

New file `src/shared/lang-detect.ts`:

```
Prefix  | Language
--------|---------
zh      | Chinese
en      | English
ja      | Japanese
ko      | Korean
fr      | French
de      | German
(other) | null (no match, keep current)
```

Matching is prefix-based: `documentElement.lang` is split on `-`, first segment lowercased, then matched.

### Reading the Page's lang

`chrome.scripting.executeScript` with `func` — a small inline function that returns `document.documentElement.lang`. No dependency on content script being alive.

Edge cases:
- chrome:// pages → executeScript throws → silently skip
- lang is null/empty → no match → skip
- lang maps to a language not in our list → no match → skip

## Changes

| File | Action | Details |
|------|--------|---------|
| `src/shared/types.ts` | Modify | Add `sourceLangLocked: boolean` to `Settings` |
| `src/shared/constants.ts` | Modify | Add `sourceLangLocked: false` to `DEFAULT_SETTINGS` |
| `src/shared/lang-detect.ts` | Create | Mapping table + `detectPageLang(tag)` function |
| `src/popup/popup.ts` | Modify | `loadLanguageSettings()`: auto-detect logic; `sourceLangEl` change listener: set lock |
| `src/shared/__tests__/lang-detect.test.ts` | Create | Tests for mapping, null/empty/unknown inputs |
| `src/shared/__tests__/storage.test.ts` | Modify | Verify `sourceLangLocked` default + merge |

## Non-changes

- `saveLanguageSettings()` — unchanged
- Settings page — unchanged (lock flag is invisible to user for now)
- Background, content script — unchanged
- Target language auto-detection — out of scope, always user-chosen

## Spec Self-Review

- No placeholders
- Consistent: lock prevents override, detection reads from standard DOM attribute, mapping is explicit
- Scope: single focused feature, no backend/token changes
- No ambiguity: prefix-based matching, lock semantics clear
