import type { TranslationResult } from '../shared/types';

export function renderPlaceholders(sourceElements: Element[]): void {
  for (const el of sourceElements) {
    // Skip if a translation or placeholder already exists for this element
    const existing = el.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) continue;

    const style = getComputedStyle(el);
    console.log('[iTranslate] placeholder — tag:', el.tagName,
      '| color:', style.color,
      '| bg:', style.backgroundColor,
      '| opacity:', style.opacity,
      '| text:', el.textContent?.trim().slice(0, 40));

    const clone = el.cloneNode(false) as HTMLElement;
    clone.innerHTML = '<span class="itranslate-dot"></span><span class="itranslate-dot"></span><span class="itranslate-dot"></span>';
    clone.classList.add('itranslate-translation', 'itranslate-placeholder');

    el.insertAdjacentElement('afterend', clone);

    const cloneStyle = getComputedStyle(clone);
    console.log('[iTranslate] placeholder clone — color:', cloneStyle.color,
      '| opacity:', cloneStyle.opacity);
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

    const style = getComputedStyle(el);
    console.log('[iTranslate] translation — tag:', el.tagName,
      '| color:', style.color,
      '| bg:', style.backgroundColor,
      '| opacity:', style.opacity,
      '| text:', el.textContent?.trim().slice(0, 40));

    // Find existing translation element (might be a placeholder)
    const existing = el.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) {
      existing.textContent = result.translated;
      existing.classList.remove('itranslate-placeholder');

      const existingStyle = getComputedStyle(existing);
      console.log('[iTranslate] translation clone (updated) — color:', existingStyle.color,
        '| opacity:', existingStyle.opacity);
      continue;
    }

    const clone = el.cloneNode(false) as HTMLElement;
    clone.textContent = result.translated;
    clone.classList.add('itranslate-translation');

    el.insertAdjacentElement('afterend', clone);

    const cloneStyle = getComputedStyle(clone);
    console.log('[iTranslate] translation clone (new) — color:', cloneStyle.color,
      '| opacity:', cloneStyle.opacity);
  }
}

export function removeTranslations(): void {
  document.querySelectorAll('.itranslate-translation').forEach(el => el.remove());
}
