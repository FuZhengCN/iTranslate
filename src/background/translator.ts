import type { Settings } from '../shared/types';
import { getSettings } from '../shared/storage';

const MAX_BATCH_SIZE = 30;
const DELIMITER = '|||';

function buildPrompt(systemPrompt: string, texts: string[]): string {
  const segments = texts.map((t, i) => `[${i}] ${t}`).join('\n\n');
  return `Translate the following English texts to Chinese. Each text is wrapped with a numbered tag. Output the translations using the same numbered tags, one per line, with no additional commentary:\n\n${segments}`;
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

  // Fallback: if parsing failed, try splitting by delimiter
  if (translations.some((t) => t === null)) {
    const parts = response.split(DELIMITER);
    if (parts.length === count) {
      return parts.map((p) => p.trim());
    }
  }

  // Use original text for any segments we couldn't parse
  return translations.map((t, i) => t ?? `[Translation unavailable for segment ${i}]`);
}

async function translateOneBatch(texts: string[]): Promise<string[]> {
  const settings: Settings = await getSettings();

  if (!settings.apiKey) {
    throw new Error('API key not configured');
  }

  const prompt = buildPrompt(settings.systemPrompt, texts);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${settings.apiEndpoint}/chat/completions`, {
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

export async function translateBatch(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];

  // Split into chunks to avoid timeouts and token overflow
  const allResults: string[] = [];
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const chunk = texts.slice(i, i + MAX_BATCH_SIZE);
    const results = await translateOneBatch(chunk);
    allResults.push(...results);
  }

  return allResults;
}

export async function testConnection(settings: Settings): Promise<boolean> {
  try {
    const response = await fetch(`${settings.apiEndpoint}/chat/completions`, {
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
