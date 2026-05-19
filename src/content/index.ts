import { extractSegments } from './extractor';
import type { ExtractionResult } from './extractor';
import { renderTranslations } from './renderer';
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
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      segments: extraction.allSegments,
    });

    if (!response.success) {
      alert(`Translation failed: ${response.error}`);
      return;
    }

    renderTranslations(response.results, extraction.sourceGroups);

    const root = extraction.sourceGroups[0]?.node.parentElement?.closest('article, main, [role="main"]') ?? document.body;
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
