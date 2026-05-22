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

describe('detectLangFromText', () => {
  it('detects Chinese from CJK-heavy text', async () => {
    const { detectLangFromText } = await import('../lang-detect');
    expect(detectLangFromText('机器学习正在改变世界的面貌')).toBe('Chinese');
  });

  it('detects Japanese from mixed CJK and kana', async () => {
    const { detectLangFromText } = await import('../lang-detect');
    expect(detectLangFromText('機械学習は世界を変えています')).toBe('Japanese');
  });

  it('detects Korean from Hangul text', async () => {
    const { detectLangFromText } = await import('../lang-detect');
    expect(detectLangFromText('기계 학습이 세상을 바꾸고 있습니다')).toBe('Korean');
  });

  it('returns null for English/Latin-only text', async () => {
    const { detectLangFromText } = await import('../lang-detect');
    expect(detectLangFromText('Machine learning is transforming the world')).toBeNull();
  });

  it('returns null for short text with too few CJK chars', async () => {
    const { detectLangFromText } = await import('../lang-detect');
    expect(detectLangFromText('你好')).toBeNull(); // only 2 CJK chars, threshold is 3+
  });

  it('returns null for empty string', async () => {
    const { detectLangFromText } = await import('../lang-detect');
    expect(detectLangFromText('')).toBeNull();
  });

  it('distinguishes Japanese (kana) from Chinese (no kana)', async () => {
    const { detectLangFromText } = await import('../lang-detect');
    // CJK chars alone → Chinese
    expect(detectLangFromText('今天天气很好我们出去玩吧')).toBe('Chinese');
    // CJK + hiragana → Japanese
    expect(detectLangFromText('今日は天気がいいですね')).toBe('Japanese');
  });
});
