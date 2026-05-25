import type { Settings } from '../shared/types';
import { getSettings } from '../shared/storage';
import { DICT_SYSTEM_PROMPT, dictUserPrompt, parseDictionaryResponse } from './dict-prompt';

// Batch sizing uses estimated tokens rather than raw chars, so CJK text
// (~1.5 tok/char) and Latin text (~0.35 tok/char) both produce balanced batches.
const CJK_TOKEN_RATIO = 1.5;
const LATIN_TOKEN_RATIO = 0.35;
const TARGET_BATCH_TOKENS = 1500;
const MAX_CONCURRENT_BATCHES = 3;

function isCJK(code: number): boolean {
  return (code >= 0x4E00 && code <= 0x9FFF)  // CJK Unified Ideographs
      || (code >= 0x3400 && code <= 0x4DBF)  // CJK Extended-A
      || (code >= 0xF900 && code <= 0xFAFF)  // CJK Compatibility Ideographs
      || (code >= 0x3000 && code <= 0x303F)  // CJK Symbols & Punctuation
      || (code >= 0x3040 && code <= 0x309F)  // Hiragana
      || (code >= 0x30A0 && code <= 0x30FF); // Katakana
}

/** Quick segment-level token count — samples the first portion to pick a ratio. */
function segmentTokenEstimate(text: string): number {
  const sample = text.length <= 40 ? text : text.slice(0, 40);
  let cjkChars = 0;
  for (const ch of sample) {
    if (isCJK(ch.codePointAt(0) ?? 0)) cjkChars++;
  }
  const ratio = (cjkChars / sample.length) > 0.3 ? CJK_TOKEN_RATIO : LATIN_TOKEN_RATIO;
  return Math.ceil(text.length * ratio);
}

function estimateTokens(promptChars: number, _textCount: number): number {
  const outputEstimate = Math.ceil(promptChars * 0.6 * 1.5);
  return Math.max(512, Math.min(8192, outputEstimate + 256));
}

function shouldRetry(status: number): boolean {
  return status === 429 || status >= 500;
}

function buildPrompt(texts: string[]): string {
  const segments = texts.map((t, i) => `[${i}] ${t}`).join('\n\n');
  return `Translate the following texts. Each text is wrapped with a numbered tag. Output the translations using the same numbered tags, one per line, with no additional commentary:\n\n${segments}`;
}

function parseResponse(response: string, count: number): string[] {
  const translations: (string | null)[] = new Array(count).fill(null);

  // Try multiple numbering formats that models commonly produce
  const patterns = [
    /^\[(\d+)\]\s*(.+)/,       // [0] text
    /^(\d+)[\.\)、]\s*(.+)/,   // 0. text, 0) text, 0、text
  ];

  const lines = response.split('\n');
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (idx >= 0 && idx < count && translations[idx] === null) {
          translations[idx] = match[2].trim();
        }
        break;
      }
    }
  }

  return translations.map((t, i) => t ?? `[Translation unavailable for segment ${i}]`);
}

async function translateOneBatch(
  texts: string[],
  settings: Settings,
  batchIndex: number,
  totalBatches: number,
): Promise<string[]> {
  if (!settings.apiKey) {
    throw new Error('API key not configured');
  }

  const prompt = buildPrompt(texts);
  const endpoint = settings.apiEndpoint.replace(/\/+$/, '');
  const maxTokens = estimateTokens(prompt.length, texts.length);
  console.log(`[iTranslate] 📡 API batch ${batchIndex + 1}/${totalBatches}: ${texts.length} texts, prompt ${prompt.length} chars, max_tokens ${maxTokens}`);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const tReq = performance.now();
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
          temperature: 0.1,
          max_tokens: maxTokens,
          thinking: { type: 'disabled' },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        const err = new Error(`API error ${response.status}: ${body}`);

        if (shouldRetry(response.status)) {
          lastError = err;
          const delay = Math.pow(2, attempt) * 1000;
          const reason = response.status === 429 ? 'Rate limited' : 'Server error';
          console.log(`[iTranslate] ⚠️  ${reason} (${response.status}), retrying in ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw err;
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const content: string = choice?.message?.content ?? '';

      // DeepSeek reasoning models sometimes spend all tokens on thinking and
      // leave content empty. Retry — the next attempt usually succeeds.
      if (!content && data.usage?.completion_tokens > 0) {
        console.log(`[iTranslate] ⚠️  Empty content (${data.usage.completion_tokens} tokens spent on reasoning), retrying...`);
        lastError = new Error('Empty response content (reasoning mode)');
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      const usageInfo = data.usage;
      const elapsed = (performance.now() - tReq).toFixed(0);
      console.log(`[iTranslate] ✅ API response batch ${batchIndex + 1}: ${elapsed}ms${usageInfo ? `, ${usageInfo.prompt_tokens}+${usageInfo.completion_tokens} tokens` : ''}`);

      const parsed = parseResponse(content, texts.length);

      // Diagnostic: show raw response preview and parse success rate
      const parsedCount = parsed.filter((t) => !t.startsWith('[Translation unavailable')).length;
      console.log(`[iTranslate] 📝 Parsed ${parsedCount}/${texts.length} segments (first 300 chars of response): "${content.slice(0, 300)}"`);
      if (parsedCount < texts.length) {
        const missing = parsed.map((t, i) => t.startsWith('[Translation unavailable') ? i : -1).filter((i) => i >= 0);
        console.log(`[iTranslate] ⚠️  Missing segments: [${missing.join(', ')}] — last 200 chars of response: "…${content.slice(-200)}"`);
      }

      if (parsed.length > 0) {
        console.log(`[iTranslate] 📝 Sample [0]: "${texts[0].slice(0, 50)}…" → "${parsed[0].slice(0, 60)}…"`);
        if (parsed.length > 1) {
          const last = parsed.length - 1;
          console.log(`[iTranslate] 📝 Sample [${last}]: "${texts[last].slice(0, 50)}…" → "${parsed[last].slice(0, 60)}…"`);
        }
      }
      return parsed;
    } catch (err) {
      lastError = err as Error;
      console.error(`[iTranslate] ❌ API attempt ${attempt + 1}/3 failed: ${(err as Error).message}`);
      if (attempt < 2 && shouldRetry((err as any)?.status ?? 0)) {
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
  console.log(`[iTranslate] ⚙️  API config: endpoint=${settings.apiEndpoint}, model=${settings.model}, sourceLang=${settings.sourceLang}→targetLang=${settings.targetLang}`);

  // Build batches by estimated token count so CJK and Latin pages both
  // produce balanced batches despite their different token-per-char ratios.
  const batches: { texts: string[]; origIndices: number[]; index: number }[] = [];
  let currentTexts: string[] = [];
  let currentIndices: number[] = [];
  let currentTokens = 0;

  for (let i = 0; i < texts.length; i++) {
    currentTexts.push(texts[i]);
    currentIndices.push(i);
    currentTokens += segmentTokenEstimate(texts[i]);

    if (currentTokens >= TARGET_BATCH_TOKENS) {
      batches.push({ texts: currentTexts, origIndices: currentIndices, index: batches.length });
      currentTexts = [];
      currentIndices = [];
      currentTokens = 0;
    }
  }
  if (currentTexts.length > 0) {
    batches.push({ texts: currentTexts, origIndices: currentIndices, index: batches.length });
  }

  const totalBatches = batches.length;
  const batchTokens = batches.map(b =>
    b.texts.reduce((sum, t) => sum + segmentTokenEstimate(t), 0)
  );
  console.log(`[iTranslate] 🔀 ${texts.length} segments → ${totalBatches} batches (${batches.map(b => b.texts.length).join('/')} segments, ~${batchTokens.join('/')} tokens)`);

  const results: string[] = new Array(texts.length);
  let completedCount = 0;

  // Process batches in parallel with concurrency limit
  const queue = [...batches];
  async function runNext(): Promise<void> {
    const batch = queue.shift();
    if (!batch) return;

    const translations = await translateOneBatch(batch.texts, settings, batch.index, totalBatches);
    for (let j = 0; j < translations.length; j++) {
      results[batch.origIndices[j]] = translations[j];
    }
    completedCount += batch.texts.length;
    onProgress?.(completedCount);

    // Chain to next batch in queue
    await runNext();
  }

  // Launch initial concurrent workers
  const workers = Math.min(MAX_CONCURRENT_BATCHES, totalBatches);
  const workerPromises: Promise<void>[] = [];
  for (let w = 0; w < workers; w++) {
    workerPromises.push(runNext());
  }
  await Promise.all(workerPromises);
  console.log(`[iTranslate] ✅ All ${totalBatches} batches completed`);

  return results;
}

export async function translateDictionary(word: string): Promise<{ success: boolean; data: string | null }> {
  const settings = await getSettings();
  if (!settings.apiKey) throw new Error('API key not configured');

  const endpoint = settings.apiEndpoint.replace(/\/+$/, '');
  const prompt = dictUserPrompt(word);
  console.log(`[iTranslate] 📖 Dictionary lookup: "${word}"`);

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
            { role: 'system', content: DICT_SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          thinking: { type: 'disabled' },
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const content: string = data.choices?.[0]?.message?.content ?? '';

      if (!content && data.usage?.completion_tokens > 0) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      const parsed = parseDictionaryResponse(content);
      if (parsed) {
        return { success: true, data: JSON.stringify(parsed) };
      }
      return { success: false, data: null };
    } catch (err) {
      if (attempt < 2) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return { success: false, data: null };
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
