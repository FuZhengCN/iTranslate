import type { TranslationResult } from '../shared/types';

function isWhiteText(el: Element): boolean {
  const color = getComputedStyle(el).color;
  const result = color === 'rgb(255, 255, 255)';
  console.log('[iTranslate] isWhiteText — color:', color, '| match:', result, '| tag:', el.tagName);
  return result;
}

export function renderPlaceholders(sourceElements: Element[]): void {
  for (const el of sourceElements) {
    // Skip if a translation or placeholder already exists for this element
    const existing = el.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) continue;

    const clone = el.cloneNode(false) as HTMLElement;
    clone.innerHTML = '<span class="itranslate-dot"></span><span class="itranslate-dot"></span><span class="itranslate-dot"></span>';
    clone.classList.add('itranslate-translation', 'itranslate-placeholder');
    if (isWhiteText(el)) clone.style.opacity = '1';

    el.insertAdjacentElement('afterend', clone);
  }
}

export function renderTranslations(
  results: TranslationResult[],
  sourceElements: Element[]
): void {
  const resultMap = new Map(results.map((r) => [r.id, r]));

  for (let i = 0; i < sourceElements.length; i++) {
    const el = sourceElements[i];
    const result = resultMap.get(`seg_${i}`);
    if (!result) continue;

    // Find existing translation element (might be a placeholder)
    const existing = el.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) {
      existing.textContent = result.translated;
      existing.classList.remove('itranslate-placeholder');
      const white = isWhiteText(el);
      (existing as HTMLElement).style.opacity = white ? '1' : '';
      const afterStyle = getComputedStyle(existing);
      console.log('[iTranslate] clone (updated) — inline opacity:', (existing as HTMLElement).style.opacity,
        '| computed opacity:', afterStyle.opacity,
        '| computed color:', afterStyle.color);
      continue;
    }

    const clone = el.cloneNode(false) as HTMLElement;
    clone.textContent = result.translated;
    clone.classList.add('itranslate-translation');
    const white = isWhiteText(el);
    if (white) clone.style.opacity = '1';

    el.insertAdjacentElement('afterend', clone);

    const afterStyle = getComputedStyle(clone);
    console.log('[iTranslate] clone (new) — inline opacity:', clone.style.opacity,
      '| computed opacity:', afterStyle.opacity,
      '| computed color:', afterStyle.color);
  }
}

export function removeTranslations(): void {
  document.querySelectorAll('.itranslate-translation').forEach(el => el.remove());
}
