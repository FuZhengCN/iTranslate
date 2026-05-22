import { getSettings, saveSettings } from '../shared/storage';
import { LANGUAGE_OPTIONS } from '../shared/constants';
import { detectPageLang, detectLangFromText } from '../shared/lang-detect';

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

  // Auto-detect page language if user hasn't locked source manually
  if (!settings.sourceLangLocked) {
    try {
      const tab = await getActiveTab();
      if (tab.id) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.documentElement.lang,
        });
        const pageLang = results[0]?.result ?? null;
        let detected = detectPageLang(pageLang);

        // Fallback: character-based detection when <html lang> is missing
        if (!detected) {
          const textResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText.slice(0, 2000),
          });
          const bodyText = textResults[0]?.result ?? '';
          detected = detectLangFromText(bodyText);
        }

        if (detected && detected !== settings.sourceLang) {
          settings.sourceLang = detected;
          sourceLangEl.value = detected;
        }
      }
    } catch {
      // chrome:// page or restricted — silently skip
    }
  }

  // Auto-detect target language from browser UI language if user hasn't locked it
  if (!settings.targetLangLocked) {
    const detected = detectPageLang(navigator.language);
    if (detected && detected !== settings.targetLang) {
      settings.targetLang = detected;
      targetLangEl.value = detected;
    }
  }

  settings.systemPrompt = generateSystemPrompt(settings.sourceLang, settings.targetLang);
  await saveSettings(settings);
}

function generateSystemPrompt(sourceLang: string, targetLang: string): string {
  return `You are a professional ${sourceLang}-to-${targetLang} translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the ${targetLang} translation, nothing else.`;
}

async function saveLanguageSettings(lockSource = false, lockTarget = false): Promise<void> {
  const settings = await getSettings();
  settings.sourceLang = sourceLangEl.value;
  settings.targetLang = targetLangEl.value;
  if (lockSource) settings.sourceLangLocked = true;
  if (lockTarget) settings.targetLangLocked = true;
  settings.systemPrompt = generateSystemPrompt(settings.sourceLang, settings.targetLang);
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
  saveLanguageSettings(true);
});

targetLangEl.addEventListener('change', () => {
  saveLanguageSettings(false, true);
});

swapBtn.addEventListener('click', async () => {
  const srcVal = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = srcVal;
  await saveLanguageSettings(true, true);
});

async function ensureContentScript(tabId: number): Promise<void> {
  const manifest = chrome.runtime.getManifest();
  const csFiles = manifest.content_scripts?.[0]?.js;
  if (csFiles && csFiles.length > 0) {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: csFiles,
    });
  }
}

translateBtn.addEventListener('click', async () => {
  errorDiv.classList.add('hidden');

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error('No active tab');

    activeTabId = tab.id;

    if (!isTranslated) {
      translateBtn.disabled = true;
      translateBtn.textContent = 'Translating...';
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
      } catch {
        // Content script may be stale after extension update — re-inject and retry
        await ensureContentScript(tab.id!);
        await chrome.tabs.sendMessage(tab.id, { action: 'translatePage' });
      }
      window.close();
    } else {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: 'undoTranslation' });
      } catch {
        await ensureContentScript(tab.id!);
        await chrome.tabs.sendMessage(tab.id, { action: 'undoTranslation' });
      }
      isTranslated = false;
      translateBtn.textContent = 'Translate This Page';
      window.close();
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
