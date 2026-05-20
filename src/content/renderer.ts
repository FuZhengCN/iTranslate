import type { TranslationResult } from '../shared/types';

/** Find the innermost element inside `block` that directly contains text, so we
 *  can copy its computed style to the translation clone. Returns the block
 *  itself if it has direct text, otherwise the first descendant that does. */
function findTextLeaf(block: Element): Element | null {
  for (const child of block.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      return block;
    }
  }
  const all = block.querySelectorAll('*');
  for (const el of all) {
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        return el;
      }
    }
  }
  return null;
}

/** Copy key text-rendering computed styles from source element's text leaf
 *  to the translation target, so the clone matches the original text
 *  appearance even though it lacks the inner DOM structure. */
function applyTextStyles(source: Element, target: HTMLElement): void {
  const leaf = findTextLeaf(source) ?? source;
  const style = getComputedStyle(leaf);
  target.style.color = style.color;
  target.style.fontFamily = style.fontFamily;
  target.style.fontSize = style.fontSize;
  target.style.fontWeight = style.fontWeight;
  target.style.lineHeight = style.lineHeight;
  if (style.color === 'rgb(255, 255, 255)') {
    target.style.opacity = '1';
  }
}

export function renderPlaceholders(sourceElements: Element[]): void {
  for (const el of sourceElements) {
    // Skip if a translation or placeholder already exists for this element
    const existing = el.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) continue;

    const clone = el.cloneNode(false) as HTMLElement;
    clone.innerHTML = '<span class="itranslate-dot"></span><span class="itranslate-dot"></span><span class="itranslate-dot"></span>';
    clone.classList.add('itranslate-translation', 'itranslate-placeholder');
    applyTextStyles(el, clone);

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
      applyTextStyles(el, existing as HTMLElement);
      continue;
    }

    const clone = el.cloneNode(false) as HTMLElement;
    clone.textContent = result.translated;
    clone.classList.add('itranslate-translation');
    applyTextStyles(el, clone);

    el.insertAdjacentElement('afterend', clone);
  }
}

export function removeTranslations(): void {
  document.querySelectorAll('.itranslate-translation').forEach(el => el.remove());
}
