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

  it('过滤非标题短于5字符的独立块', () => {
    const result = structuredFilter.filter([
      makeSeg('Home', false),
      makeSeg('News', false),
      makeSeg('The quick brown fox jumps over the lazy dog and more text.', false),
    ]);
    expect(result.kept).toHaveLength(1);
    expect(result.kept[0].text).toContain('quick brown fox');
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
      makeSegWithClass('Home', 'navigation'),
      makeSegWithClass('Related Links', 'sidebar'),
      makeSeg('Main content text that is definitely long enough.', false),
    ]);
    expect(result.kept).toHaveLength(1);
    expect(result.kept[0].text).toContain('Main content');
    const structural = result.skipped.filter((r) => r.reason === 'structural');
    expect(structural).toHaveLength(2);
  });

  it('已翻译元素由 extractor 层处理（filter 层不重复检查 itranslate-translation）', () => {
    // itranslate-translation 在 extractor 的 isSkippable() 中已被过滤，
    // 不会到达 filter 层。filter 仅检查祖先链上的 SKIP_CLASS_NAMES。
    const el = document.createElement('p');
    el.className = 'itranslate-translation';
    const result = structuredFilter.filter([
      { id: 'seg_0', text: '你好世界这是翻译文本。', blockElement: el, isHeading: false, leafElements: [el] },
      makeSeg('Hello world this is enough text for translation.', false),
    ]);
    // 两个都保留 — itranslate-translation 不是 SKIP_CLASS_NAMES 关键词
    expect(result.kept).toHaveLength(2);
  });

  it('空数组返回空结果', () => {
    const result = structuredFilter.filter([]);
    expect(result.kept).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('skipped 记录包含 segmentId、text、reason', () => {
    const result = structuredFilter.filter([
      makeSeg('Go', false),
      makeSeg('A complete sentence that is long enough for translation testing.', false),
    ]);
    expect(result.skipped.length).toBeGreaterThanOrEqual(1);
    const record = result.skipped.find((r) => r.text === 'Go');
    expect(record).toBeDefined();
    expect(record!.reason).toBe('too-short-non-heading');
    expect(record!.segmentId).toBeDefined();
  });
});
