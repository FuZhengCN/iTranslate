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
      console.log('[iTranslate] translation clone (updated) — whiteText:', white, '| opacity set:', white ? '1' : '(css 0.9)');
      continue;
    }

    const clone = el.cloneNode(false) as HTMLElement;
    clone.textContent = result.translated;
    clone.classList.add('itranslate-translation');
    const white = isWhiteText(el);
    if (white) clone.style.opacity = '1';
    console.log('[iTranslate] translation clone (new) — whiteText:', white, '| opacity set:', white ? '1' : '(css 0.9)');

    el.insertAdjacentElement('afterend', clone);
  }
}

export function removeTranslations(): void {
  document.querySelectorAll('.itranslate-translation').forEach(el => el.remove());
}
