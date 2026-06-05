import glacierCss from './themes/glacier.css?inline';
import googleBlueCss from './themes/google-blue.css?inline';
import googleLogoCss from './themes/google-logo.css?inline';

export type ThemeId = 'glacier' | 'google-blue' | 'google-logo';

export const THEME_OPTIONS: { value: ThemeId; label: string }[] = [
  { value: 'glacier', label: 'Glacier' },
  { value: 'google-blue', label: 'Google Blue' },
  { value: 'google-logo', label: 'Google Logo' },
];

const THEME_CSS_MAP: Record<ThemeId, string> = {
  glacier: glacierCss,
  'google-blue': googleBlueCss,
  'google-logo': googleLogoCss,
};

export function applyTheme(theme: ThemeId): void {
  const existing = document.getElementById('itranslate-theme-override');
  if (existing) existing.remove();

  if (theme === 'glacier') return;

  const style = document.createElement('style');
  style.id = 'itranslate-theme-override';
  style.textContent = THEME_CSS_MAP[theme];
  document.head.appendChild(style);
}
