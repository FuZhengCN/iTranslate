import { describe, it, expect } from 'vitest';
import { structuredFilter } from '../../filters/structured-filter';
import type { RawSegment } from '../../filters/types';

function makeSeg(text: string, isHeading = false): RawSegment {
  const el = document.createElement(isHeading ? 'h2' : 'div');
  return {
    id: `seg_0`,
    text,
    blockElement: el,
    isHeading,
    leafElements: [el],
  };
}

function makeSegWithClass(text: string, className: string): RawSegment {
  const el = document.createElement('div');
  el.className = className;
  return {
    id: `seg_0`,
    text,
    blockElement: el,
    isHeading: false,
    leafElements: [el],
  };
}

describe('structured-filter', () => {
  it('保留短标题（H2 8字符）', () => {
    const result = structuredFilter.filter([
      makeSeg('Overview', true),
      makeSeg('Machine learning is transforming industries worldwide today.', false),
    ]);
    expect(result.kept).toHaveLength(2);
  });

  it('非标题短文本不再按字符数过滤', () => {
    const result = structuredFilter.filter([
      makeSeg('Home', false),
      makeSeg('News', false),
      makeSeg('The quick brown fox jumps over the lazy dog and more text.', false),
    ]);
    expect(result.kept).toHaveLength(3);
  });

  it('过滤噪音模式（时间戳、日期、纯数字、相对时间）', () => {
    const result = structuredFilter.filter([
      makeSeg('00:14', false),
      makeSeg('20-May-2026', false),
      makeSeg('12345', false),
      makeSeg('COMING UP', false),
      makeSeg('3 hours ago', false),
      makeSeg('Real article content goes here and it is long enough.', false),
    ]);
    expect(result.kept).toHaveLength(1);
    expect(result.kept[0].text).toContain('Real article');
    expect(result.skipped.filter((r) => r.reason === 'noise-pattern')).toHaveLength(5);
  });

  it('标题豁免：H1-H6 短文本保留（2-4字符）', () => {
    const h1 = document.createElement('h1');
    const h6 = document.createElement('h6');
    const result = structuredFilter.filter([
      { id: 'seg_0', text: '主标题', blockElement: h1, isHeading: true, leafElements: [h1] },
      { id: 'seg_1', text: '小结', blockElement: document.createElement('h3'), isHeading: true, leafElements: [document.createElement('h3')] },
      { id: 'seg_2', text: 'TL;DR', blockElement: document.createElement('h4'), isHeading: true, leafElements: [document.createElement('h4')] },
      { id: 'seg_3', text: '底注', blockElement: h6, isHeading: true, leafElements: [h6] },
      makeSeg('This is a full paragraph with sufficient text to be translated.', false),
    ]);
    expect(result.kept).toHaveLength(5);
    expect(result.kept.map((s) => s.text)).toContain('主标题');
    expect(result.kept.map((s) => s.text)).toContain('小结');
    expect(result.kept.map((s) => s.text)).toContain('TL;DR');
    expect(result.kept.map((s) => s.text)).toContain('底注');
  });

  it('结构过滤：导航/侧栏类名容器', () => {
    const result = structuredFilter.filter([
      makeSegWithClass('Home Navigation', 'nav'),
      makeSegWithClass('Related Links', 'sidebar'),
      makeSeg('Main content text that is definitely long enough.', false),
    ]);
    expect(result.kept).toHaveLength(1);
    expect(result.kept[0].text).toContain('Main content');
    const structural = result.skipped.filter((r) => r.reason === 'structural');
    expect(structural).toHaveLength(2);
    expect(structural[0].reason).toBe('structural');
    expect(structural[1].reason).toBe('structural');
  });

  it('过滤祖先链上的 itranslate-translation 元素', () => {
    // extractor 的 isSkippable() 只检查元素自身 class，不检查祖先。
    // 划词泡泡等子元素自身没有 itranslate-translation class，需由 filter 层
    // hasSkippableAncestor 沿祖先链补刀，防止翻译内容被二次翻译。
    const parent = document.createElement('div');
    parent.className = 'itranslate-translation';
    const child = document.createElement('span');
    child.textContent = 'Should be filtered';
    parent.appendChild(child);
    const result = structuredFilter.filter([
      { id: 'seg_0', text: 'Should be filtered', blockElement: child, isHeading: false, leafElements: [child] },
      makeSeg('Hello world this is enough text for translation.', false),
    ]);
    expect(result.kept).toHaveLength(1);
    expect(result.kept[0].text).toContain('Hello world');
  });

  it('空数组返回空结果', () => {
    const result = structuredFilter.filter([]);
    expect(result.kept).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('skipped 记录包含 segmentId、text、reason', () => {
    const result = structuredFilter.filter([
      makeSeg('12345', false),
      makeSeg('A complete sentence that is long enough for translation testing.', false),
    ]);
    expect(result.skipped.length).toBeGreaterThanOrEqual(1);
    const record = result.skipped.find((r) => r.text === '12345');
    expect(record).toBeDefined();
    expect(record!.reason).toBe('noise-pattern');
    expect(record!.segmentId).toBeDefined();
  });
});
