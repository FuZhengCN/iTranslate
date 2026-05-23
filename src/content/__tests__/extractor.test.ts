import { describe, it, expect, beforeEach } from 'vitest';
import { extractSegments } from '../extractor';
import '../filters/index';

describe('extractor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('groups text elements by block ancestor', () => {
    document.body.innerHTML = `
      <main>
        <p>Machine Learning is everywhere now.</p>
        <p>Deep learning transforms many industries.</p>
      </main>
    `;

    const result = extractSegments();
    // Each <p> is its own block with enough text (> 5 chars for structured-filter)
    expect(result.allSegments.length).toBe(2);
    expect(result.sourceElements.length).toBe(2);
  });

  it('短文本非标题块不再被过滤', () => {
    document.body.innerHTML = `
      <main>
        <div><span>Open</span></div>
        <div><span>Site</span></div>
        <p>Machine learning is transforming industries worldwide.</p>
      </main>
    `;

    const result = extractSegments();
    // 移除 MIN_NON_HEADING_CHARS 后，所有块都会被保留
    expect(result.allSegments.length).toBe(3);
  });

  it('merges multiple text elements inside the same block', () => {
    document.body.innerHTML = `
      <main>
        <div class="news-info">
          <span class="category">Space</span>
          <a href="#">China-Europe SMILE satellite mission launched</a>
          <span class="time">updated recently</span>
        </div>
      </main>
    `;

    const result = extractSegments();
    // All 3 elements are inside the same <div> block → merged
    expect(result.allSegments.length).toBe(1);
    expect(result.allSegments[0].text).toContain('Space');
    expect(result.allSegments[0].text).toContain('SMILE');
    expect(result.allSegments[0].text).toContain('updated recently');
  });

  it('filters out timestamp and date noise', () => {
    document.body.innerHTML = `
      <main>
        <div><span>00:14</span></div>
        <div><span>20-May-2026</span></div>
        <p>Real article title here</p>
      </main>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);

    // Noise-only blocks should be skipped; real content stays
    // Each noise span is in its own block so isNoiseText can match individually
    expect(texts.some((t) => t.includes('00:14'))).toBe(false);
    expect(texts.some((t) => t.includes('20-May-2026'))).toBe(false);
    expect(texts.some((t) => t.includes('Real article'))).toBe(true);
  });

  it('filters out pure digit strings', () => {
    document.body.innerHTML = `
      <main>
        <span>1</span>
        <span>NaN</span>
        <p>Hello world this is enough text to pass.</p>
      </main>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);
    expect(texts.some((t) => t === '1')).toBe(false);
    expect(texts.some((t) => t === 'NaN')).toBe(false);
    expect(texts.some((t) => t.includes('Hello world'))).toBe(true);
  });

  it('skips already-translated blocks on repeated extraction', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world, this is a long enough sentence.</p>
        <p class="itranslate-translation">你好世界，这是一个足够长的句子。</p>
        <p>More text content that must be translated here.</p>
        <p class="itranslate-translation">更多需要翻译的文本内容。</p>
      </main>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);
    expect(texts).toHaveLength(2);
    expect(texts[0]).toContain('Hello world');
    expect(texts[1]).toContain('More text');
  });

  it('returns empty array when no content found', () => {
    document.body.innerHTML = '<div></div>';
    const result = extractSegments();
    expect(result.allSegments).toHaveLength(0);
  });

  it('skips script and style content', () => {
    document.body.innerHTML = `
      <main>
        <p>Visible text here that is long enough.</p>
        <script>console.log("not text");</script>
        <style>body { color: red; }</style>
      </main>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);
    expect(texts).toHaveLength(1);
    expect(texts[0]).toContain('Visible text');
  });
});
