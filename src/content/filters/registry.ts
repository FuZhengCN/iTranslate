// 过滤器注册与选择 — 纯内存 Map，无持久化依赖

import type { SegmentFilter } from './types';

const filters = new Map<string, SegmentFilter>();
let activeName = '';

export function registerFilter(filter: SegmentFilter): void {
  filters.set(filter.name, filter);
}

export function getFilter(name: string): SegmentFilter | undefined {
  return filters.get(name);
}

export function listFilters(): SegmentFilter[] {
  return [...filters.values()];
}

export function setActiveFilter(name: string): void {
  if (!filters.has(name)) {
    console.warn(`[filter-registry] filter "${name}" not registered, keeping current`);
    return;
  }
  activeName = name;
}

export function getActiveFilter(): SegmentFilter {
  if (activeName && filters.has(activeName)) {
    return filters.get(activeName)!;
  }
  const first = listFilters()[0];
  if (!first) throw new Error('[filter-registry] no filters registered');
  return first;
}
