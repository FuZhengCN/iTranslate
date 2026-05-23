import type { TranslationSegment } from '../shared/types';
import { extractSegments } from './filters';
import { removeTranslations, renderPlaceholders, renderTranslations } from './renderer';
import { startObserving, stopObserving } from './observer';
import { enableSelection, disableSelection, isSelectionEnabled } from './selection';

let translateInProgress = false;
let catchUpInProgress = false;

import { sendToBgWithRetry } from './retry';

async function catchUpNewContent(): Promise<void> {
  if (catchUpInProgress) return;
  catchUpInProgress = true;

  try {
    const extraction = extractSegments();
    // Filter to blocks that don't already have a translation sibling
    const newSourceElements: Element[] = [];
    const newSegments: TranslationSegment[] = [];

    for (let i = 0; i < extraction.sourceElements.length; i++) {
      const el = extraction.sourceElements[i];
      const sibling = el.nextElementSibling;
      if (sibling?.classList.contains('itranslate-translation')) continue;
      newSourceElements.push(el);
      newSegments.push({ ...extraction.allSegments[i], id: `seg_${newSegments.length}` });
    }

    if (newSegments.length === 0) {
      console.log('[iTranslate] Catch-up: no new blocks found, skipping');
      return;
    }

    console.log(`[iTranslate] Catch-up: ${newSegments.length} new blocks found after translation`);
    renderPlaceholders(newSourceElements);

    try {
      const response = await sendToBgWithRetry({
        action: 'translate',
        segments: newSegments,
      });

      if (response.success) {
        renderTranslations(response.results, newSourceElements);
      }
    } catch {
      // Silently ignore catch-up failures — best-effort
    }
  } finally {
    catchUpInProgress = false;
  }
}

async function translatePage(caller = 'popup'): Promise<void> {
  console.log(`[iTranslate] ▶  translatePage called by: ${caller}`);
  if (translateInProgress) {
    console.log('[iTranslate] ⏸  translatePage skipped — already in progress');
    return;
  }
  translateInProgress = true;
  const t0 = performance.now();

  try {
    // Disconnect observer before any DOM mutations to prevent re-trigger loops
    stopObserving();

    // Clean up any existing translations before re-running
    removeTranslations();

    const extraction = extractSegments();

    if (extraction.allSegments.length === 0) {
      console.log('[iTranslate] No translatable content found');
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:10px 24px;border-radius:8px;font-size:14px;z-index:99999;pointer-events:none;';
      toast.textContent = 'No translatable content found on this page.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
      console.log(`[iTranslate] ⏱  Total flow: ${(performance.now() - t0).toFixed(0)}ms (no content)`);
      return;
    }

    const totalChars = extraction.allSegments.reduce((sum, s) => sum + s.text.length, 0);
    console.log(`[iTranslate] 🚀 Sending ${extraction.allSegments.length} segments (${totalChars} total chars) to background for translation`);

    renderPlaceholders(extraction.sourceElements);

    const tSend = performance.now();
    const TRANSLATE_TIMEOUT = 120_000; // 2 minutes — batches + retries can be slow
    const response = await Promise.race([
      sendToBgWithRetry({
        action: 'translate',
        segments: extraction.allSegments,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Translation timed out')), TRANSLATE_TIMEOUT)
      ),
    ]);

    console.log(`[iTranslate] ⏱  Background translation took ${(performance.now() - tSend).toFixed(0)}ms`);

    if (!response.success) {
      console.error(`[iTranslate] ❌ Translation failed: ${response.error}`);
      alert(`Translation failed: ${response.error}`);
      removeTranslations();
      chrome.runtime.sendMessage({ action: 'translationError' }).catch(() => {});
      return;
    }

    console.log(`[iTranslate] 📊 Cache stats: ${response.stats.hits} hits, ${response.stats.misses} misses`);

    renderTranslations(response.results, extraction.sourceElements);

    chrome.runtime.sendMessage({
      action: 'translationComplete',
      stats: response.stats,
      totalSegments: extraction.allSegments.length,
    }).catch(() => {});

    console.log(`[iTranslate] ⏱  Total flow (extract → render): ${(performance.now() - t0).toFixed(0)}ms`);

    // Catch-up scan: content loaded during the API call window (when the
    // observer was disconnected) would otherwise be permanently missed.
    // Re-extract and translate only blocks that don't already have a
    // translation clone as their next sibling.
    await catchUpNewContent();

    // Start observer only AFTER catch-up completes, so the observer's
    // own DOM mutations from injecting placeholders/translations don't
    // trigger a re-translation loop.
    const root = extraction.sourceElements[0]?.closest('article, main, [role="main"]') ?? document.body;
    startObserving(root, () => {
      catchUpNewContent();
    });

  } catch (err) {
    console.error('[iTranslate] Error:', err);
    alert(`Translation error: ${(err as Error).message}`);
    removeTranslations();
    chrome.runtime.sendMessage({ action: 'translationError' }).catch(() => {});
  } finally {
    translateInProgress = false;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'translatePage') {
    translatePage();
    sendResponse({ received: true });
  }
  if (message.action === 'getState') {
    const hasTranslations = document.querySelector('.itranslate-translation') !== null;
    sendResponse({ isTranslated: hasTranslations, selectionEnabled: isSelectionEnabled() });
    return true;
  }
  if (message.action === 'undoTranslation') {
    removeTranslations();
    stopObserving();
    sendResponse({ received: true });
    return true;
  }
  if (message.action === 'toggleSelection') {
    if (message.enabled) {
      enableSelection();
    } else {
      disableSelection();
    }
    sendResponse({ received: true });
    return true;
  }
});

