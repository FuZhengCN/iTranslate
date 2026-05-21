import type { TranslationSegment } from '../shared/types';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME', 'CODE', 'PRE', 'KBD', 'BR', 'HR', 'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'VIDEO', 'AUDIO', 'CANVAS']);
const SKIP_CLASS_NAMES = /(header|footer|nav|sidebar|comment|menu|widget|advert|banner|social|share-btn|related|trending|recommend)/i;

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'SECTION', 'TD', 'TH', 'DD', 'DT', 'FIGCAPTION',
]);

// Minimum combined character count per block before it's worth translating.
// CJK text is denser than Latin — same information fits in far fewer chars.
const MIN_BLOCK_CHARS_CJK = 12;
const MIN_BLOCK_CHARS_LATIN = 20;

function isCJK(code: number): boolean {
  return (code >= 0x4E00 && code <= 0x9FFF)
      || (code >= 0x3400 && code <= 0x4DBF)
      || (code >= 0xF900 && code <= 0xFAFF)
      || (code >= 0x3000 && code <= 0x303F)  // Symbols & Punctuation
      || (code >= 0x3040 && code <= 0x309F)  // Hiragana
      || (code >= 0x30A0 && code <= 0x30FF); // Katakana
}

/** Quick language detection on the first 40 chars of a block. */
function isCJKBlock(text: string): boolean {
  const sample = text.length <= 40 ? text : text.slice(0, 40);
  let cjkCount = 0;
  for (const ch of sample) {
    if (isCJK(ch.codePointAt(0) ?? 0)) cjkCount++;
  }
  return (cjkCount / sample.length) > 0.3;
}

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
  let skippedShort = 0;
  let skippedNoise = 0;

  for (const [block, texts] of blockTexts) {
    const meaningful = texts.filter((t) => !isNoiseText(t));
    if (meaningful.length === 0) {
      skippedNoise++;
      continue;
    }

    const merged = meaningful.join('\n');

    const minChars = isCJKBlock(merged) ? MIN_BLOCK_CHARS_CJK : MIN_BLOCK_CHARS_LATIN;
    if (merged.length < minChars) {
      skippedShort++;
      console.log(`[iTranslate] ⏭  Skipped (too short: ${merged.length} chars, min ${minChars}): "${merged.slice(0, 60)}"`);
      continue;
    }

    const id = `seg_${allSegments.length}`;
    sourceElements.push(block);
    allSegments.push({ id, text: merged });
    console.log(`[iTranslate] 📄 Segment #${allSegments.length - 1} (${merged.length} chars): "${merged.slice(0, 80)}${merged.length > 80 ? '…' : ''}"`);
  }

  console.log(`[iTranslate] ✅ Extracted ${sourceElements.length} blocks from ${allElements.length} elements (${skippedShort} too-short, ${skippedNoise} noise filtered, ${blockTexts.size} total blocks)`);
  return { sourceElements, allSegments };
}
