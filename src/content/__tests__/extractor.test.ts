import { describe, it, expect, beforeEach } from 'vitest';
import { extractSegments } from '../extractor';

describe('extractor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('groups text elements by block ancestor', () => {
    document.body.innerHTML = `
      <main>
        <p>Machine Learning</p>
        <p>Machine learning is a fascinating field.</p>
      </main>
    `;

    const result = extractSegments();
    // Each <p> is its own block
    expect(result.allSegments.length).toBe(2);
    expect(result.sourceElements.length).toBe(2);
  });

  it('merges multiple text elements inside the same block', () => {
    document.body.innerHTML = `
      <main>
        <div class="news-info">
          <span class="category">Space</span>
          <a href="#">China-Europe SMILE satellite mission launched</a>
          <span class="time">18 hours ago</span>
        </div>
      </main>
    `;

    const result = extractSegments();
    // All 3 elements are inside the same <div> block → merged
    expect(result.allSegments.length).toBe(1);
    expect(result.allSegments[0].text).toContain('Space');
    expect(result.allSegments[0].text).toContain('SMILE');
    expect(result.allSegments[0].text).toContain('18 hours ago');
  });

  it('filters out timestamp and date noise', () => {
    document.body.innerHTML = `
      <main>
        <div>
          <span>00:14</span>
          <span>20-May-2026</span>
        </div>
        <p>Real article title here</p>
      </main>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);

    // Noise-only blocks should be skipped; real content stays
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
        <p>Hello world.</p>
        <p class="itranslate-translation">你好世界。</p>
        <p>More text.</p>
        <p class="itranslate-translation">更多文本。</p>
      </main>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);
    expect(texts).toHaveLength(2);
    expect(texts).toContain('Hello world.');
    expect(texts).toContain('More text.');
  });

  it('returns empty array when no content found', () => {
    document.body.innerHTML = '<div></div>';
    const result = extractSegments();
    expect(result.allSegments).toHaveLength(0);
  });

  it('skips script and style content', () => {
    document.body.innerHTML = `
      <main>
        <p>Visible text here.</p>
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
