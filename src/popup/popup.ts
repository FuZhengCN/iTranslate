import { getSettings, saveSettings } from '../shared/storage';
import { LANGUAGE_OPTIONS } from '../shared/constants';

const translateBtn = document.getElementById('translateBtn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
const clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;
const sourceLangEl = document.getElementById('sourceLang') as HTMLSelectElement;
const targetLangEl = document.getElementById('targetLang') as HTMLSelectElement;
const swapBtn = document.getElementById('swapBtn') as HTMLButtonElement;
const errorDiv = document.getElementById('error') as HTMLDivElement;

let isTranslated = false;
let activeTabId: number | null = null;

function populateLanguageSelects(): void {
  for (const lang of LANGUAGE_OPTIONS) {
    const opt1 = document.createElement('option');
    opt1.value = lang.value;
    opt1.textContent = lang.label;
    sourceLangEl.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = lang.value;
    opt2.textContent = lang.label;
    targetLangEl.appendChild(opt2);
  }
}

async function loadLanguageSettings(): Promise<void> {
  const settings = await getSettings();
  sourceLangEl.value = settings.sourceLang;
  targetLangEl.value = settings.targetLang;
}

async function saveLanguageSettings(): Promise<void> {
  const settings = await getSettings();
  settings.sourceLang = sourceLangEl.value;
  settings.targetLang = targetLangEl.value;
  await saveSettings(settings);
}

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

populateLanguageSelects();
loadLanguageSettings();
syncState();

sourceLangEl.addEventListener('change', () => {
  saveLanguageSettings();
});

targetLangEl.addEventListener('change', () => {
  saveLanguageSettings();
});

swapBtn.addEventListener('click', async () => {
  const srcVal = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = srcVal;
  await saveLanguageSettings();
});

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
    setTimeout(() => {
      clearCacheBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear Cache';
    }, 1500);
  } catch (err) {
    errorDiv.textContent = 'Failed to clear cache.';
    errorDiv.classList.remove('hidden');
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab?.id !== activeTabId) return;

  if (message.action === 'translationComplete') {
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
