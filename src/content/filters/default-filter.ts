// 旧 CJK/Latin 字符数阈值过滤器（extractor 原有逻辑）

import type { SegmentFilter, FilterResult, RawSegment, SkippedRecord } from './types';

function isCJK(code: number): boolean {
  return (code >= 0x4E00 && code <= 0x9FFF)
      || (code >= 0x3400 && code <= 0x4DBF)
      || (code >= 0xF900 && code <= 0xFAFF)
      || (code >= 0x3000 && code <= 0x303F)
      || (code >= 0x3040 && code <= 0x309F)
      || (code >= 0x30A0 && code <= 0x30FF);
}

function isCJKBlock(text: string): boolean {
  const sample = text.length <= 40 ? text : text.slice(0, 40);
  let cjkCount = 0;
  for (const ch of sample) {
    if (isCJK(ch.codePointAt(0) ?? 0)) cjkCount++;
  }
  return (cjkCount / sample.length) > 0.3;
}

const NOISE_PATTERNS = [
  /^\d+$/,
  /^\d{1,2}:\d{2}$/,
  /^\d{1,2}-[A-Z][a-z]{2}-\d{4}$/,
  /^COMING UP$/,
];

function isNoiseText(text: string): boolean {
  return NOISE_PATTERNS.some((p) => p.test(text));
}

const MIN_BLOCK_CHARS_CJK = 12;
const MIN_BLOCK_CHARS_LATIN = 20;

export const defaultFilter: SegmentFilter = {
  name: 'default-filter',

  filter(segments: RawSegment[]): FilterResult {
    const kept: RawSegment[] = [];
    const skipped: SkippedRecord[] = [];

    for (const seg of segments) {
      if (isNoiseText(seg.text)) {
        skipped.push({ segmentId: seg.id, text: seg.text, reason: 'noise-pattern' });
        continue;
      }

      const minChars = isCJKBlock(seg.text) ? MIN_BLOCK_CHARS_CJK : MIN_BLOCK_CHARS_LATIN;
      if (seg.text.length < minChars) {
        skipped.push({ segmentId: seg.id, text: seg.text, reason: 'too-short' });
        continue;
      }

      kept.push(seg);
    }

    return { kept, skipped };
  },
};
