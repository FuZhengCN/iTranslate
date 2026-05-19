import { describe, it, expect, vi } from 'vitest';

describe('translator', () => {
  it('batches translation requests correctly', async () => {
    const mockSettings = {
      apiEndpoint: 'https://api.deepseek.com/v1',
      apiKey: 'sk-test',
      model: 'deepseek-chat',
      systemPrompt: 'Translate English to Chinese.',
    };

    vi.stubGlobal('chrome', {
      storage: {
        sync: {
          get: vi.fn().mockResolvedValue({ itranslate_settings: mockSettings }),
        },
      },
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        choices: [{ message: { content: '[0] 你好\n[1] 世界' } }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    // Dynamic import after stubs are set
    const { translateBatch } = await import('../translator');
    const results = await translateBatch(['Hello', 'World']);

    expect(results).toEqual(['你好', '世界']);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('throws when API key is missing', async () => {
    vi.stubGlobal('chrome', {
      storage: {
        sync: {
          get: vi.fn().mockResolvedValue({
            itranslate_settings: {
              apiEndpoint: 'https://api.deepseek.com/v1',
              apiKey: '',
              model: 'deepseek-chat',
              systemPrompt: '',
            },
          }),
        },
      },
    });

    const { translateBatch } = await import('../translator');
    await expect(translateBatch(['Hello'])).rejects.toThrow('API key not configured');
  });
});
