import { describe, it, expect, beforeEach } from 'vitest';
import { renderTranslations } from '../renderer';

describe('renderer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('injects translation paragraphs after original text nodes', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const textNode = document.querySelector('p')!.firstChild as Text;
    const sourceGroups = [
      { node: textNode, segments: [{ id: 'seg_0' }] },
    ];

    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results, sourceGroups);

    const translations = document.querySelectorAll('.itranslate-translation');
    expect(translations).toHaveLength(1);
    expect(translations[0].textContent).toBe('你好世界。');
  });

  it('handles multiple segments for one text node', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello. World.</p>
      </main>
    `;

    const textNode = document.querySelector('p')!.firstChild as Text;
    const sourceGroups = [
      { node: textNode, segments: [{ id: 'seg_0' }, { id: 'seg_1' }] },
    ];

    const results = [
      { id: 'seg_0', original: 'Hello.', translated: '你好。' },
      { id: 'seg_1', original: 'World.', translated: '世界。' },
    ];

    renderTranslations(results, sourceGroups);

    const translations = document.querySelectorAll('.itranslate-translation');
    expect(translations).toHaveLength(1);
    expect(translations[0].textContent).toContain('你好。');
    expect(translations[0].textContent).toContain('世界。');
  });

  it('does not inject any badge or label elements', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const textNode = document.querySelector('p')!.firstChild as Text;
    const sourceGroups = [
      { node: textNode, segments: [{ id: 'seg_0' }] },
    ];

    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results, sourceGroups);

    const translation = document.querySelector('.itranslate-translation')!;
    expect(translation.tagName).toBe('P');
    expect(translation.children).toHaveLength(0);
    expect(translation.textContent).not.toContain('DeepSeek');
    expect(translation.textContent).not.toContain('中文');
  });
});
