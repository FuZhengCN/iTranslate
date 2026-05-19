import type { Settings } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEY_SETTINGS } from './constants';

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(STORAGE_KEY_SETTINGS);
  if (result[STORAGE_KEY_SETTINGS]) {
    return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY_SETTINGS] };
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY_SETTINGS]: settings });
}
