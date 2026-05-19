import { describe, it, expect, beforeEach } from 'vitest';
import { extractSegments } from '../extractor';

describe('extractor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('extracts text from main content area', () => {
    document.body.innerHTML = `
      <nav>Navigation here</nav>
      <main>
        <p>Machine learning is a fascinating field. It has many applications.</p>
      </main>
      <footer>Footer content</footer>
    `;

    const result = extractSegments();
    const texts = result.allSegments.map((s) => s.text);

    expect(texts.some((t) => t.includes('Machine learning'))).toBe(true);
    expect(texts.some((t) => t.includes('Footer'))).toBe(false);
    expect(texts.some((t) => t.includes('Navigation'))).toBe(false);
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

  it('groups long paragraphs into segments', () => {
    document.body.innerHTML = `
      <main>
        <p>First sentence is here. Second sentence continues. Third sentence goes on. Fourth is long too. Fifth finishes it. Sixth is extra content.</p>
      </main>
    `;

    const result = extractSegments();
    expect(result.allSegments.length).toBeGreaterThanOrEqual(1);
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
});
