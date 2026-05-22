import { describe, it, expect } from 'vitest';

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
