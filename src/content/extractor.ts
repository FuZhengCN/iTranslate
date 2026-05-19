import { isProbablyReaderable } from '@mozilla/readability';
import type { TranslationSegment } from '../shared/types';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME', 'CODE', 'PRE', 'KBD', 'NAV', 'FOOTER', 'HEADER', 'ASIDE']);
const SKIP_CLASS_NAMES = /(header|footer|nav|sidebar|comment|menu|widget|advert|banner)/i;

function isSkippable(el: Element): boolean {
  const tag = el.tagName;
  if (SKIP_TAGS.has(tag)) return true;
  const className = el.className?.toString() ?? '';
  const id = el.id ?? '';
  if (SKIP_CLASS_NAMES.test(className) || SKIP_CLASS_NAMES.test(id)) return true;
  const role = el.getAttribute('role') ?? '';
  if (/banner|navigation|complementary|contentinfo/i.test(role)) return true;
  return false;
}

function findContentRoot(): Element {
  if (isProbablyReaderable(document)) {
    const selectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '#content',
      '.content',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
  }
  return document.body;
}

interface TextChunk {
  node: Text;
  text: string;
}

function collectTextNodes(root: Element): TextChunk[] {
  const chunks: TextChunk[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Text): number {
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      let parent: Node | null = node.parentElement;
      while (parent) {
        if (parent instanceof Element && isSkippable(parent)) {
          return NodeFilter.FILTER_REJECT;
        }
        parent = parent.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent?.trim();
    if (text && text.length > 3) {
      chunks.push({ node, text });
    }
  }
  return chunks;
}

function groupIntoSegments(chunks: TextChunk[]): { node: Text; segments: TranslationSegment[] }[] {
  const result: { node: Text; segments: TranslationSegment[] }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const { node, text } = chunks[i];
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g);

    if (!sentences || sentences.length <= 3) {
      result.push({
        node,
        segments: [{ id: `seg_${i}`, text }],
      });
    } else {
      const grouped: TranslationSegment[] = [];
      let segIndex = 0;
      for (let j = 0; j < sentences.length; j += 3) {
        const group = sentences.slice(j, j + 3).join('').trim();
        grouped.push({ id: `seg_${i}_${segIndex++}`, text: group });
      }
      result.push({ node, segments: grouped });
    }
  }

  return result;
}

export interface ExtractionResult {
  sourceGroups: { node: Text; segments: TranslationSegment[] }[];
  allSegments: TranslationSegment[];
}

export function extractSegments(): ExtractionResult {
  const root = findContentRoot();
  const chunks = collectTextNodes(root);
  const sourceGroups = groupIntoSegments(chunks);

  const allSegments = sourceGroups.flatMap((g) => g.segments);
  return { sourceGroups, allSegments };
}
