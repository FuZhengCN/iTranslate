import { describe, it, expect, beforeEach } from 'vitest';
import { renderTranslations } from '../renderer';

describe('renderer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('wraps original element and translation in a group container', () => {
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

    const groups = document.querySelectorAll('.itranslate-group');
    expect(groups).toHaveLength(1);

    const group = groups[0];
    const original = group.querySelector('p:not(.itranslate-translation)');
    expect(original).not.toBeNull();
    expect(original!.textContent).toContain('Hello world.');

    const translation = group.querySelector('.itranslate-translation');
    expect(translation).not.toBeNull();
    expect(translation!.textContent).toBe('你好世界。');
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

    const translation = document.querySelector('.itranslate-translation')!;
    expect(translation.textContent).toContain('你好。');
    expect(translation.textContent).toContain('世界。');
  });

  it('has no badge, label, or decorative elements', () => {
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

    const group = document.querySelector('.itranslate-group')!;
    expect(group.children).toHaveLength(2); // original p + translation p
    expect(group.textContent).not.toContain('DeepSeek');
    expect(group.textContent).not.toContain('中文');
    expect(group.querySelectorAll('[class*="badge"]').length).toBe(0);
  });

  it('preserves original element attributes and structure', () => {
    document.body.innerHTML = `
      <main>
        <p class="intro" data-id="123">Hello world.</p>
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

    const wrappedOriginal = document.querySelector('.itranslate-group p:not(.itranslate-translation)')!;
    expect(wrappedOriginal.className).toBe('intro');
    expect(wrappedOriginal.getAttribute('data-id')).toBe('123');
  });
});
