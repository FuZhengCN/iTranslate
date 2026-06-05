import type { Settings } from './types';

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'English' },
  { label: '中文', value: 'Chinese' },
  { label: '日本語', value: 'Japanese' },
  { label: '한국어', value: 'Korean' },
  { label: 'Français', value: 'French' },
  { label: 'Deutsch', value: 'German' },
];

export const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  systemPrompt:
    'You are a professional English-to-Chinese translator. Translate the following text accurately while preserving the original meaning, tone, and formatting. Only output the Chinese translation, nothing else.',
  sourceLang: 'English',
  targetLang: 'Chinese',
  floatingPanelEnabled: true,
};

export const CACHE_DB_NAME = 'itranslate-cache';
export const CACHE_STORE_NAME = 'translations';

export const STORAGE_KEY_SETTINGS = 'itranslate_settings';
