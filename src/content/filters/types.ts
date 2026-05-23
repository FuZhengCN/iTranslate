// 标准过滤接口类型 — 第三方 filter 实现此接口即可接入

import type { TranslationSegment } from '../../shared/types';

export interface RawSegment {
  id: string;
  text: string;
  blockElement: Element;
  isHeading: boolean;
  leafElements: Element[];
}

export type SkipReason = string;

export interface SkippedRecord {
  segmentId: string;
  text: string;
  reason: SkipReason;
}

export interface FilterResult {
  kept: RawSegment[];
  skipped: SkippedRecord[];
}

export interface SegmentFilter {
  readonly name: string;
  filter(segments: RawSegment[]): FilterResult;
}
