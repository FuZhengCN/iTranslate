// 过滤调试可视化（仅 dev）
// 用法：开发时在 manifest.json 中新增 content_scripts 条目加载此文件，
//       或在控制台中动态 import。生产构建不应包含此文件。
//
// 页面控制台 API：
//   __itranslateFilterV2.run()    — 执行过滤 + 绿色/红色高亮
//   __itranslateFilterV2.clear()  — 清除所有高亮

import { extractRawSegments } from '../extractor';
import { getActiveFilter, listFilters } from './registry';
import type { FilterResult, RawSegment } from './types';

const KEPT_CLASS = 'itranslate-filter-v2-kept';
const SKIPPED_CLASS = 'itranslate-filter-v2-skipped';

function injectVisualStyles(): void {
  if (document.getElementById('itranslate-filter-v2-styles')) return;
  const style = document.createElement('style');
  style.id = 'itranslate-filter-v2-styles';
  style.textContent = `
    .${KEPT_CLASS} {
      outline: 2px solid var(--itranslate-debug-kept-outline) !important;
      background: var(--itranslate-debug-kept-bg) !important;
    }
    .${SKIPPED_CLASS} {
      outline: 2px solid var(--itranslate-debug-skipped-outline) !important;
      background: var(--itranslate-debug-skipped-bg) !important;
    }
  `;
  document.head.appendChild(style);
}

function visualize(result: FilterResult, rawSegments: RawSegment[]): void {
  injectVisualStyles();
  for (const seg of result.kept) {
    seg.blockElement.classList.add(KEPT_CLASS);
  }
  for (const record of result.skipped) {
    const raw = rawSegments.find((s) => s.id === record.segmentId);
    if (raw) {
      for (const leaf of raw.leafElements) {
        leaf.classList.add(SKIPPED_CLASS);
      }
    }
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
  const rawSegments = extractRawSegments();
  const activeFilter = getActiveFilter();
  const result = activeFilter.filter(rawSegments);

  const filters = listFilters().map((f) => f.name === activeFilter.name ? `${f.name} (active)` : f.name).join(', ');
  console.log(
    `[filter-v2] filter=${activeFilter.name} | available=[${filters}] | kept=${result.kept.length}, skipped=${result.skipped.length}`,
    result,
  );
  visualize(result, rawSegments);
}

// 通过 <script> 标签注入到页面上下文，用户可直接在控制台调用
// 若页面 CSP 阻止则静默失败，备选：控制台下拉框切到扩展上下文
document.addEventListener('itranslate-filter-v2-run', () => runDebug());
document.addEventListener('itranslate-filter-v2-clear', () => clearVisuals());

const s = document.createElement('script');
s.textContent =
  'window.__itranslateFilterV2={' +
  'run(){document.dispatchEvent(new CustomEvent("itranslate-filter-v2-run"))},' +
  'clear(){document.dispatchEvent(new CustomEvent("itranslate-filter-v2-clear"))}' +
  '};';
document.head.appendChild(s);
