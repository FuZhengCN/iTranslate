// 结构化过滤 + 标题豁免（filter-v2 适配）

import type { SegmentFilter, FilterResult, RawSegment, SkippedRecord } from './types';

// 额外结构过滤：叶子元素或其祖先匹配跳过类名（extractor 只检查元素自身）
const SKIP_CLASS_NAMES = /\b(?:header|footer|nav|sidebar|comment|menu|widget|widgets|ad|advert|advertisement|banner|social|share-btn|related|trending|recommend|recommended|avatar|byline|publishTime|time-hidden|property-name|addMore|view-more|load-more|read-more)\b/i;

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'IFRAME',
  'CODE', 'PRE', 'KBD', 'BR', 'HR',
  'IMG', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON',
  'VIDEO', 'AUDIO', 'CANVAS',
]);

function hasSkippableAncestor(el: Element): boolean {
  let current: Element | null = el;
  while (current) {
    if (SKIP_TAGS.has(current.tagName)) return true;
    const className = current.className?.toString() ?? '';
    if (SKIP_CLASS_NAMES.test(className)) return true;
    const id = current.id ?? '';
    if (SKIP_CLASS_NAMES.test(id)) return true;
    current = current.parentElement;
  }
  return false;
}

const NOISE_PATTERNS = [
  /^\d+$/,
  /^\d{1,2}:\d{2}$/,
  /^\d{1,2}-[A-Z][a-z]{2}-\d{4}$/,
  /^COMING UP$/,
  /\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago/i,
];

function isNoiseText(text: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(text));
}

const MIN_NON_HEADING_CHARS = 5;

export const structuredFilter: SegmentFilter = {
  name: 'structured-filter',

  filter(segments: RawSegment[]): FilterResult {
    const kept: RawSegment[] = [];
    const skipped: SkippedRecord[] = [];

    for (const seg of segments) {
      // 额外结构检查：祖先链（extractor 只检查了元素自身）
      if (hasSkippableAncestor(seg.blockElement)) {
        skipped.push({ segmentId: seg.id, text: seg.text, reason: 'structural' });
        continue;
      }

      // 噪音模式
      if (isNoiseText(seg.text)) {
        skipped.push({ segmentId: seg.id, text: seg.text, reason: 'noise-pattern' });
        continue;
      }

      // 标题豁免
      if (seg.isHeading) {
        kept.push(seg);
        continue;
      }

      // 非标题字符数兜底
      if (seg.text.length < MIN_NON_HEADING_CHARS) {
        skipped.push({ segmentId: seg.id, text: seg.text, reason: 'too-short-non-heading' });
        continue;
      }

      kept.push(seg);
    }

    return { kept, skipped };
  },
};
