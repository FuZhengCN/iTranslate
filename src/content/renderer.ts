import type { TranslationResult } from '../shared/types';

export function renderTranslations(
  results: TranslationResult[],
  sourceGroups: { node: Text; segments: { id: string }[] }[]
): void {
  const resultMap = new Map(results.map((r) => [r.id, r]));

  for (const group of sourceGroups) {
    const node = group.node;
    const translationsInGroup: TranslationResult[] = [];
    for (const seg of group.segments) {
      const result = resultMap.get(seg.id);
      if (result) {
        translationsInGroup.push(result);
      }
    }

    if (translationsInGroup.length === 0) continue;

    const parent = node.parentElement;
    if (!parent) continue;

    const translatedText = translationsInGroup.map((r) => r.translated).join(' ');

    const translation = document.createElement('p');
    translation.className = 'itranslate-translation';
    translation.textContent = translatedText;

    parent.insertAdjacentElement('afterend', translation);
  }
}
