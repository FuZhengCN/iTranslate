import { getSettings, saveSettings } from '../shared/storage';
import { DEFAULT_SETTINGS, LANGUAGE_OPTIONS } from '../shared/constants';
import type { Settings } from '../shared/types';

const apiEndpointEl = document.getElementById('apiEndpoint') as HTMLInputElement;
const apiKeyEl = document.getElementById('apiKey') as HTMLInputElement;
const modelEl = document.getElementById('model') as HTMLInputElement;
const systemPromptEl = document.getElementById('systemPrompt') as HTMLTextAreaElement;
const sourceLangEl = document.getElementById('sourceLang') as HTMLSelectElement;
const targetLangEl = document.getElementById('targetLang') as HTMLSelectElement;
const swapBtn = document.getElementById('swapBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

function generateSystemPrompt(sourceLang: string, targetLang: string): string {
  return `You are a professional ${sourceLang}-to-${targetLang} translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the ${targetLang} translation, nothing else.`;
}

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

async function loadSettings(): Promise<void> {
  const settings = await getSettings();
  apiEndpointEl.value = settings.apiEndpoint;
  apiKeyEl.value = settings.apiKey;
  modelEl.value = settings.model;
  systemPromptEl.value = settings.systemPrompt;
  sourceLangEl.value = settings.sourceLang;
  targetLangEl.value = settings.targetLang;
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
    sourceLang: sourceLangEl.value,
    targetLang: targetLangEl.value,
  };
}

// Auto-update system prompt when language changes
sourceLangEl.addEventListener('change', () => {
  systemPromptEl.value = generateSystemPrompt(sourceLangEl.value, targetLangEl.value);
});

targetLangEl.addEventListener('change', () => {
  systemPromptEl.value = generateSystemPrompt(sourceLangEl.value, targetLangEl.value);
});

swapBtn.addEventListener('click', () => {
  const srcVal = sourceLangEl.value;
  sourceLangEl.value = targetLangEl.value;
  targetLangEl.value = srcVal;
  systemPromptEl.value = generateSystemPrompt(sourceLangEl.value, targetLangEl.value);
});

saveBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required.', 'error');
    return;
  }
  await saveSettings(settings);
  showStatus('Settings saved.', 'success');
});

testBtn.addEventListener('click', async () => {
  const settings = getFormSettings();
  if (!settings.apiKey) {
    showStatus('API key is required to test connection.', 'error');
    return;
  }

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

populateLanguageSelects();
loadSettings();
