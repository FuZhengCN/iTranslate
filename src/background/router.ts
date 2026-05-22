import type { TranslationSegment, TranslationResult } from '../shared/types';
import { cacheGetBulk, cacheSetBulk } from './cache';
import { translateBatch } from './translator';
import { getSettings } from '../shared/storage';

function segmentKey(text: string, targetLang: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'seg_' + Math.abs(hash).toString(36) + '_' + text.length.toString(36) + '_' + targetLang;
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
  const settings = await getSettings();
  console.log(`[iTranslate] 🔍 Router: handling ${segments.length} segments`);
  const keys = segments.map((s) => segmentKey(s.text, settings.targetLang));
  const cacheMap = await cacheGetBulk(keys);

  console.log(`[iTranslate] 💾 Cache lookup: ${cacheMap.size}/${keys.length} keys found in IndexedDB`);

  const results: TranslationResult[] = [];
  const misses: { idx: number; text: string; key: string }[] = [];
  let hits = 0;
  let collisions = 0;

  for (let i = 0; i < segments.length; i++) {
    const key = keys[i];
    const cached = cacheMap.get(key);
    // Verify original text to guard against hash collisions
    if (cached && cached.original === segments[i].text) {
      hits++;
      results.push({ id: segments[i].id, original: segments[i].text, translated: cached.translated });
    } else {
      if (cached) {
        collisions++;
        console.log(`[iTranslate] ⚠️  Hash collision! key=${key} cached="${cached.original.slice(0, 50)}" vs current="${segments[i].text.slice(0, 50)}"`);
      }
      misses.push({ idx: i, text: segments[i].text, key });
    }
  }

  console.log(`[iTranslate] 📊 Cache result: ${hits} hits, ${misses.length} misses, ${collisions} collisions`);

  // Report cache-hit progress
  if (tabId != null) sendProgress(tabId, hits, segments.length);

  if (misses.length > 0) {
    const texts = misses.map((m) => m.text);
    console.log(`[iTranslate] 🌐 Sending ${texts.length} texts to API`);
    const translations = await translateBatch(texts, (batchCompleted) => {
      if (tabId != null) sendProgress(tabId, hits + batchCompleted, segments.length);
    });

    const newEntries = new Map();
    for (let i = 0; i < misses.length; i++) {
      const { idx, key, text } = misses[i];
      const translated = translations[i];
      results.push({ id: segments[idx].id, original: segments[idx].text, translated });
      newEntries.set(key, { original: text, translated, timestamp: Date.now() });
    }

    // Build a position map to avoid O(n²) findIndex calls in sort
    const positionMap = new Map(segments.map((s, i) => [s.id, i]));
    results.sort((a, b) => (positionMap.get(a.id) ?? 0) - (positionMap.get(b.id) ?? 0));

    cacheSetBulk(newEntries).catch(() => {});
  }

  return { results, stats: { hits, misses: misses.length } };
}
