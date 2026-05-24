import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

vi.mock('../retry', () => ({
  sendToBgWithRetry: vi.fn().mockResolvedValue({
    success: true,
    results: [{ id: 'sel_0', original: 'Hello', translated: '你好' }],
    stats: { hits: 0, misses: 1 },
  }),
}));

vi.stubGlobal('chrome', {
  i18n: {
    getMessage: vi.fn().mockImplementation((key: string) => key),
  },
});

let isValidSelection: () => boolean;
let getBubblePosition: (rect: DOMRect) => { top: number; left: number };
let enableSelection: () => void;
let disableSelection: () => void;
let isSelectionEnabled: () => boolean;

beforeEach(async () => {
  // jsdom 不实现 Range.prototype.getBoundingClientRect，而 selection.ts 的
  // onMouseUp 中调用了 sel.getRangeAt(0).getBoundingClientRect()。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Range.prototype as any).getBoundingClientRect = () => new DOMRect(100, 200, 150, 20);

  document.body.innerHTML =
    '<p id="main">Hello world this is a long enough sentence for testing.</p>' +
    '<p class="itranslate-translation">已经翻译过的内容</p>';

  const mod = await import('../selection');
  isValidSelection = mod.isValidSelection;
  getBubblePosition = mod.getBubblePosition;
  enableSelection = mod.enableSelection;
  disableSelection = mod.disableSelection;
  isSelectionEnabled = mod.isSelectionEnabled;
});

afterEach(() => {
  // Clean up listeners
  if (isSelectionEnabled()) disableSelection();
});

describe('isValidSelection', () => {
  it('returns false when there is no selection', () => {
    expect(isValidSelection()).toBe(false);
  });
});

describe('getBubblePosition', () => {
  it('places bubble below selection by default', () => {
    const rect = new DOMRect(100, 200, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.top).toBeGreaterThan(200);
    expect(result.left).toBeGreaterThanOrEqual(0);
  });

  it('shifts above when near the bottom of viewport', () => {
    const nearBottom = window.innerHeight - 30;
    const rect = new DOMRect(100, nearBottom, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.top).toBeLessThan(rect.top);
  });

  it('clamps horizontal position to left edge', () => {
    const rect = new DOMRect(-100, 200, 150, 20);
    const result = getBubblePosition(rect);
    expect(result.left).toBeGreaterThanOrEqual(8);
  });
});

describe('selection ball creation on mouseup', () => {
  it('creates a ball element when text is selected and mouseup fires', async () => {
    enableSelection();

    // Simulate text selection
    const range = document.createRange();
    const textNode = document.getElementById('main')!.firstChild!;
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    window.getSelection()!.addRange(range);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    // Ball is created in setTimeout(fn, 0) — wait for it
    await new Promise(r => setTimeout(r, 10));

    const ball = document.querySelector('.itranslate-selection-ball');
    expect(ball).not.toBeNull();
  });

  it('does not create a ball when there is no valid selection', async () => {
    enableSelection();
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    await new Promise(r => setTimeout(r, 10));

    const ball = document.querySelector('.itranslate-selection-ball');
    expect(ball).toBeNull();
  });
});

describe('selection ball lifecycle', () => {
  it('keeps ball when selection is cleared via selectionchange', async () => {
    enableSelection();

    const range = document.createRange();
    const textNode = document.getElementById('main')!.firstChild!;
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    window.getSelection()!.addRange(range);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 10));

    expect(document.querySelector('.itranslate-selection-ball')).not.toBeNull();

    // Clear selection — ball should persist (browser may clear selection
    // when mouse approaches the ball; we don't want to lose the ball)
    window.getSelection()!.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange', { bubbles: true }));

    expect(document.querySelector('.itranslate-selection-ball')).not.toBeNull();
  });

  it('removes ball when user clicks elsewhere (mouseup without selection)', async () => {
    enableSelection();

    const range = document.createRange();
    const textNode = document.getElementById('main')!.firstChild!;
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    window.getSelection()!.addRange(range);

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 10));

    expect(document.querySelector('.itranslate-selection-ball')).not.toBeNull();

    // Click elsewhere — clear selection and fire mouseup
    window.getSelection()!.removeAllRanges();
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 10));

    expect(document.querySelector('.itranslate-selection-ball')).toBeNull();
  });
});
