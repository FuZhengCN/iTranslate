import type { TranslationResult } from '../shared/types';

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'SECTION', 'ARTICLE', 'ASIDE',
  'MAIN', 'HEADER', 'FOOTER', 'FIGCAPTION', 'DETAILS',
  'TD', 'TH', 'DD', 'DT', 'FIELDSET',
]);

function findBlockAncestor(el: Element): Element {
  let current: Element | null = el;
  while (current) {
    if (BLOCK_TAGS.has(current.tagName)) return current;
    current = current.parentElement;
  }
  return el; // fallback to the original parent
}

export function renderTranslations(
  results: TranslationResult[],
  sourceGroups: { node: Text; segments: { id: string }[] }[]
): void {
  const resultMap = new Map(results.map((r) => [r.id, r]));

  // Group translations by block ancestor so each block gets one translation
  const blockMap = new Map<Element, string[]>();

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

    const existing = blockMap.get(block);
    if (existing) {
      existing.push(...texts);
    } else {
      blockMap.set(block, texts);
    }
  }

  for (const [block, texts] of blockMap) {
    const translatedText = texts.join(' ');

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
