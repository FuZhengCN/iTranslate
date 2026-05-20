import { extractSegments } from './extractor';
import type { ExtractionResult } from './extractor';
import { renderPlaceholders, renderTranslations } from './renderer';
import { startObserving, stopObserving } from './observer';

let translateInProgress = false;
let lastExtraction: ExtractionResult | null = null;

async function translatePage(): Promise<void> {
  if (translateInProgress) return;
  translateInProgress = true;

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

    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      segments: extraction.allSegments,
    });

    if (!response.success) {
      alert(`Translation failed: ${response.error}`);
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
  } finally {
    translateInProgress = false;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'translatePage') {
    translatePage();
    sendResponse({ received: true });
  }
});
