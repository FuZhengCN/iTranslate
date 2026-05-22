import { describe, it, expect, beforeEach } from 'vitest';

const mockStorage: Record<string, unknown> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

vi.stubGlobal('chrome', {
  storage: {
    sync: {
      get: (key: string) => Promise.resolve({ [key]: mockStorage[key] ?? null }),
      set: (items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
        return Promise.resolve();
      },
    },
  },
});

describe('storage', () => {
  it('returns defaults when no settings saved', async () => {
    const { getSettings } = await import('../storage');
    const settings = await getSettings();
    expect(settings.sourceLang).toBe('English');
    expect(settings.targetLang).toBe('Chinese');
  });

  it('merges saved settings over defaults', async () => {
    const { getSettings, saveSettings } = await import('../storage');
    await saveSettings({
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-4o',
      systemPrompt: 'Custom prompt',
      sourceLang: 'Japanese',
      targetLang: 'Korean',
      sourceLangLocked: false,
    });
    const settings = await getSettings();
    expect(settings.sourceLang).toBe('Japanese');
    expect(settings.targetLang).toBe('Korean');
    expect(settings.apiEndpoint).toBe('https://api.openai.com/v1');
  });

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
  });
});
