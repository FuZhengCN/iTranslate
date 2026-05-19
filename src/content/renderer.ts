import type { TranslationResult } from '../shared/types';

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'SECTION', 'TD', 'TH', 'DD', 'DT', 'FIGCAPTION',
]);

function findBlockAncestor(el: Element): Element {
  let current: Element | null = el;
  while (current) {
    if (BLOCK_TAGS.has(current.tagName)) return current;
    current = current.parentElement;
  }
  return el;
}

export function renderTranslations(
  results: TranslationResult[],
  sourceGroups: { node: Text; segments: { id: string }[] }[]
): void {
  const resultMap = new Map(results.map((r) => [r.id, r]));

  // Group by block ancestor so all text in one paragraph produces one translation
  const blockMap = new Map<Element, { node: Text; text: string }[]>();

  for (const group of sourceGroups) {
    const node = group.node;
    if (!node.parentElement) continue;

    const block = findBlockAncestor(node.parentElement);
    const texts: string[] = [];
    for (const seg of group.segments) {
      const result = resultMap.get(seg.id);
      if (result) texts.push(result.translated);
    }
    if (texts.length === 0) continue;

    const entry = blockMap.get(block);
    if (entry) {
      entry.push({ node, text: texts.join(' ') });
    } else {
      blockMap.set(block, [{ node, text: texts.join(' ') }]);
    }
  }

  for (const [block, entries] of blockMap) {
    const translatedText = entries.map((e) => e.text).join(' ');

    // Check if translation already exists for this block — update instead of duplicating
    const existing = block.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) {
      existing.textContent = translatedText;
      continue;
    }

    const clone = block.cloneNode(false) as HTMLElement;
    clone.textContent = translatedText;
    clone.classList.add('itranslate-translation');

    block.insertAdjacentElement('afterend', clone);
  }
}
