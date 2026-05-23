// 过滤器模块统一入口

import { extractRawSegments, type ExtractionResult } from '../extractor';
import { registerFilter, getActiveFilter } from './registry';
import { defaultFilter } from './default-filter';
import { structuredFilter } from './structured-filter';

// 注册内建过滤器
registerFilter(defaultFilter);
registerFilter(structuredFilter);

// 选择过滤器（代码常量，默认 v2）
import { setActiveFilter } from './registry';
setActiveFilter('structured-filter');

export { registerFilter, getFilter, listFilters, setActiveFilter, getActiveFilter } from './registry';
export { defaultFilter } from './default-filter';
export { structuredFilter } from './structured-filter';
export type { SegmentFilter, FilterResult, RawSegment, SkippedRecord, SkipReason } from './types';

function toExtractionResult(result: { kept: { id: string; text: string; blockElement: Element }[] }): ExtractionResult {
  return {
    sourceElements: result.kept.map(s => s.blockElement),
    allSegments: result.kept.map(s => ({ id: s.id, text: s.text })),
  };
}

export function extractSegments(): ExtractionResult {
  const rawSegments = extractRawSegments();
  const filter = getActiveFilter();
  const result = filter.filter(rawSegments);
  return toExtractionResult(result);
}
