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

// Detect language from body text when <html lang> is missing.
// Scans Unicode script ranges for CJK, Hiragana, Katakana, Hangul.
export function detectLangFromText(text: string): string | null {
  let cjk = 0, hiragana = 0, katakana = 0, hangul = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (code >= 0x4E00 && code <= 0x9FFF) cjk++;
    else if (code >= 0x3400 && code <= 0x4DBF) cjk++;         // CJK Ext-A
    else if (code >= 0x3040 && code <= 0x309F) hiragana++;
    else if (code >= 0x30A0 && code <= 0x30FF) katakana++;
    else if (code >= 0xAC00 && code <= 0xD7AF) hangul++;
  }
  if (hangul > 3) return 'Korean';
  if (hiragana + katakana > 3) return 'Japanese';
  if (cjk > 3) return 'Chinese';
  return null;
}
