import { describe, it, expect, beforeEach } from 'vitest';
import { renderPlaceholders, renderTranslations, removeTranslations } from '../renderer';

describe('renderPlaceholders', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('inserts translating placeholder after each element', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
        <p>More text.</p>
      </main>
    `;

    const elements = document.querySelectorAll('p');
    renderPlaceholders(Array.from(elements));

    const placeholders = document.querySelectorAll('.itranslate-placeholder');
    expect(placeholders).toHaveLength(2);
    // Each placeholder contains 3 bouncing dot spans
    expect(placeholders[0].querySelectorAll('.itranslate-dot')).toHaveLength(3);
    expect(placeholders[1].querySelectorAll('.itranslate-dot')).toHaveLength(3);
  });

  it('does not duplicate placeholder if one already exists', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const el = document.querySelector('p')!;
    renderPlaceholders([el]);
    renderPlaceholders([el]);

    const placeholders = document.querySelectorAll('.itranslate-placeholder');
    expect(placeholders).toHaveLength(1);
  });
});

describe('renderTranslations', () => {
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

  it('replaces placeholder with real translation', () => {
    document.body.innerHTML = `
      <main>
        <p>Hello world.</p>
      </main>
    `;

    const el = document.querySelector('p')!;

    // First show placeholder (three bouncing dots)
    renderPlaceholders([el]);
    const placeholder = document.querySelector('.itranslate-placeholder')!;
    expect(placeholder.querySelectorAll('.itranslate-dot')).toHaveLength(3);
    expect(placeholder.classList.contains('itranslate-placeholder')).toBe(true);

    // Then render real translation
    const results = [
      { id: 'seg_0', original: 'Hello world.', translated: '你好世界。' },
    ];
    renderTranslations(results, [el]);

    // Placeholder should be updated, not duplicated
    const translations = document.querySelectorAll('.itranslate-translation');
    expect(translations).toHaveLength(1);
    expect(translations[0].textContent).toBe('你好世界。');
    expect(translations[0].classList.contains('itranslate-placeholder')).toBe(false);
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
    renderTranslations([{ id: 'seg_0', original: 'Hello world.', translated: '你好世界。' }], [el]);
    expect(document.querySelectorAll('p')).toHaveLength(2);

    renderTranslations([{ id: 'seg_0', original: 'Hello world.', translated: '你好，世界！' }], [el]);
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

describe('removeTranslations', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('removes all translation elements and preserves originals', () => {
    const original = document.createElement('div');
    original.textContent = 'Original text';
    document.body.appendChild(original);

    for (let i = 0; i < 3; i++) {
      const clone = document.createElement('div');
      clone.classList.add('itranslate-translation');
      clone.textContent = `Translation ${i}`;
      document.body.appendChild(clone);
    }

    removeTranslations();

    expect(document.querySelectorAll('.itranslate-translation')).toHaveLength(0);
    expect(document.body.children).toHaveLength(1);
    expect(document.body.children[0].textContent).toBe('Original text');
  });

  it('is safe to call when no translations exist', () => {
    const original = document.createElement('div');
    original.textContent = 'Original text';
    document.body.appendChild(original);

    expect(() => removeTranslations()).not.toThrow();
    expect(document.body.children).toHaveLength(1);
  });
});
