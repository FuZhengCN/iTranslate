interface PanelActions {
  onTranslate: () => void;
  onUndo: () => void;
  onSelectionToggle: (enable: boolean) => void;
}

let panelEl: HTMLElement | null = null;
let translateBtn: HTMLButtonElement | null = null;
let selectionBtn: HTMLButtonElement | null = null;
let translateState: 'translate' | 'translating' | 'undo' = 'translate';

export function createFloatingPanel(actions: PanelActions): void {
  if (panelEl) return;

  panelEl = document.createElement('div');
  panelEl.className = 'itranslate-float-panel';
  // Inline for jsdom test compatibility — styles.css also sets these values.
  panelEl.style.position = 'fixed';
  panelEl.style.right = '0';

  // Translate button (top)
  translateBtn = document.createElement('button');
  translateBtn.className = 'itranslate-float-btn-translate';
  translateBtn.textContent = '文';
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

  // Selection toggle button (bottom)
  selectionBtn = document.createElement('button');
  selectionBtn.className = 'itranslate-float-btn-selection';
  selectionBtn.textContent = '选';
  selectionBtn.title = '划词翻译';
  selectionBtn.setAttribute('aria-label', 'Toggle selection translation');
  selectionBtn.setAttribute('aria-pressed', 'false');
  selectionBtn.addEventListener('click', () => {
    if (!selectionBtn) return;
    const enabling = !selectionBtn.classList.contains('active');
    actions.onSelectionToggle(enabling);
  });
  panelEl.appendChild(selectionBtn);

  document.body.appendChild(panelEl);
}

export function removeFloatingPanel(): void {
  if (panelEl) {
    panelEl.remove();
    panelEl = null;
    translateBtn = null;
    selectionBtn = null;
  }
}

export function setTranslateState(state: 'translate' | 'translating' | 'undo'): void {
  translateState = state;
  if (!translateBtn) return;
  translateBtn.classList.remove('translating', 'undo');
  if (state === 'translating') {
    translateBtn.classList.add('translating');
    translateBtn.textContent = '...';
  } else if (state === 'undo') {
    translateBtn.classList.add('undo');
    translateBtn.textContent = '撤';
  } else {
    translateBtn.textContent = '文';
  }
}

export function setSelectionState(enabled: boolean): void {
  if (!selectionBtn) return;
  selectionBtn.classList.toggle('active', enabled);
  selectionBtn.setAttribute('aria-pressed', String(enabled));
}
