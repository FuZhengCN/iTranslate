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
