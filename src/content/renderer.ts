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

    const card = document.createElement('div');
    card.className = 'itranslate-card';
    card.innerHTML = `
      <div class="itranslate-badge">中文 · DeepSeek</div>
      <p class="itranslate-text">${escapeHtml(translatedText)}</p>
    `;

    parent.insertAdjacentElement('afterend', card);
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
