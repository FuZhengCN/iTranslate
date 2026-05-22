import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../retry', () => ({
  sendToBgWithRetry: vi.fn().mockResolvedValue({
    success: true,
    results: [{ id: 'sel_0', original: 'Hello', translated: '你好' }],
    stats: { hits: 0, misses: 1 },
  }),
}));

let isValidSelection: () => boolean;
let getBubblePosition: (rect: DOMRect) => { top: number; left: number };

beforeEach(async () => {
  document.body.innerHTML =
    '<p id="main">Hello world this is a long enough sentence for testing.</p>' +
    '<p class="itranslate-translation">已经翻译过的内容</p>';

  const mod = await import('../selection');
  isValidSelection = mod.isValidSelection;
  getBubblePosition = mod.getBubblePosition;
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
