const translateBtn = document.getElementById('translateBtn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
const clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;
const statsDiv = document.getElementById('stats') as HTMLDivElement;
const segCountEl = document.getElementById('segCount') as HTMLSpanElement;
const cacheHitsEl = document.getElementById('cacheHits') as HTMLSpanElement;
const apiCallsEl = document.getElementById('apiCalls') as HTMLSpanElement;
const errorDiv = document.getElementById('error') as HTMLDivElement;

let isTranslated = false;
let activeTabId: number | null = null;

async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function syncState(): Promise<void> {
  try {
    const tab = await getActiveTab();
    if (!tab.id) return;
    activeTabId = tab.id;
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getState' });
    if (response?.isTranslated) {
      isTranslated = true;
      translateBtn.textContent = 'Undo Translation';
    }
  } catch {
    // Content script not injected or not responding — stay with defaults
  }
}

syncState();

translateBtn.addEventListener('click', async () => {
  errorDiv.classList.add('hidden');

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error('No active tab');

    activeTabId = tab.id;

    if (!isTranslated) {
      translateBtn.disabled = true;
      translateBtn.textContent = 'Translating...';
      await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
    } else {
      await chrome.tabs.sendMessage(tab.id, { action: 'undoTranslation' });
      isTranslated = false;
      translateBtn.textContent = 'Translate This Page';
    }
  } catch (err) {
    errorDiv.textContent = 'Could not translate this page. Make sure you are on a webpage (not a browser internal page).';
    errorDiv.classList.remove('hidden');
    isTranslated = false;
    translateBtn.disabled = false;
    translateBtn.textContent = 'Translate This Page';
  }
});

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

clearCacheBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'clearCache' });
    clearCacheBtn.textContent = 'Cache Cleared!';
    setTimeout(() => { clearCacheBtn.textContent = 'Clear Cache'; }, 1500);
  } catch (err) {
    errorDiv.textContent = 'Failed to clear cache.';
    errorDiv.classList.remove('hidden');
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  // Only respond to messages from the active tab to avoid cross-tab UI updates
  if (sender.tab?.id !== activeTabId) return;

  if (message.action === 'translationComplete') {
    statsDiv.classList.remove('hidden');
    segCountEl.textContent = String(message.totalSegments);
    cacheHitsEl.textContent = String(message.stats?.hits ?? 0);
    apiCallsEl.textContent = String(message.stats?.misses ?? 0);
    isTranslated = true;
    translateBtn.disabled = false;
    translateBtn.textContent = 'Undo Translation';
  }
  if (message.action === 'translationError') {
    isTranslated = false;
    translateBtn.disabled = false;
    translateBtn.textContent = 'Translate This Page';
  }
});
