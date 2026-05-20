import type { TranslationResult } from '../shared/types';

function isWhiteText(el: Element): boolean {
  return getComputedStyle(el).color === 'rgb(255, 255, 255)';
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
      (existing as HTMLElement).style.opacity = isWhiteText(el) ? '1' : '';
      continue;
    }

    const clone = el.cloneNode(false) as HTMLElement;
    clone.textContent = result.translated;
    clone.classList.add('itranslate-translation');
    if (isWhiteText(el)) clone.style.opacity = '1';

    el.insertAdjacentElement('afterend', clone);
  }
}

export function removeTranslations(): void {
  document.querySelectorAll('.itranslate-translation').forEach(el => el.remove());
}
