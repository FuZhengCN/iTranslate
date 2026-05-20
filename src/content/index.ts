import type { TranslationSegment } from '../shared/types';
import { extractSegments } from './extractor';
import type { ExtractionResult } from './extractor';
import { removeTranslations, renderPlaceholders, renderTranslations } from './renderer';
import { startObserving, stopObserving } from './observer';
import { hideTranslatingToast, showTranslatingToast, updateProgress } from './toast';

let translateInProgress = false;
let lastExtraction: ExtractionResult | null = null;

async function catchUpNewContent(): Promise<void> {
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

  if (newSegments.length === 0) return;

  console.log(`[iTranslate] Catch-up: ${newSegments.length} new blocks found after translation`);
  renderPlaceholders(newSourceElements);

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      segments: newSegments,
    });

    if (response.success) {
      renderTranslations(response.results, newSourceElements);
    }
  } catch {
    // Silently ignore catch-up failures — best-effort
  }
}

async function translatePage(): Promise<void> {
  if (translateInProgress) return;
  translateInProgress = true;

  try {
    // Disconnect observer before any DOM mutations to prevent re-trigger loops
    stopObserving();

    // Clean up any existing translations before re-running
    removeTranslations();

    const extraction = extractSegments();
    lastExtraction = extraction;

    if (extraction.allSegments.length === 0) {
      console.log('[iTranslate] No translatable content found');
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:10px 24px;border-radius:8px;font-size:14px;z-index:99999;pointer-events:none;';
      toast.textContent = 'No translatable content found on this page.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
      hideTranslatingToast();
      return;
    }

    // Show toast + placeholders immediately so user knows work is in progress
    showTranslatingToast();
    renderPlaceholders(extraction.sourceElements);

    const TRANSLATE_TIMEOUT = 120_000; // 2 minutes — batches + retries can be slow
    const response = await Promise.race([
      chrome.runtime.sendMessage({
        action: 'translate',
        segments: extraction.allSegments,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Translation timed out')), TRANSLATE_TIMEOUT)
      ),
    ]);

    if (!response.success) {
      alert(`Translation failed: ${response.error}`);
      hideTranslatingToast();
      removeTranslations();
      chrome.runtime.sendMessage({ action: 'translationError' }).catch(() => {});
      return;
    }

    renderTranslations(response.results, extraction.sourceElements);
    hideTranslatingToast();

    const root = extraction.sourceElements[0]?.closest('article, main, [role="main"]') ?? document.body;
    startObserving(root, () => {
      translatePage();
    });

    chrome.runtime.sendMessage({
      action: 'translationComplete',
      stats: response.stats,
      totalSegments: extraction.allSegments.length,
    }).catch(() => {});

    // Catch-up scan: content loaded during the API call window (when the
    // observer was disconnected) would otherwise be permanently missed.
    // Re-extract and translate only blocks that don't already have a
    // translation clone as their next sibling.
    await catchUpNewContent();

  } catch (err) {
    console.error('[iTranslate] Error:', err);
    alert(`Translation error: ${(err as Error).message}`);
    hideTranslatingToast();
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
    sendResponse({ isTranslated: hasTranslations });
    return true;
  }
  if (message.action === 'translationProgress') {
    updateProgress(message.completed, message.total);
    return;
  }
  if (message.action === 'undoTranslation') {
    removeTranslations();
    stopObserving();
    sendResponse({ received: true });
    return true;
  }
});
