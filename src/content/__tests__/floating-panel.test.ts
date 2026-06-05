import { describe, it, expect, beforeEach, vi } from 'vitest';

let createFloatingPanel: (actions: {
  onTranslate: () => void;
  onUndo: () => void;
  onSelectionToggle: (enable: boolean) => void;
}) => void;
let removeFloatingPanel: () => void;
let setTranslateState: (state: 'translate' | 'translating' | 'undo') => void;
let setSelectionState: (enabled: boolean) => void;

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = '';
  const mod = await import('../floating-panel');
  createFloatingPanel = mod.createFloatingPanel;
  removeFloatingPanel = mod.removeFloatingPanel;
  setTranslateState = mod.setTranslateState;
  setSelectionState = mod.setSelectionState;
});

describe('createFloatingPanel', () => {
  it('creates panel with container and two buttons', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);

    const panel = document.querySelector('.itranslate-float-panel');
    expect(panel).not.toBeNull();

    const translateBtn = panel!.querySelector('.itranslate-float-btn-translate');
    expect(translateBtn).not.toBeNull();
    expect(translateBtn!.textContent).toBe('文');

    const selectionBtn = panel!.querySelector('.itranslate-float-btn-selection');
    expect(selectionBtn).not.toBeNull();
    expect(selectionBtn!.textContent).toBe('选');
  });

  it('does not create duplicate panels', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    createFloatingPanel(actions);

    expect(document.querySelectorAll('.itranslate-float-panel').length).toBe(1);
  });

  it('panel has fixed position with right:0', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);

    const panel = document.querySelector('.itranslate-float-panel') as HTMLElement;
    const style = getComputedStyle(panel);
    expect(style.position).toBe('fixed');
    expect(style.right).toBe('0px');
  });
});

describe('setTranslateState', () => {
  it('sets button to "translate" state (glacier blue, 文字)', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translate');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.textContent).toBe('文');
    expect(btn.classList.contains('undo')).toBe(false);
    expect(btn.classList.contains('translating')).toBe(false);
  });

  it('sets button to "translating" state (pulse animation, 三点)', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translating');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.textContent).toBe('...');
    expect(btn.classList.contains('translating')).toBe(true);
  });

  it('sets button to "undo" state (warm terracotta, 撤字)', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('undo');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.textContent).toBe('撤');
    expect(btn.classList.contains('undo')).toBe(true);
  });

  it('ignores "translating" click when in translating state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translating');

    const btn = document.querySelector('.itranslate-float-btn-translate')! as HTMLButtonElement;
    btn.click();

    expect(actions.onTranslate).not.toHaveBeenCalled();
    expect(actions.onUndo).not.toHaveBeenCalled();
  });
});

describe('setSelectionState', () => {
  it('sets selection button to active (filled) state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);

    const btn = document.querySelector('.itranslate-float-btn-selection')!;
    expect(btn.classList.contains('active')).toBe(true);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('sets selection button to inactive (hollow) state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);
    setSelectionState(false);

    const btn = document.querySelector('.itranslate-float-btn-selection')!;
    expect(btn.classList.contains('active')).toBe(false);
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('button click actions', () => {
  it('translate button click calls onTranslate when in translate state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translate');

    const btn = document.querySelector('.itranslate-float-btn-translate')! as HTMLButtonElement;
    btn.click();

    expect(actions.onTranslate).toHaveBeenCalledTimes(1);
    expect(actions.onUndo).not.toHaveBeenCalled();
  });

  it('translate button click calls onUndo when in undo state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('undo');

    const btn = document.querySelector('.itranslate-float-btn-translate')! as HTMLButtonElement;
    btn.click();

    expect(actions.onUndo).toHaveBeenCalledTimes(1);
    expect(actions.onTranslate).not.toHaveBeenCalled();
  });

  it('selection button click calls onSelectionToggle(true) when off', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);

    const btn = document.querySelector('.itranslate-float-btn-selection')! as HTMLButtonElement;
    btn.click();

    expect(actions.onSelectionToggle).toHaveBeenCalledWith(true);
  });

  it('selection button click calls onSelectionToggle(false) when on', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);

    const btn = document.querySelector('.itranslate-float-btn-selection')! as HTMLButtonElement;
    btn.click();

    expect(actions.onSelectionToggle).toHaveBeenCalledWith(false);
  });
});

describe('removeFloatingPanel', () => {
  it('removes panel from DOM', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    removeFloatingPanel();

    expect(document.querySelector('.itranslate-float-panel')).toBeNull();
  });

  it('is safe to call setters before createFloatingPanel', () => {
    // Should not throw when buttons don't exist yet
    expect(() => setTranslateState('translate')).not.toThrow();
    expect(() => setSelectionState(true)).not.toThrow();
  });
});
