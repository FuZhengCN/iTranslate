import { getSettings, saveSettings } from '../shared/storage';
import { LANGUAGE_OPTIONS } from '../shared/constants';
import { detectPageLang, detectLangFromText } from '../shared/lang-detect';
import { t } from '../shared/i18n';

const translateBtn = document.getElementById('translateBtn') as HTMLButtonElement;
const settingsBtn = document.getElementById('settingsBtn') as HTMLButtonElement;
const selectionToggle = document.getElementById('selectionToggle') as HTMLButtonElement;
const selectionToggleText = document.getElementById('selectionToggleText') as HTMLSpanElement;
const floatingPanelToggle = document.getElementById('floatingPanelToggle') as HTMLButtonElement;
const floatingPanelToggleText = document.getElementById('floatingPanelToggleText') as HTMLSpanElement;
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

async function getTabLocks(tabId: number): Promise<{ source: boolean; target: boolean }> {
  const key = `lang_lock_${tabId}`;
  const data = await chrome.storage.session.get(key);
  return data[key] || { source: false, target: false };
}

async function setTabLocks(tabId: number, lockSource: boolean, lockTarget: boolean): Promise<void> {
  const key = `lang_lock_${tabId}`;
  const current = await getTabLocks(tabId);
  await chrome.storage.session.set({
    [key]: { source: current.source || lockSource, target: current.target || lockTarget },
  });
}

async function loadLanguageSettings(): Promise<void> {
  const settings = await getSettings();
  const tab = await getActiveTab();
  const locks = tab.id ? await getTabLocks(tab.id) : { source: false, target: false };

  sourceLangEl.value = settings.sourceLang;
  targetLangEl.value = settings.targetLang;
  console.log(`[iTranslate] 🌐 Popup init: sourceLang="${settings.sourceLang}" targetLang="${settings.targetLang}" tabId=${tab.id} locked=${locks.source}/${locks.target}`);

  // Auto-detect page language if not locked for this tab
  if (!locks.source && tab.id) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.lang,
      });
      const pageLang = results[0]?.result ?? null;
      console.log(`[iTranslate] 🌐 Page detect: <html lang>="${pageLang}"`);
      let detected = detectPageLang(pageLang);
      console.log(`[iTranslate] 🌐 detectPageLang result: "${detected}"`);

      if (!detected) {
        console.log(`[iTranslate] 🌐 Falling back to text-based detection...`);
        const textResults = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerText.slice(0, 2000),
        });
        const bodyText = textResults[0]?.result ?? '';
        detected = detectLangFromText(bodyText);
        console.log(`[iTranslate] 🌐 Text-based detect result: "${detected}" from "${bodyText.slice(0, 40)}..."`);
      }

      if (detected && detected !== settings.sourceLang) {
        console.log(`[iTranslate] 🌐 Updating sourceLang: "${settings.sourceLang}" → "${detected}"`);
        settings.sourceLang = detected;
        sourceLangEl.value = detected;
      } else if (detected) {
        console.log(`[iTranslate] 🌐 sourceLang already matches detected: "${detected}"`);
      }
    } catch (err) {
      console.log(`[iTranslate] 🌐 Source detect failed (restricted page?):`, err);
    }
  }

  // Auto-detect target language from browser UI language if not locked for this tab
  if (!locks.target) {
    console.log(`[iTranslate] 🌐 Target detect: navigator.language="${navigator.language}"`);
    const detected = detectPageLang(navigator.language);
    console.log(`[iTranslate] 🌐 Target detect result: "${detected}"`);
    if (detected && detected !== settings.targetLang) {
      console.log(`[iTranslate] 🌐 Updating targetLang: "${settings.targetLang}" → "${detected}"`);
      settings.targetLang = detected;
      targetLangEl.value = detected;
    } else if (detected) {
      console.log(`[iTranslate] 🌐 targetLang already matches detected: "${detected}"`);
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
  settings.systemPrompt = generateSystemPrompt(settings.sourceLang, settings.targetLang);
  await saveSettings(settings);

  if (lockSource || lockTarget) {
    const tab = await getActiveTab();
    if (tab.id) await setTabLocks(tab.id, lockSource, lockTarget);
  }
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
      setButtonState('undo');
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
translateBtn.style.color = 'var(--itranslate-surface-white)';
selectionToggleText.textContent = t('selectionTranslate');
floatingPanelToggleText.textContent = t('floatingPanelToggle');

populateLanguageSelects();
loadLanguageSettings();
syncState();

// Init floating panel toggle from settings
getSettings().then((settings) => {
  updateFloatingPanelToggleUI(settings.floatingPanelEnabled);
});

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

function updateFloatingPanelToggleUI(enabled: boolean): void {
  if (enabled) {
    floatingPanelToggle.classList.remove('off');
  } else {
    floatingPanelToggle.classList.add('off');
  }
}

const BTN_UNDO_BG = 'var(--itranslate-gradient-undo)';

function setButtonState(state: 'translate' | 'undo' | 'translating'): void {
  translateBtn.style.background = '';
  translateBtn.style.color = '';
  if (state === 'translate') {
    translateBtn.textContent = t('translatePage');
    translateBtn.style.color = 'var(--itranslate-surface-white)';
  } else if (state === 'undo') {
    translateBtn.textContent = t('undoTranslation');
    translateBtn.style.background = BTN_UNDO_BG;
    translateBtn.style.color = 'var(--itranslate-surface-white)';
  } else {
    translateBtn.textContent = t('translating');
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

floatingPanelToggle.addEventListener('click', async () => {
  const enabling = floatingPanelToggle.classList.contains('off');
  updateFloatingPanelToggleUI(enabling);

  const settings = await getSettings();
  settings.floatingPanelEnabled = enabling;
  await saveSettings(settings);

  try {
    const tab = await getActiveTab();
    if (!tab.id) return;
    await ensureContentScript(tab.id);
    await chrome.tabs.sendMessage(tab.id, {
      action: 'toggleFloatingPanel',
      enabled: enabling,
    });
  } catch (err) {
    console.error('[iTranslate] 🔘 toggleFloatingPanel failed:', err);
    updateFloatingPanelToggleUI(!enabling);
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
      setButtonState('translating');
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
      setButtonState('translate');
      window.close();
    }
  } catch (err) {
    errorDiv.textContent = t('cannotTranslatePage');
    errorDiv.classList.remove('hidden');
    isTranslated = false;
    translateBtn.disabled = false;
    setButtonState('translate');
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
    setButtonState('undo');
  }
  if (message.action === 'translationError') {
    isTranslated = false;
    translateBtn.disabled = false;
    setButtonState('translate');
  }
});
