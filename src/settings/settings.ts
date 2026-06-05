import { getSettings, saveSettings } from '../shared/storage';
import { DEFAULT_SETTINGS } from '../shared/constants';
import type { Settings } from '../shared/types';
import { t } from '../shared/i18n';
import { applyTheme, THEME_OPTIONS } from '../shared/theme-loader';

const settingsTitleEl = document.getElementById('settingsTitle') as HTMLHeadingElement;
const apiEndpointLabel = document.getElementById('apiEndpointLabel') as HTMLLabelElement;
const apiEndpointHint = document.getElementById('apiEndpointHint') as HTMLSpanElement;
const apiKeyLabel = document.getElementById('apiKeyLabel') as HTMLLabelElement;
const apiKeyHint = document.getElementById('apiKeyHint') as HTMLSpanElement;
const modelLabel = document.getElementById('modelLabel') as HTMLLabelElement;
const systemPromptLabel = document.getElementById('systemPromptLabel') as HTMLSpanElement;
const systemPromptEditable = document.getElementById('systemPromptEditable') as HTMLSpanElement;
const apiEndpointEl = document.getElementById('apiEndpoint') as HTMLInputElement;
const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;
const modelEl = document.getElementById('model') as HTMLInputElement;
const systemPromptEl = document.getElementById('systemPrompt') as HTMLTextAreaElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const clearCacheBtn = document.getElementById('clearCacheBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;
const themeSelect = document.getElementById('themeSelect') as HTMLSelectElement;
const themeLabel = document.getElementById('themeLabel') as HTMLLabelElement;

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  apiEndpointEl.value = settings.apiEndpoint;
  apiKeyEl.value = settings.apiKey;
  modelEl.value = settings.model;
  systemPromptEl.value = settings.systemPrompt;
  themeSelect.value = settings.theme || 'glacier';
  applyTheme(settings.theme || 'glacier');
}

function showStatus(message: string, type: 'success' | 'error'): void {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  setTimeout(() => { statusDiv.className = 'status hidden'; }, 4000);
}

function getFormSettings(): Settings {
  return {
    apiEndpoint: apiEndpointEl.value.trim() || DEFAULT_SETTINGS.apiEndpoint,
    apiKey: apiKeyEl.value.trim(),
    model: modelEl.value.trim() || DEFAULT_SETTINGS.model,
    systemPrompt: systemPromptEl.value.trim() || DEFAULT_SETTINGS.systemPrompt,
    sourceLang: '',
    targetLang: '',
    floatingPanelEnabled: true,
    theme: 'glacier',
  };
}

saveBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus(t('apiKeyRequired'), 'error');
    return;
  }
  // Preserve language settings from storage (not managed on this page)
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  settings.floatingPanelEnabled = current.floatingPanelEnabled;
  settings.theme = current.theme;
  await saveSettings(settings);
  showStatus(t('settingsSaved'), 'success');
});

testBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus(t('apiKeyRequiredForTest'), 'error');
    return;
  }
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  settings.floatingPanelEnabled = current.floatingPanelEnabled;
  settings.theme = current.theme;
  await saveSettings(settings);

  try {
    const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
    if (response.success && response.connected) {
      showStatus(t('connectionSuccessful'), 'success');
    } else {
      showStatus(t('connectionFailed'), 'error');
    }
  } catch (err) {
    showStatus(t('connectionError', [(err as Error).message]), 'error');
  }
});

clearCacheBtn.addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'clearCache' });
    showStatus(t('cacheCleared'), 'success');
  } catch {
    showStatus(t('failedToClearCache'), 'error');
  }
});

// Set localized UI text
document.title = t('settingsTitle');
settingsTitleEl.textContent = t('settingsTitle');
apiEndpointLabel.textContent = t('apiEndpoint');
apiEndpointHint.textContent = t('apiEndpointHint');
apiKeyLabel.textContent = t('apiKey');
apiKeyHint.textContent = t('apiKeyHint');
modelLabel.textContent = t('model');
systemPromptLabel.textContent = t('systemPrompt');
systemPromptEditable.textContent = t('systemPromptEditable');
saveBtn.textContent = t('save');
testBtn.textContent = t('testConnection');
clearCacheBtn.textContent = t('clearCache');
themeLabel.textContent = t('theme');

// Populate theme selector
THEME_OPTIONS.forEach((opt) => {
  const option = document.createElement('option');
  option.value = opt.value;
  option.textContent = opt.label;
  themeSelect.appendChild(option);
});

loadSettings();

themeSelect.addEventListener('change', async () => {
  const theme = themeSelect.value as Settings['theme'];
  applyTheme(theme);
  const settings = await getSettings();
  settings.theme = theme;
  await saveSettings(settings);
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    loadSettings();
  }
});
