import { getSettings, saveSettings } from '../shared/storage';
import { LANGUAGE_OPTIONS } from '../shared/constants';
import { detectPageLang, detectLangFromText } from '../shared/lang-detect';
import { t } from '../shared/i18n';

const translateBtn = document.getElementById('translateBtn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
const selectionToggle = document.getElementById('selectionToggle') as HTMLButtonElement;
const selectionToggleText = document.getElementById('selectionToggleText') as HTMLSpanElement;
const sourceLangEl = document.getElementById('sourceLang') as HTMLSelectElement;
const targetLangEl = document.getElementById('targetLang') as HTMLSelectElement;
const swapBtn = document.getElementById('swapBtn') as HTMLButtonElement;
const errorDiv = document.getElementById('error') as HTMLDivElement;
const appNameLabel = document.getElementById('appNameLabel') as HTMLSpanElement;
const versionLabel = document.getElementById('versionLabel') as HTMLSpanElement;

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
      translateBtn.textContent = t('undoTranslation');
    }
    updateSelectionToggleUI(response?.selectionEnabled ?? false);
  } catch {
    // Content script not injected or not responding — stay with defaults
  }
}

// Set localized UI text (before async init so text is ready immediately)
appNameLabel.textContent = t('appName');
settingsBtn.title = t('settings');
swapBtn.title = t('swapLanguages');
translateBtn.textContent = t('translatePage');
selectionToggleText.textContent = t('selectionTranslate');

populateLanguageSelects();
loadLanguageSettings();
syncState();

// Set version label
versionLabel.textContent = t('version', [chrome.runtime.getManifest().version]);

sourceLangEl.addEventListener('change', () => {
  saveLanguageSettings(true);
});

targetLangEl.addEventListener('change', () => {
  saveLanguageSettings(false, true);
});

function updateSelectionToggleUI(enabled: boolean): void {
  if (enabled) {
    selectionToggle.classList.remove('off');
  } else {
    selectionToggle.classList.add('off');
  }
}

selectionToggle.addEventListener('click', async () => {
  const enabling = selectionToggle.classList.contains('off');
  console.log(`[iTranslate] 🔘 Selection toggle clicked: ${enabling ? 'ENABLE' : 'DISABLE'}`);
  updateSelectionToggleUI(enabling);

  try {
    const tab = await getActiveTab();
    if (!tab.id) {
      console.log('[iTranslate] 🔘 No active tab, aborting');
      return;
    }
    console.log(`[iTranslate] 🔘 Tab ID: ${tab.id}, URL: ${tab.url}`);
    await ensureContentScript(tab.id);
    console.log(`[iTranslate] 🔘 Content script ready, sending toggleSelection (enabled=${enabling})`);
    await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleSelection',
      enabled: enabling,
    });
    console.log(`[iTranslate] 🔘 toggleSelection message sent successfully`);
  } catch (err) {
    console.error(`[iTranslate] 🔘 toggleSelection failed:`, err);
    updateSelectionToggleUI(!enabling);
  }
});

swapBtn.addEventListener('click', async () => {
  const srcVal = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = srcVal;
  await saveLanguageSettings(true, true);
});

async function ensureContentScript(tabId: number): Promise<void> {
  console.log(`[iTranslate] 🔘 ensureContentScript: checking if content script is loaded...`);
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    console.log(`[iTranslate] 🔘 ensureContentScript: ping OK — already loaded`);
    return;
  } catch {
    console.log(`[iTranslate] 🔘 ensureContentScript: ping failed — injecting content script`);
  }
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['assets/content.js'],
    });
    console.log(`[iTranslate] 🔘 ensureContentScript: content.js injected, verifying with ping...`);
  } catch (err) {
    console.error(`[iTranslate] 🔘 ensureContentScript: injection failed`, err);
    throw err;
  }
  // 注入后重试验证（最多 5 次，每次 100ms），应对竞态
  for (let i = 0; i < 5; i++) {
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      console.log(`[iTranslate] 🔘 ensureContentScript: post-injection ping OK (attempt ${i + 1})`);
      return;
    } catch {
      console.log(`[iTranslate] 🔘 ensureContentScript: post-injection ping failed (attempt ${i + 1}/5), retrying...`);
      await new Promise(r => setTimeout(r, 100));
    }
  }
  throw new Error('Content script injected but ping still failing after 5 attempts');
}

translateBtn.addEventListener('click', async () => {
  errorDiv.classList.add('hidden');

  try {
    const tab = await getActiveTab();
    if (!tab.id) throw new Error('No active tab');

    activeTabId = tab.id;

    if (!isTranslated) {
      translateBtn.disabled = true;
      translateBtn.textContent = t('translating');
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
      translateBtn.textContent = t('translatePage');
      window.close();
    }
  } catch (err) {
    errorDiv.textContent = t('cannotTranslatePage');
    errorDiv.classList.remove('hidden');
    isTranslated = false;
    translateBtn.disabled = false;
    translateBtn.textContent = t('translatePage');
  }
});

settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab?.id !== activeTabId) return;

  if (message.action === 'translationComplete') {
    isTranslated = true;
    translateBtn.disabled = false;
    translateBtn.textContent = t('undoTranslation');
  }
  if (message.action === 'translationError') {
    isTranslated = false;
    translateBtn.disabled = false;
    translateBtn.textContent = t('translatePage');
  }
});
