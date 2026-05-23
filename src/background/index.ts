import type { TranslationSegment } from '../shared/types';
import { handleTranslate } from './router';
import { cacheClear } from './cache';
import { testConnection } from './translator';
import { getSettings } from '../shared/storage';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'translate') {
    const segments = message.segments;
    if (!Array.isArray(segments)) {
      console.error('[iTranslate] Validation: segments is not an array', typeof segments);
      sendResponse({ success: false, error: 'Invalid segments payload' });
      return false;
    }
    if (segments.length === 0) {
      console.error('[iTranslate] Validation: segments array is empty');
      sendResponse({ success: false, error: 'Invalid segments payload' });
      return false;
    }
    if (segments.length > 5000) {
      console.error('[iTranslate] Validation: too many segments', segments.length);
      sendResponse({ success: false, error: 'Invalid segments payload' });
      return false;
    }
    const valid = segments.every(
      (s: unknown) => s != null && typeof (s as TranslationSegment).id === 'string' && typeof (s as TranslationSegment).text === 'string'
    );
    if (!valid) {
      console.error('[iTranslate] Validation: malformed segment entries', segments);
      sendResponse({ success: false, error: 'Malformed segment entries' });
      return false;
    }
    handleTranslate(segments, _sender.tab?.id)
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err: Error) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === 'clearCache') {
    cacheClear()
      .then(() => sendResponse({ success: true }))
      .catch((err: Error) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === 'testConnection') {
    getSettings()
      .then((settings) => testConnection(settings))
      .then((ok) => sendResponse({ success: true, connected: ok }))
      .catch((err: Error) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
