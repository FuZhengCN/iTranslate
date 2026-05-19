export interface TranslationSegment {
  id: string;
  text: string;
}

export interface TranslationResult {
  id: string;
  original: string;
  translated: string;
}

export interface CacheEntry {
  translated: string;
  timestamp: number;
}

export interface Settings {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
}
