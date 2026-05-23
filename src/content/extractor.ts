import type { RawSegment } from './filters/types';
import type { TranslationSegment } from '../shared/types';
import { getActiveFilter } from './filters/registry';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME', 'CODE', 'PRE', 'KBD', 'BR', 'HR', 'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'VIDEO', 'AUDIO', 'CANVAS']);
const SKIP_CLASS_NAMES = /\b(?:header|footer|nav|sidebar|comment|menu|widget|widgets|ad|advert|advertisement|banner|social|share-btn|related|trending|recommend|recommended|avatar|byline|publishTime|time-hidden|property-name|addMore|view-more|load-more|read-more)\b/i;

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'SECTION', 'TD', 'TH', 'DD', 'DT', 'FIGCAPTION',
]);

const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

// 叶子级最小字符数：≤3 视为纯噪音，不进入分组（如果 block 祖先为标题则豁免）
const MIN_LEAF_CHARS = 3;

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
  return document.body;
}

export interface ExtractionResult {
  sourceElements: Element[];
  allSegments: TranslationSegment[];
}

// 纯 DOM 提取，产出生段（不做内容过滤）
export function extractRawSegments(root: Element = document.body): RawSegment[] {
  const allElements = root.querySelectorAll('*');
  const blockTexts = new Map<Element, { texts: string[]; leafElements: Element[] }>();
  let skippedLeaf = 0;

  for (const el of allElements) {
    if (!hasDirectText(el)) continue;
    if (isSkippable(el)) continue;
    // 跳过 CSS 隐藏元素（display:none 及其祖先），减少无效 token 消耗
    if ((el as HTMLElement).offsetParent === null) {
      skippedLeaf++;
      continue;
    }

    const text = el.textContent?.trim();
    if (!text || text.length <= MIN_LEAF_CHARS) {
      // 标题豁免：标题元素（或其块级祖先为标题）的短文本不丢弃
      if (!HEADING_TAGS.has(el.tagName) && !HEADING_TAGS.has(findBlockAncestor(el).tagName)) {
        skippedLeaf++;
        continue;
      }
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

  const segments: RawSegment[] = [];
  for (const [block, data] of blockTexts) {
    const merged = data.texts.join('\n');
    const id = `seg_${segments.length}`;
    segments.push({
      id,
      text: merged,
      blockElement: block,
      isHeading: HEADING_TAGS.has(block.tagName),
      leafElements: data.leafElements,
    });
  }

  console.log(`[iTranslate] 📄 Extracted ${segments.length} raw blocks from ${allElements.length} elements (${skippedLeaf} too-short-leaf filtered)`);
  return segments;
}

// 向后兼容：使用活跃过滤器
export function extractSegments(): ExtractionResult {
  const rawSegments = extractRawSegments();
  const filter = getActiveFilter();
  const result = filter.filter(rawSegments);

  const sourceElements: Element[] = [];
  const allSegments: TranslationSegment[] = [];

  for (const seg of result.kept) {
    sourceElements.push(seg.blockElement);
    allSegments.push({ id: seg.id, text: seg.text });
  }

  const skipped = result.skipped.length;
  console.log(`[iTranslate] ✅ Extracted ${sourceElements.length} blocks (${skipped} filtered, ${rawSegments.length} raw blocks)`);
  return { sourceElements, allSegments };
}
