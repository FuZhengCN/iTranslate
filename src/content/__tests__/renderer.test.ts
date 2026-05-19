import { describe, it, expect, beforeEach } from 'vitest';
import { renderTranslations } from '../renderer';

describe('renderer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('clones original element and inserts translation after it', () => {
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

    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].textContent).toBe('Hello world.');
    expect(paragraphs[1].textContent).toBe('你好世界。');
    expect(paragraphs[1].classList.contains('itranslate-translation')).toBe(true);
  });

  it('clone inherits original element classes and attributes', () => {
    document.body.innerHTML = `
      <main>
        <p class="intro" data-id="123">Hello world.</p>
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

    const clone = document.querySelectorAll('p')[1];
    expect(clone.className).toContain('intro');
    expect(clone.className).toContain('itranslate-translation');
    expect(clone.getAttribute('data-id')).toBe('123');
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

    const clone = document.querySelector('.itranslate-translation')!;
    expect(clone.textContent).toContain('你好。');
    expect(clone.textContent).toContain('世界。');
  });

  it('no badge, label, or decorative elements', () => {
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

    const clone = document.querySelector('.itranslate-translation')!;
    expect(clone.children).toHaveLength(0);
    expect(clone.textContent).not.toContain('DeepSeek');
    expect(clone.textContent).not.toContain('中文');
    expect(document.querySelectorAll('[class*="badge"]').length).toBe(0);
    expect(document.querySelectorAll('.itranslate-group').length).toBe(0);
  });

  it('does not duplicate translation on repeated calls', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const textNode = document.querySelector('p')!.firstChild as Text;
    const sourceGroups = [
      { node: textNode, segments: [{ id: 'seg_0' }] },
    ];

    const results1 = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    // First translation
    renderTranslations(results1, sourceGroups);
    expect(document.querySelectorAll('p')).toHaveLength(2);

    // Second translation with different result — should update, not duplicate
    const results2 = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好，世界！' },
    ];
    renderTranslations(results2, sourceGroups);

    expect(document.querySelectorAll('p')).toHaveLength(2);
    expect(document.querySelector('.itranslate-translation')!.textContent).toBe('你好，世界！');
  });

  it('keeps original element unchanged', () => {
    document.body.innerHTML = `
      <main>
        <p class="intro">Hello world.</p>
      </main>
    `;

    const original = document.querySelector('p')!;
    const textNode = original.firstChild as Text;
    const sourceGroups = [
      { node: textNode, segments: [{ id: 'seg_0' }] },
    ];

    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results, sourceGroups);

    expect(original.textContent).toBe('Hello world.');
    expect(original.classList.contains('itranslate-translation')).toBe(false);
  });
});
