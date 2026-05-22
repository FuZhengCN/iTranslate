# Popup UX Optimization — v1.0.2

## Summary

Move source/target language selection from the deep Settings page to the popup main view for quick access. Remove user-irrelevant stats. Consolidate Settings into a gear icon. Add version number. Switch secondary buttons to icon+text style.

## Motivation

- **Language switching is frequent**, but currently requires 5+ steps: click Settings → opens new tab → change language → Save → switch back
- **API config is infrequent** but occupies space in both popup (Settings button) and settings page (language selects)
- **Stats area** shows segment count / cache hits / API calls — meaningless to end users
- No version number visible anywhere

## Changes

### Popup (`src/popup/popup.html`, `popup.ts`, `popup.css`)

**Remove:**
- Language badge (`langBadge`) from header
- Stats section (`#stats`) entirely
- "Settings" text button from bottom actions

**Add:**
- Gear icon button in header (right side) → `chrome.runtime.openOptionsPage()`
- Language selection row: source `<select>` + ⇄ swap button + target `<select>`
- Version footer: centered `iTranslate v1.0.1` in subtle color

**Modify:**
- Clear Cache button: text-only → icon (trash SVG) + "Clear Cache" text
- Language selects read/write via `getSettings()` / `saveSettings()` from shared storage
- Swap button exchanges values of both selects and auto-saves
- On popup open, load current language settings and set selects accordingly

### Settings Page (`src/settings/settings.html`, `settings.ts`)

**Remove:**
- Translation Direction section (source/target selects + swap button)
- `generateSystemPrompt()` auto-generation tied to language changes
- `promptEdited` tracking (no longer needed since language changes don't trigger prompt regeneration)
- `trySetPrompt()` function

**Keep (unchanged):**
- API Endpoint
- API Key
- Model
- System Prompt (manually editable, no auto-generation)
- Save button
- Test Connection button

### Layout Order (Popup, top to bottom)

1. Header: Logo + gear icon
2. Language row: [Source ▼] ⇄ [Target ▼]
3. Translate button (primary)
4. Clear Cache button (icon+text)
5. Footer: version number

## Non-changes

- `getSettings()` / `saveSettings()` API unchanged — popup language selects use the same storage key
- Settings page URL / `chrome.runtime.openOptionsPage()` unchanged
- Clear Cache behavior unchanged
- Translate button behavior unchanged
- Undo Translation flow unchanged

## Spec self-review

- Placeholders: none
- Consistency: popup and settings changes are orthogonal — no conflict
- Scope: single focused popup UX change, no backend/translator changes
- Ambiguity: language select labels come from `LANGUAGE_OPTIONS`, same data source as current settings page
