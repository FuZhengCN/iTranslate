import type { TranslationSegment, TranslationResult } from '../shared/types';
import { cacheGetBulk, cacheSetBulk } from './cache';
import { translateBatch } from './translator';

function sha256(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'seg_' + Math.abs(hash).toString(36) + '_' + text.length.toString(36);
}

function sendProgress(tabId: number, completed: number, total: number): void {
  chrome.tabs.sendMessage(tabId, {
    action: 'translationProgress',
    completed,
    total,
  }).catch(() => {});
}

export async function handleTranslate(
  segments: TranslationSegment[],
  tabId?: number
): Promise<{ results: TranslationResult[]; stats: { hits: number; misses: number } }> {
  const keys = segments.map((s) => sha256(s.text));
  const cacheMap = await cacheGetBulk(keys);

  const results: TranslationResult[] = [];
  const misses: { idx: number; text: string; key: string }[] = [];
  let hits = 0;

  for (let i = 0; i < segments.length; i++) {
    const key = keys[i];
    const cached = cacheMap.get(key);
    if (cached) {
      hits++;
      results.push({ id: segments[i].id, original: segments[i].text, translated: cached.translated });
    } else {
      misses.push({ idx: i, text: segments[i].text, key });
    }
  }

  // Report cache-hit progress
  if (tabId != null) sendProgress(tabId, hits, segments.length);

  if (misses.length > 0) {
    const texts = misses.map((m) => m.text);
    const translations = await translateBatch(texts, (batchCompleted) => {
      if (tabId != null) sendProgress(tabId, hits + batchCompleted, segments.length);
    });

    const newEntries = new Map();
    for (let i = 0; i < misses.length; i++) {
      const { idx, key } = misses[i];
      const translated = translations[i];
      results.push({ id: segments[idx].id, original: segments[idx].text, translated });
      newEntries.set(key, { translated, timestamp: Date.now() });
    }

    results.sort((a, b) => {
      const idxA = segments.findIndex((s) => s.id === a.id);
      const idxB = segments.findIndex((s) => s.id === b.id);
      return idxA - idxB;
    });

    cacheSetBulk(newEntries).catch(() => {});
  }

  return { results, stats: { hits, misses: misses.length } };
}
