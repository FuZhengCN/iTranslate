import { describe, it, expect, beforeEach } from 'vitest';
import { renderTranslations } from '../renderer';

describe('renderer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('clones element and inserts translation after it', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const el = document.querySelector('p')!;
    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results, [el]);

    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0].textContent).toBe('Hello world.');
    expect(paragraphs[1].textContent).toBe('你好世界。');
    expect(paragraphs[1].classList.contains('itranslate-translation')).toBe(true);
  });

  it('clones inline elements directly', () => {
    document.body.innerHTML = `
      <main>
        <p><span>inline text</span></p>
      </main>
    `;

    const span = document.querySelector('span')!;
    const results = [
      { id: 'seg_0', original: 'inline text', translated: '内联文本' },
    ];

    renderTranslations(results, [span]);

    const spans = document.querySelectorAll('span');
    expect(spans).toHaveLength(2);
    expect(spans[1].textContent).toBe('内联文本');
    expect(spans[1].classList.contains('itranslate-translation')).toBe(true);
  });

  it('clone inherits original element classes and attributes', () => {
    document.body.innerHTML = `
      <main>
        <div class="intro" data-id="123">Hello world.</div>
      </main>
    `;

    const el = document.querySelector('div')!;
    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results, [el]);

    const clone = document.querySelector('.itranslate-translation')!;
    expect(clone.className).toContain('intro');
    expect(clone.getAttribute('data-id')).toBe('123');
  });

  it('does not duplicate translation on repeated calls', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const el = document.querySelector('p')!;
    const results1 = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results1, [el]);
    expect(document.querySelectorAll('p')).toHaveLength(2);

    const results2 = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好，世界！' },
    ];
    renderTranslations(results2, [el]);

    expect(document.querySelectorAll('p')).toHaveLength(2);
    expect(document.querySelector('.itranslate-translation')!.textContent).toBe('你好，世界！');
  });

  it('no badge, label, or decorative elements', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const el = document.querySelector('p')!;
    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results, [el]);

    const clone = document.querySelector('.itranslate-translation')!;
    expect(clone.children).toHaveLength(0);
    expect(clone.textContent).not.toContain('DeepSeek');
    expect(clone.textContent).not.toContain('中文');
    expect(document.querySelectorAll('[class*="badge"]').length).toBe(0);
  });

  it('keeps original element unchanged', () => {
    document.body.innerHTML = `
      <main>
        <p class="intro">Hello world.</p>
      </main>
    `;

    const original = document.querySelector('p')!;
    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];

    renderTranslations(results, [original]);

    expect(original.textContent).toBe('Hello world.');
    expect(original.classList.contains('itranslate-translation')).toBe(false);
  });
});
