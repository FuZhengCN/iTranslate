// filter-v2.ts — 结构化过滤 + 标题豁免（实验模块）
// 自包含，不依赖现有 content script 模块

// --- Types (自包含，避免交叉依赖) ---

interface TranslationSegment {
  id: string;
  text: string;
}

type SkipReason = 'too-short-leaf' | 'noise-pattern' | 'too-short-non-heading' | 'structural';

interface SkippedRecord {
  element: Element;
  text: string;
  reason: SkipReason;
}

interface FilterResult {
  kept: TranslationSegment[];
  keptElements: Element[];
  skipped: SkippedRecord[];
}

// --- Constants ---

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME',
  'CODE', 'PRE', 'KBD', 'BR', 'HR',
  'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON',
  'VIDEO', 'AUDIO', 'CANVAS',
]);

const SKIP_CLASS_NAMES = /(header|footer|nav|sidebar|comment|menu|widget|advert|banner|social|share-btn|related|trending|recommend)/i;

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'SECTION', 'TD', 'TH', 'DD', 'DT', 'FIGCAPTION',
]);

const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

const NOISE_PATTERNS = [
  /^\d+$/,
  /^\d{1,2}:\d{2}$/,
  /^\d{1,2}-[A-Z][a-z]{2}-\d{4}$/,
  /^COMING UP$/,
];

const MIN_LEAF_CHARS = 3;
const MIN_NON_HEADING_CHARS = 5;

// --- Helpers ---

function isNoiseText(text: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(text));
}

function isSkippable(el: Element): boolean {
  let current: Element | null = el;
  while (current) {
    const tag = current.tagName;
    if (SKIP_TAGS.has(tag)) return true;
    const className = current.className?.toString() ?? '';
    if (className.includes('itranslate-translation')) return true;
    const id = current.id ?? '';
    if (SKIP_CLASS_NAMES.test(className) || SKIP_CLASS_NAMES.test(id)) return true;
    const role = current.getAttribute('role') ?? '';
    if (/banner|navigation|complementary|contentinfo/i.test(role)) return true;
    if (current.hasAttribute('hidden') || current.getAttribute('aria-hidden') === 'true') return true;
    current = current.parentElement;
  }
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

// --- Main ---

export function filterSegments(root: Element): FilterResult {
  const allElements = root.querySelectorAll('*');
  const blockTexts = new Map<Element, { texts: string[]; leafElements: Element[] }>();
  const skipped: SkippedRecord[] = [];

  // Phase 1: collect leaf text elements, grouped by block ancestor
  for (const el of allElements) {
    if (!hasDirectText(el)) continue;
    if (isSkippable(el)) {
      skipped.push({ element: el, text: el.textContent?.trim() ?? '', reason: 'structural' });
      continue;
    }

    const text = el.textContent?.trim();
    if (!text || text.length <= MIN_LEAF_CHARS) {
      // 标题豁免：标题元素（或其块级祖先为标题）的短文本不应被过滤
      if (!HEADING_TAGS.has(el.tagName) && !HEADING_TAGS.has(findBlockAncestor(el).tagName)) {
        skipped.push({ element: el, text: text ?? '', reason: 'too-short-leaf' });
        continue;
      }
    }
    if (isNoiseText(text)) {
      skipped.push({ element: el, text, reason: 'noise-pattern' });
      continue;
    }

    const block = findBlockAncestor(el);
    const existing = blockTexts.get(block);
    if (existing) {
      existing.texts.push(text);
      existing.leafElements.push(el);
    } else {
      blockTexts.set(block, { texts: [text], leafElements: [el] });
    }
  }

  // Phase 2: per-block filtering and segment construction
  const kept: TranslationSegment[] = [];
  const keptElements: Element[] = [];

  for (const [block, data] of blockTexts) {
    const merged = data.texts.join('\n');
    const isHeading = HEADING_TAGS.has(block.tagName);

    if (!isHeading && merged.length < MIN_NON_HEADING_CHARS) {
      for (const leaf of data.leafElements) {
        skipped.push({ element: leaf, text: leaf.textContent?.trim() ?? '', reason: 'too-short-non-heading' });
      }
      continue;
    }

    const id = `seg_${kept.length}`;
    kept.push({ id, text: merged });
    keptElements.push(block);
  }

  return { kept, keptElements, skipped };
}

// --- Visualization (debug only) ---

const KEPT_CLASS = 'itranslate-filter-v2-kept';
const SKIPPED_CLASS = 'itranslate-filter-v2-skipped';

function injectVisualStyles(): void {
  if (document.getElementById('itranslate-filter-v2-styles')) return;
  const style = document.createElement('style');
  style.id = 'itranslate-filter-v2-styles';
  style.textContent = `
    .${KEPT_CLASS} {
      outline: 2px solid rgba(34,197,94,0.7) !important;
      background: rgba(34,197,94,0.08) !important;
    }
    .${SKIPPED_CLASS} {
      outline: 2px solid rgba(239,68,68,0.7) !important;
      background: rgba(239,68,68,0.08) !important;
    }
  `;
  document.head.appendChild(style);
}

function visualize(result: FilterResult): void {
  injectVisualStyles();
  for (const el of result.keptElements) {
    el.classList.add(KEPT_CLASS);
  }
  for (const record of result.skipped) {
    record.element.classList.add(SKIPPED_CLASS);
  }
}

function clearVisuals(): void {
  for (const el of document.querySelectorAll(`.${KEPT_CLASS}`)) {
    el.classList.remove(KEPT_CLASS);
  }
  for (const el of document.querySelectorAll(`.${SKIPPED_CLASS}`)) {
    el.classList.remove(SKIPPED_CLASS);
  }
  const styleTag = document.getElementById('itranslate-filter-v2-styles');
  styleTag?.remove();
}

function runDebug(): void {
  clearVisuals();
  const result = filterSegments(document.body);
  console.log(
    `[filter-v2] kept=${result.kept.length}, skipped=${result.skipped.length}`,
    result
  );
  visualize(result);
}

// Expose to window (content script only)
(window as any).__itranslateFilterV2 = {
  run: runDebug,
  clear: clearVisuals,
};
