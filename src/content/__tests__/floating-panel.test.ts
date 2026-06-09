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
  vi.stubGlobal('chrome', {
    i18n: {
      getMessage: vi.fn().mockImplementation((key: string) => key),
    },
  });
  document.body.innerHTML = '';
  const mod = await import('../floating-panel');
  createFloatingPanel = mod.createFloatingPanel;
  removeFloatingPanel = mod.removeFloatingPanel;
  setTranslateState = mod.setTranslateState;
  setSelectionState = mod.setSelectionState;
});

describe('createFloatingPanel', () => {
  it('creates panel with translate button, separator, and selection toggle', () => {
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
    expect(translateBtn!.querySelector('svg')).not.toBeNull();

    expect(panel!.querySelector('.itranslate-float-sep')).not.toBeNull();

    const selectionEl = panel!.querySelector('.itranslate-float-selection');
    expect(selectionEl).not.toBeNull();
    expect(selectionEl!.querySelector('.itranslate-float-selection-icon')).not.toBeNull();
    expect(selectionEl!.querySelector('.itranslate-float-toggle')).not.toBeNull();
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
  it('shows translate SVG icon in default state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translate');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.querySelector('svg')).not.toBeNull();
    expect(btn.classList.contains('undo')).toBe(false);
    expect(btn.classList.contains('translating')).toBe(false);
  });

  it('shows "..." and translating class in translating state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('translating');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.innerHTML).toBe('...');
    expect(btn.classList.contains('translating')).toBe(true);
  });

  it('shows undo SVG icon and undo class in undo state', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setTranslateState('undo');

    const btn = document.querySelector('.itranslate-float-btn-translate')!;
    expect(btn.querySelector('svg')).not.toBeNull();
    expect(btn.classList.contains('undo')).toBe(true);
  });

  it('ignores click when in translating state', () => {
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
  it('sets toggle to active and icon stroke to blue', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);

    const toggle = document.querySelector('.itranslate-float-toggle')!;
    expect(toggle.classList.contains('active')).toBe(true);

    const icon = document.querySelector('.itranslate-float-selection-icon')!;
    expect((icon as SVGElement).style.stroke).toBe('var(--itranslate-brand-blue)');
  });

  it('sets toggle to inactive and icon stroke to gray', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);
    setSelectionState(false);

    const toggle = document.querySelector('.itranslate-float-toggle')!;
    expect(toggle.classList.contains('active')).toBe(false);

    const icon = document.querySelector('.itranslate-float-selection-icon')!;
    expect((icon as SVGElement).style.stroke).toBe('#bbb');
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

  it('selection toggle click calls onSelectionToggle(true) when off', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);

    const el = document.querySelector('.itranslate-float-selection')! as HTMLElement;
    el.click();

    expect(actions.onSelectionToggle).toHaveBeenCalledWith(true);
  });

  it('selection toggle click calls onSelectionToggle(false) when on', () => {
    const actions = {
      onTranslate: vi.fn(),
      onUndo: vi.fn(),
      onSelectionToggle: vi.fn(),
    };
    createFloatingPanel(actions);
    setSelectionState(true);

    const el = document.querySelector('.itranslate-float-selection')! as HTMLElement;
    el.click();

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
    expect(() => setTranslateState('translate')).not.toThrow();
    expect(() => setSelectionState(true)).not.toThrow();
  });
});
