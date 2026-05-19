import type { TranslationSegment } from '../shared/types';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME', 'CODE', 'PRE', 'KBD', 'BR', 'HR', 'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'VIDEO', 'AUDIO', 'CANVAS']);
const SKIP_CLASS_NAMES = /(header|footer|nav|sidebar|comment|menu|widget|advert|banner|social|share-btn|related|trending|recommend)/i;

function isSkippable(el: Element): boolean {
  const tag = el.tagName;
  if (SKIP_TAGS.has(tag)) return true;
  const className = el.className?.toString() ?? '';
  const id = el.id ?? '';
  if (SKIP_CLASS_NAMES.test(className) || SKIP_CLASS_NAMES.test(id)) return true;
  const role = el.getAttribute('role') ?? '';
  if (/banner|navigation|complementary|contentinfo/i.test(role)) return true;
  // Skip hidden elements
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return true;
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
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.article-content',
    '.entry-content',
    '.news-content',
    '#content',
    '.content',
    '.cg-detail-mainWrap',
    '.new-detailWrap-v3',
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
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
    if (isSkippable(el)) continue;
    if (!hasDirectText(el)) continue;

    const text = el.textContent?.trim();
    if (!text || text.length <= 3) continue;

    const id = `seg_${allSegments.length}`;
    sourceElements.push(el);
    allSegments.push({ id, text });
  }

  return { sourceElements, allSegments };
}
