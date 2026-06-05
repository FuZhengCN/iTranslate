interface PanelActions {
  onTranslate: () => void;
  onUndo: () => void;
  onSelectionToggle: (enable: boolean) => void;
}

const SVG_TRANSLATE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>';
const SVG_UNDO = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h10a5 5 0 0 1 0 10H9"/><path d="M7 6l-4 4 4 4"/></svg>';
const SVG_SELECTION = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="itranslate-float-selection-icon"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>';

let panelEl: HTMLElement | null = null;
let translateBtn: HTMLButtonElement | null = null;
let translateState: 'translate' | 'translating' | 'undo' = 'translate';

export function createFloatingPanel(actions: PanelActions): void {
  if (panelEl) return;

  panelEl = document.createElement('div');
  panelEl.className = 'itranslate-float-panel';
  // Inline for jsdom test compatibility — styles.css also sets these values.
  panelEl.style.position = 'fixed';
  panelEl.style.right = '0';

  // ── Translate action button ──
  translateBtn = document.createElement('button');
  translateBtn.className = 'itranslate-float-btn-translate';
  translateBtn.innerHTML = SVG_TRANSLATE;
  translateBtn.title = '翻译此页';
  translateBtn.setAttribute('aria-label', 'Translate page');
  translateBtn.addEventListener('click', () => {
    if (translateState === 'translating') return;
    if (translateState === 'undo') {
      actions.onUndo();
    } else {
      actions.onTranslate();
    }
  });
  panelEl.appendChild(translateBtn);

  // ── Separator ──
  const sep = document.createElement('div');
  sep.className = 'itranslate-float-sep';
  panelEl.appendChild(sep);

  // ── Selection toggle: icon + mini switch ──
  const selectionEl = document.createElement('div');
  selectionEl.className = 'itranslate-float-selection';
  selectionEl.title = '划词翻译';
  selectionEl.setAttribute('aria-label', 'Toggle selection translation');
  selectionEl.setAttribute('tabindex', '0');
  selectionEl.innerHTML = SVG_SELECTION;

  const toggleEl = document.createElement('div');
  toggleEl.className = 'itranslate-float-toggle';
  const knob = document.createElement('div');
  knob.className = 'itranslate-float-toggle-knob';
  toggleEl.appendChild(knob);
  selectionEl.appendChild(toggleEl);

  selectionEl.addEventListener('click', () => {
    const enabling = !toggleEl.classList.contains('active');
    actions.onSelectionToggle(enabling);
  });

  panelEl.appendChild(selectionEl);

  document.body.appendChild(panelEl);
}

export function removeFloatingPanel(): void {
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
    translateBtn = null;
  }
}

export function setTranslateState(state: 'translate' | 'translating' | 'undo'): void {
  translateState = state;
  if (!translateBtn) return;
  translateBtn.classList.remove('translating', 'undo');
  if (state === 'translating') {
    translateBtn.classList.add('translating');
    translateBtn.innerHTML = '...';
  } else if (state === 'undo') {
    translateBtn.classList.add('undo');
    translateBtn.innerHTML = SVG_UNDO;
  } else {
    translateBtn.innerHTML = SVG_TRANSLATE;
  }
}

export function setSelectionState(enabled: boolean): void {
  if (!panelEl) return;
  const toggle = panelEl.querySelector('.itranslate-float-toggle');
  const icon = panelEl.querySelector('.itranslate-float-selection-icon');
  if (toggle) toggle.classList.toggle('active', enabled);
  if (icon) icon.setAttribute('stroke', enabled ? '#6BAECF' : '#bbb');
}
