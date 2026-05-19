import type { TranslationResult } from '../shared/types';

export function renderTranslations(
  results: TranslationResult[],
  sourceElements: Element[]
): void {
  const resultMap = new Map(results.map((r) => [r.id, r]));

  for (let i = 0; i < sourceElements.length; i++) {
    const el = sourceElements[i];
    const result = resultMap.get(`seg_${i}`);
    if (!result) continue;

    // Check existing translation — update instead of duplicating
    const existing = el.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) {
      existing.textContent = result.translated;
      continue;
    }

    const clone = el.cloneNode(false) as HTMLElement;
    clone.textContent = result.translated;
    clone.classList.add('itranslate-translation');

    el.insertAdjacentElement('afterend', clone);
  }
}
