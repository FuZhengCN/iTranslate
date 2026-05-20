import { extractSegments } from './extractor';
import type { ExtractionResult } from './extractor';
import { removeTranslations, renderPlaceholders, renderTranslations } from './renderer';
import { startObserving, stopObserving } from './observer';

let translateInProgress = false;
let lastExtraction: ExtractionResult | null = null;

async function translatePage(): Promise<void> {
  if (translateInProgress) return;
  translateInProgress = true;

  // Clean up any existing translations before re-running
  removeTranslations();

  try {
    stopObserving();

    const extraction = extractSegments();
    lastExtraction = extraction;

    if (extraction.allSegments.length === 0) {
      console.log('[iTranslate] No translatable content found');
      // Brief non-intrusive toast so user knows what happened
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:10px 24px;border-radius:8px;font-size:14px;z-index:99999;pointer-events:none;';
      toast.textContent = 'No translatable content found on this page.';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
      return;
    }

    // Show placeholders immediately so user knows work is in progress
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
      removeTranslations();
      chrome.runtime.sendMessage({ action: 'translationError' }).catch(() => {});
      return;
    }

    renderTranslations(response.results, extraction.sourceElements);

    const root = extraction.sourceElements[0]?.closest('article, main, [role="main"]') ?? document.body;
    startObserving(root, () => {
      translatePage();
    });

    chrome.runtime.sendMessage({
      action: 'translationComplete',
      stats: response.stats,
      totalSegments: extraction.allSegments.length,
    }).catch(() => {});

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
  if (message.action === 'undoTranslation') {
    removeTranslations();
    stopObserving();
    sendResponse({ received: true });
    return true;
  }
});
