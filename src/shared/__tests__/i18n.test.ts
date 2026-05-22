import { describe, it, expect, beforeEach } from 'vitest';

// Mock chrome.i18n before importing the module
let mockUILanguage = 'en-US';
const mockMessages: Record<string, string> = {};

beforeEach(() => {
  mockUILanguage = 'en-US';
  Object.keys(mockMessages).forEach((k) => delete mockMessages[k]);
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
    mockMessages['hello'] = 'Hello';
    const { t } = await import('../i18n');
    expect(t('hello')).toBe('Hello');
  });

  it('returns key as fallback when message is missing', async () => {
    const { t } = await import('../i18n');
    expect(t('unknown_key')).toBe('unknown_key');
  });

  it('substitutes $1 placeholder', async () => {
    mockMessages['error'] = 'Error: $1';
    const { t } = await import('../i18n');
    expect(t('error', 'timeout')).toBe('Error: timeout');
  });

  it('substitutes multiple placeholders', async () => {
    mockMessages['range'] = '$1 to $2';
    const { t } = await import('../i18n');
    expect(t('range', ['1', '10'])).toBe('1 to 10');
  });
});
