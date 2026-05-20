import type { TranslationSegment } from '../shared/types';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME', 'CODE', 'PRE', 'KBD', 'BR', 'HR', 'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'VIDEO', 'AUDIO', 'CANVAS']);
const SKIP_CLASS_NAMES = /(header|footer|nav|sidebar|comment|menu|widget|advert|banner|social|share-btn|related|trending|recommend)/i;

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'SECTION', 'TD', 'TH', 'DD', 'DT', 'FIGCAPTION',
]);

// Patterns that indicate noise — blocks matching ONLY these are skipped
const NOISE_PATTERNS = [
  /^\d+$/,                          // Pure digits: "1", "NaN"
  /^\d{1,2}:\d{2}$/,               // Timestamps: "00:14"
  /^\d{1,2}-[A-Z][a-z]{2}-\d{4}$/, // Dates: "20-May-2026"
  /^COMING UP$/,                     // Status labels
];

function isNoiseText(text: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(text));
}

function isSkippable(el: Element): boolean {
  const tag = el.tagName;
  if (SKIP_TAGS.has(tag)) return true;
  const className = el.className?.toString() ?? '';
  if (className.includes('itranslate-translation')) return true;
  const id = el.id ?? '';
  if (SKIP_CLASS_NAMES.test(className) || SKIP_CLASS_NAMES.test(id)) return true;
  const role = el.getAttribute('role') ?? '';
  if (/banner|navigation|complementary|contentinfo/i.test(role)) return true;
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

function findBlockAncestor(el: Element): Element {
  let current: Element | null = el;
  while (current) {
    if (BLOCK_TAGS.has(current.tagName)) return current;
    current = current.parentElement;
  }
  return el;
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
    '.cg-detail-mainWrap',
    '.new-detailWrap-v3',
    '.cg-mainWrapper',
    '.g-layout',
    '[class*="home"][class*="container"]',
    '[class*="main"][class*="wrapper"]',
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

  // Collect leaf text elements, grouped by block ancestor
  const blockTexts = new Map<Element, string[]>();

  for (const el of allElements) {
    if (!hasDirectText(el)) continue;
    if (isSkippable(el)) continue;

    const text = el.textContent?.trim();
    if (!text || text.length <= 3) continue;
    if (isNoiseText(text)) continue;

    const block = findBlockAncestor(el);
    const existing = blockTexts.get(block);
    if (existing) {
      existing.push(text);
    } else {
      blockTexts.set(block, [text]);
    }
  }

  // Build segments — one per block
  const sourceElements: Element[] = [];
  const allSegments: TranslationSegment[] = [];

  for (const [block, texts] of blockTexts) {
    const meaningful = texts.filter((t) => !isNoiseText(t));
    if (meaningful.length === 0) continue;

    const merged = meaningful.join('\n');

    // Skip blocks with very short combined text — filters single-word
    // labels, navigation items, and other non-content snippets
    if (merged.length < 20) continue;

    const id = `seg_${allSegments.length}`;
    sourceElements.push(block);
    allSegments.push({ id, text: merged });
  }

  console.log(`[iTranslate] Extracted ${sourceElements.length} blocks from ${allElements.length} elements`);
  return { sourceElements, allSegments };
}
