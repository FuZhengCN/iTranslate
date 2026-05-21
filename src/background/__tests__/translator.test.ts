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

  it('splits by character count into balanced batches', async () => {
    const mockSettings = {
      apiEndpoint: 'https://api.deepseek.com/v1',
      apiKey: 'sk-test',
      model: 'deepseek-chat',
      systemPrompt: 'Translate.',
    };

    vi.stubGlobal('chrome', {
      storage: {
        sync: {
          get: vi.fn().mockResolvedValue({ itranslate_settings: mockSettings }),
        },
      },
    });

    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      const lines: string[] = [];
      for (let i = 0; i < 100; i++) {
        lines.push(`[${i}] translated`);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          choices: [{ message: { content: lines.join('\n') } }],
        }),
      });
    });
    vi.stubGlobal('fetch', mockFetch);

    const { translateBatch } = await import('../translator');

    // 50 × 100-char Latin segments ≈ 1750 estimated tokens, TARGET_BATCH_TOKENS=1500 → 2 batches
    const texts = Array.from({ length: 50 }, (_, i) => `Segment ${i}: `.padEnd(100, 'x'));
    const results = await translateBatch(texts);

    expect(results).toHaveLength(50);
    expect(mockFetch).toHaveBeenCalledTimes(2);
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
