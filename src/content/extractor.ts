import type { TranslationSegment } from '../shared/types';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME', 'CODE', 'PRE', 'KBD', 'BR', 'HR', 'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'VIDEO', 'AUDIO', 'CANVAS']);
const SKIP_CLASS_NAMES = /(header|footer|nav|sidebar|comment|menu|widget|advert|banner|social|share-btn|related|trending|recommend)/i;

function isSkippable(el: Element): boolean {
  const tag = el.tagName;
  if (SKIP_TAGS.has(tag)) return true;
  const className = el.className?.toString() ?? '';
  // Skip already-translated elements
  if (className.includes('itranslate-translation')) return true;
  const id = el.id ?? '';
  if (SKIP_CLASS_NAMES.test(className) || SKIP_CLASS_NAMES.test(id)) return true;
  const role = el.getAttribute('role') ?? '';
  if (/banner|navigation|complementary|contentinfo/i.test(role)) return true;
  // Lightweight hidden check — no getComputedStyle
  if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') return true;
  return false;
}

function hasDirectText(el: Element): boolean {
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      return true;
    }
  }
  return false;
}

function findContentRoot(): Element {
  const selectors = [
    // Article/detail pages (semantic)
    'article',
    '[role="main"]',
    'main',
    // Article/detail pages (common class names)
    '.post-content',
    '.article-content',
    '.entry-content',
    '.news-content',
    // CGTN specific
    '.cg-detail-mainWrap',
    '.new-detailWrap-v3',
    '.cg-mainWrapper',
    // Homepage / generic layout
    '.g-layout',
    '[class*="home"][class*="container"]',
    '[class*="main"][class*="wrapper"]',
    // Very generic — last resort
    '#content',
    '.content',
  ];
  let bestEl: Element | null = null;
  let bestCount = 0;

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const count = el ? el.querySelectorAll('*').length : 0;
    if (count > bestCount) {
      bestEl = el;
      bestCount = count;
    }
  }

  // If the best match has very few elements, body likely has more
  const bodyCount = document.body.querySelectorAll('*').length;
  if (bestCount < 30 && bodyCount > bestCount) {
    console.log(`[iTranslate] Content root: body (fallback, best was ${bestCount} vs body ${bodyCount})`);
    return document.body;
  }

  if (bestEl && bestCount > 0) {
    console.log(`[iTranslate] Content root: matched selector (${bestCount} elements)`);
    return bestEl;
  }

  console.log('[iTranslate] Content root: body (fallback)');
  return document.body;
}

export interface ExtractionResult {
  sourceElements: Element[];
  allSegments: TranslationSegment[];
}

export function extractSegments(): ExtractionResult {
  const root = findContentRoot();
  const allElements = root.querySelectorAll('*');
  const sourceElements: Element[] = [];
  const allSegments: TranslationSegment[] = [];

  for (const el of allElements) {
    // Cheap checks first — skip elements without direct text before
    // calling getComputedStyle in isSkippable
    if (!hasDirectText(el)) continue;

    const text = el.textContent?.trim();
    if (!text || text.length <= 3) continue;

    if (isSkippable(el)) continue;

    const id = `seg_${allSegments.length}`;
    sourceElements.push(el);
    allSegments.push({ id, text });
  }

  console.log(`[iTranslate] Extracted ${sourceElements.length} translatable elements from ${allElements.length} total`);
  return { sourceElements, allSegments };
}
