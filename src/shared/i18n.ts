export function detectUILanguage(): 'en' | 'zh_CN' {
  const lang = chrome.i18n.getUILanguage();
  if (lang.startsWith('zh')) return 'zh_CN';
  return 'en';
}

export function t(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}
