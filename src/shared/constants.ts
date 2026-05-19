import type { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  systemPrompt:
    'You are a professional English-to-Chinese translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the Chinese translation, nothing else.',
};

export const CACHE_DB_NAME = 'itranslate-cache';
export const CACHE_STORE_NAME = 'translations';

export const STORAGE_KEY_SETTINGS = 'itranslate_settings';
