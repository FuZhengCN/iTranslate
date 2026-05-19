import { describe, it, expect, beforeEach } from 'vitest';
import { extractSegments } from '../extractor';

describe('extractor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('extracts text from elements inside main content area', () => {
    document.body.innerHTML = `
      <nav>Navigation</nav>
      <main>
        <h1>Machine Learning</h1>
        <p>Machine learning is a fascinating field.</p>
        <span>Some inline text here.</span>
      </main>
      <footer>Footer content</footer>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);

    expect(texts.some((t) => t.includes('Machine Learning'))).toBe(true);
    expect(texts.some((t) => t.includes('fascinating field'))).toBe(true);
    expect(texts.some((t) => t.includes('inline text'))).toBe(true);
    expect(texts.some((t) => t.includes('Footer'))).toBe(false);
    expect(texts.some((t) => t.includes('Navigation'))).toBe(false);
  });

  it('returns empty array when no content found', () => {
    document.body.innerHTML = '<div></div>';
    const result = extractSegments();
    expect(result.allSegments).toHaveLength(0);
  });

  it('skips script, style, and hidden content', () => {
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

  it('each text-containing element becomes one segment', () => {
    document.body.innerHTML = `
      <main>
        <h1>Title Here</h1>
        <p>First paragraph text.</p>
        <p>Second paragraph with more content.</p>
      </main>
    `;

    const result = extractSegments();
    expect(result.allSegments.length).toBe(3);
    expect(result.sourceElements.length).toBe(3);
  });

  it('falls back to body when no main content area found', () => {
    document.body.innerHTML = `
      <div>
        <p>Some random text without semantic structure.</p>
      </div>
    `;

    const result = extractSegments();
    expect(result.allSegments.length).toBeGreaterThan(0);
  });

  it('skips very short text', () => {
    document.body.innerHTML = `
      <main>
        <span>Hi</span>
        <p>Hello world this is enough text.</p>
      </main>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);
    expect(texts.some((t) => t === 'Hi')).toBe(false);
    expect(texts.some((t) => t.includes('Hello world'))).toBe(true);
  });
});
