import { describe, it, expect, beforeEach } from 'vitest';
import { renderTranslations } from '../renderer';

describe('renderer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('injects translation cards after original text nodes', () => {
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

    const cards = document.querySelectorAll('.itranslate-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].textContent).toContain('你好世界。');
    expect(cards[0].textContent).toContain('中文');
    expect(cards[0].textContent).toContain('DeepSeek');
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

    const cards = document.querySelectorAll('.itranslate-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].textContent).toContain('你好。');
    expect(cards[0].textContent).toContain('世界。');
  });
});
