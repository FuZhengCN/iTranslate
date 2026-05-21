import type { Settings } from '../shared/types';
import { getSettings } from '../shared/storage';

const MAX_BATCH_SIZE = 30;

function buildPrompt(texts: string[]): string {
  const segments = texts.map((t, i) => `[${i}] ${t}`).join('\n\n');
  return `Translate the following texts. Each text is wrapped with a numbered tag. Output the translations using the same numbered tags, one per line, with no additional commentary:\n\n${segments}`;
}

function parseResponse(response: string, count: number): string[] {
  const translations: (string | null)[] = new Array(count).fill(null);

  const lines = response.split('\n');
  for (const line of lines) {
    const match = line.match(/^\[(\d+)\]\s*(.+)/);
    if (match) {
      const idx = parseInt(match[1], 10);
      if (idx >= 0 && idx < count) {
        translations[idx] = match[2].trim();
      }
    }
  }

  return translations.map((t, i) => t ?? `[Translation unavailable for segment ${i}]`);
}

async function translateOneBatch(texts: string[], settings: Settings): Promise<string[]> {
  if (!settings.apiKey) {
    throw new Error('API key not configured');
  }

  const prompt = buildPrompt(texts);
  const endpoint = settings.apiEndpoint.replace(/\/+$/, '');

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: settings.systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        }),
      });

      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`API error ${response.status}: ${body}`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? '';
      return parseResponse(content, texts.length);
    } catch (err) {
      lastError = err as Error;
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error('Translation failed');
}

export async function translateBatch(
  texts: string[],
  onProgress?: (completed: number) => void
): Promise<string[]> {
  if (texts.length === 0) return [];

  const settings: Settings = await getSettings();

  const allResults: string[] = [];
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const chunk = texts.slice(i, i + MAX_BATCH_SIZE);
    const results = await translateOneBatch(chunk, settings);
    allResults.push(...results);
    onProgress?.(allResults.length);
  }

  return allResults;
}

export async function testConnection(settings: Settings): Promise<boolean> {
  try {
    const endpoint = settings.apiEndpoint.replace(/\/+$/, '');
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'user', content: 'Say "ok" and nothing else.' },
        ],
        max_tokens: 10,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
