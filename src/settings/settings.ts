import { getSettings, saveSettings } from '../shared/storage';
import { DEFAULT_SETTINGS } from '../shared/constants';
import type { Settings } from '../shared/types';

const apiEndpointEl = document.getElementById('apiEndpoint') as HTMLInputElement;
const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;
const modelEl = document.getElementById('model') as HTMLInputElement;
const systemPromptEl = document.getElementById('systemPrompt') as HTMLTextAreaElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  apiEndpointEl.value = settings.apiEndpoint;
  apiKeyEl.value = settings.apiKey;
  modelEl.value = settings.model;
  systemPromptEl.value = settings.systemPrompt;
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
    sourceLangLocked: false,
    targetLangLocked: false,
  };
}

saveBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required.', 'error');
    return;
  }
  // Preserve language settings from storage (not managed on this page)
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  settings.sourceLangLocked = current.sourceLangLocked;
  await saveSettings(settings);
  showStatus('Settings saved.', 'success');
});

testBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required to test connection.', 'error');
    return;
  }
  const current = await getSettings();
  settings.sourceLang = current.sourceLang;
  settings.targetLang = current.targetLang;
  await saveSettings(settings);

  try {
    const response = await chrome.runtime.sendMessage({ action: 'testConnection' });
    if (response.success && response.connected) {
      showStatus('Connection successful.', 'success');
    } else {
      showStatus('Connection failed. Check your API key and endpoint.', 'error');
    }
  } catch (err) {
    showStatus(`Connection error: ${(err as Error).message}`, 'error');
  }
});

loadSettings();

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    loadSettings();
  }
});
