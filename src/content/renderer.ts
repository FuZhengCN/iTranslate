import type { TranslationResult } from '../shared/types';

/** Find the innermost element inside `block` that directly contains text, so we
 *  can copy its computed style to the translation clone. Returns the block
 *  itself if it has direct text, otherwise the first descendant that does. */
function findTextLeaf(block: Element): Element | null {
  // If block itself has direct text, use it (most reliable)
  for (const child of block.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      return block;
    }
  }
  // Otherwise, find the descendant with the longest trimmed text content.
  // Prevents picking metadata elements (byline, caption, etc.) whose tiny
  // text is unrepresentative of the block's actual visual style.
  let bestEl: Element | null = null;
  let bestLen = 0;
  for (const el of block.querySelectorAll('*')) {
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const len = (child.textContent?.trim() ?? '').length;
        if (len > bestLen) {
          bestEl = el;
          bestLen = len;
        }
      }
    }
  }
  return bestEl;
}

/** Determine the tag name for a translation clone. For `<li>` inside
 *  `<ol>`/`<ul>`, use `<div>` to avoid the browser rendering the clone as an
 *  additional numbered/bulleted list item. */
function getCloneTag(source: Element): string {
  const parent = source.parentElement;
  if (parent && (parent.tagName === 'OL' || parent.tagName === 'UL')
      && source.tagName === 'LI') {
    return 'DIV';
  }
  return source.tagName;
}

/** Create a shallow clone of the source element for translation insertion.
 *  Copies all attributes from source. For list items, the tag may differ
 *  (see {@link getCloneTag}). */
function createClone(source: Element): HTMLElement {
  const clone = document.createElement(getCloneTag(source));
  for (let i = 0; i < source.attributes.length; i++) {
    const attr = source.attributes[i];
    clone.setAttribute(attr.name, attr.value);
  }
  return clone;
}

/** Copy key text-rendering computed styles from source element's text leaf
 *  to the translation target, so the clone matches the original text
 *  appearance even though it lacks the inner DOM structure. Also resets
 *  height constraints so translated text can freely expand or contract. */
function applyTextStyles(source: Element, target: HTMLElement): void {
  const leaf = findTextLeaf(source) ?? source;
  const style = getComputedStyle(leaf);
  target.style.color = style.color;
  target.style.fontSize = style.fontSize;
  target.style.fontWeight = style.fontWeight;
  target.style.lineHeight = style.lineHeight;
  if (style.color === 'rgb(255, 255, 255)') {
    target.style.opacity = '1';
  }

  // Remove height constraints inherited from the cloned block so the
  // translation can naturally size itself — English 3 lines may become
  // Chinese 2 lines, or vice versa.
  target.style.height = 'auto';
  target.style.maxHeight = 'none';
  target.style.minHeight = '0';
  target.style.overflow = 'visible';
  target.style.webkitLineClamp = 'unset';
}

export function renderPlaceholders(sourceElements: Element[]): void {
  let count = 0;
  let skipped = 0;
  for (const el of sourceElements) {
    // Skip if a translation or placeholder already exists for this element
    const existing = el.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) {
      skipped++;
      continue;
    }

    const clone = createClone(el);
    clone.innerHTML = '<span class="itranslate-dot"></span><span class="itranslate-dot"></span><span class="itranslate-dot"></span>';
    clone.classList.add('itranslate-translation', 'itranslate-placeholder');
    // 移除可能从源元素克隆来的隐藏样式，确保占位点可见
    clone.style.display = '';
    clone.style.visibility = '';
    clone.style.overflow = 'visible';
    clone.style.maxHeight = '';
    clone.style.minHeight = '';

    el.insertAdjacentElement('afterend', clone);
    count++;
  }
  console.log(`[iTranslate] 📍 Placeholders: ${count} inserted, ${skipped} skipped (already present)`);
}

export function renderTranslations(
  results: TranslationResult[],
  sourceElements: Element[]
): void {
  const resultMap = new Map(results.map((r) => [r.id, r]));
  let rendered = 0;
  let missing = 0;

  for (let i = 0; i < sourceElements.length; i++) {
    const el = sourceElements[i];
    const result = resultMap.get(`seg_${i}`);
    if (!result) {
      missing++;
      continue;
    }

    // Find existing translation element (might be a placeholder)
    const existing = el.nextElementSibling;
    if (existing?.classList.contains('itranslate-translation')) {
      existing.textContent = result.translated;
      existing.classList.remove('itranslate-placeholder');
      applyTextStyles(el, existing as HTMLElement);
      rendered++;
      continue;
    }

    const clone = createClone(el);
    clone.textContent = result.translated;
    clone.classList.add('itranslate-translation');
    applyTextStyles(el, clone);

    el.insertAdjacentElement('afterend', clone);
    rendered++;
  }
  console.log(`[iTranslate] 🎨 Rendered: ${rendered} translations, ${missing} missing results`);
}

export function removeTranslations(): void {
  document.querySelectorAll('.itranslate-translation').forEach(el => el.remove());
}
