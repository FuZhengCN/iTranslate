import { describe, it, expect, beforeEach } from 'vitest';
import { filterSegments } from '../filter-v2';

describe('filter-v2', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('保留短标题（H2 8字符）', () => {
    document.body.innerHTML = `
      <main>
        <h2>Overview</h2>
        <p>Machine learning is transforming industries worldwide today.</p>
      </main>
    `;

    const result = filterSegments(document.body);
    const texts = result.kept.map((s) => s.text);

    expect(texts).toHaveLength(2);
    expect(texts).toContain('Overview');
    expect(texts).toContain('Machine learning is transforming industries worldwide today.');
  });

  it('过滤小于等于3字符的纯噪音', () => {
    document.body.innerHTML = `
      <main>
        <span>OK</span>
        <span>Go</span>
        <span>1</span>
        <p>A paragraph with enough text to pass the threshold test here.</p>
      </main>
    `;

    const result = filterSegments(document.body);
    const texts = result.kept.map((s) => s.text);

    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain('A paragraph');
  });

  it('过滤噪音模式（时间戳、日期、纯数字）', () => {
    document.body.innerHTML = `
      <main>
        <span>00:14</span>
        <span>20-May-2026</span>
        <span>12345</span>
        <p>Real article content goes here and it is long enough.</p>
      </main>
    `;

    const result = filterSegments(document.body);
    const texts = result.kept.map((s) => s.text);

    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain('Real article');
  });

  it('过滤非标题短于5字符的独立块', () => {
    document.body.innerHTML = `
      <main>
        <div><span>Home</span></div>
        <div><span>News</span></div>
        <p>The quick brown fox jumps over the lazy dog and more text here.</p>
      </main>
    `;

    const result = filterSegments(document.body);
    const texts = result.kept.map((s) => s.text);

    // "Home" and "News" are in div blocks, not headings → <5 chars → skipped
    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain('quick brown fox');
  });

  it('标题豁免：H3 短文本保留', () => {
    document.body.innerHTML = `
      <main>
        <h3>小结</h3>
        <h4>TL;DR</h4>
        <p>This is a full paragraph with sufficient text to be translated correctly here.</p>
      </main>
    `;

    const result = filterSegments(document.body);
    const texts = result.kept.map((s) => s.text);

    expect(texts).toHaveLength(3);
    expect(texts).toContain('小结');
    expect(texts).toContain('TL;DR');
  });

  it('结构过滤：跳过 script、style、导航类名元素', () => {
    document.body.innerHTML = `
      <main>
        <p>Main content text that is definitely long enough.</p>
        <script>console.log("hidden");</script>
        <style>body { color: red; }</style>
        <nav class="navigation"><a>Home</a><a>About</a></nav>
        <div class="sidebar"><span>Related Links</span></div>
      </main>
    `;

    const result = filterSegments(document.body);
    const texts = result.kept.map((s) => s.text);

    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain('Main content');
  });

  it('同一个块内多个文本元素合并', () => {
    document.body.innerHTML = `
      <main>
        <div class="news-info">
          <span class="category">Technology</span>
          <a href="#">AI breakthrough announced today at conference</a>
          <span class="time">updated recently</span>
        </div>
      </main>
    `;

    const result = filterSegments(document.body);
    expect(result.kept.length).toBe(1);
    expect(result.kept[0].text).toContain('Technology');
    expect(result.kept[0].text).toContain('AI breakthrough');
    expect(result.kept[0].text).toContain('updated recently');
  });

  it('空文档返回空结果', () => {
    document.body.innerHTML = '<div></div>';
    const result = filterSegments(document.body);
    expect(result.kept).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('跳过已翻译的元素', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world this is enough text for translation.</p>
        <p class="itranslate-translation">你好世界这是翻译文本。</p>
        <p>Another paragraph with sufficient content length.</p>
      </main>
    `;

    const result = filterSegments(document.body);
    expect(result.kept).toHaveLength(2);
  });

  it('skipped 记录包含跳过原因', () => {
    document.body.innerHTML = `
      <main>
        <span>Go</span>
        <p>A complete sentence that is long enough for translation testing.</p>
      </main>
    `;

    const result = filterSegments(document.body);
    expect(result.skipped.length).toBeGreaterThanOrEqual(1);

    const goRecord = result.skipped.find((r) => r.text === 'Go');
    expect(goRecord).toBeDefined();
    expect(goRecord!.reason).toBe('too-short-leaf');
  });
});
