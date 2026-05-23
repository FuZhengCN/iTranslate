import { sendToBgWithRetry } from './retry';
import { t } from '../shared/i18n';

let currentBubble: HTMLElement | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;

export function isValidSelection(): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;

  const text = sel.toString().trim();
  return text.length > 0;
}

export function getBubblePosition(rect: DOMRect): { top: number; left: number } {
  const GAP = 8;
  const bubbleWidth = 320;
  const bubbleMaxHeight = 200;

  // Default: below selection, horizontally centered (viewport-relative for position:fixed)
  let top = rect.bottom + GAP;
  let left = rect.left + rect.width / 2 - bubbleWidth / 2;

  // Not enough room below → place above (viewport-relative)
  if (top + bubbleMaxHeight > window.innerHeight) {
    top = rect.top - GAP - bubbleMaxHeight;
    if (top < GAP) top = GAP;
  }

  // Horizontal boundary clamping (viewport-relative)
  if (left < GAP) left = GAP;
  if (left + bubbleWidth > window.innerWidth) {
    left = window.innerWidth - bubbleWidth - GAP;
  }

  return { top, left };
}

function hideBubble(): void {
  if (currentBubble) {
    currentBubble.remove();
    currentBubble = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

async function showBubble(rect: DOMRect, text: string): Promise<void> {
  hideBubble();

  // ── Container ──
  const bubble = document.createElement('div');
  bubble.className = 'itranslate-selection-bubble itranslate-translation';

  // ── Header bar ──
  const bar = document.createElement('div');
  bar.className = 'itranslate-bubble-header';

  // ── Body ──
  const body = document.createElement('div');
  body.className = 'itranslate-bubble-body';

  // Loading: 3-dot animation (reuses global .itranslate-placeholder .itranslate-dot styles)
  const placeholder = document.createElement('div');
  placeholder.className = 'itranslate-placeholder';
  placeholder.innerHTML = '<span class="itranslate-dot"></span><span class="itranslate-dot"></span><span class="itranslate-dot"></span>';
  body.appendChild(placeholder);

  // ── Actions bar ──
  const actions = document.createElement('div');
  actions.className = 'itranslate-bubble-actions';

  // Copy button (hidden during loading)
  const copyBtn = document.createElement('button');
  copyBtn.className = 'itranslate-bubble-btn';
  const copyIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> ';
  copyBtn.innerHTML = copyIcon + t('copy');
  copyBtn.style.display = 'none';
  copyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const translationEl = body.querySelector('.itranslate-bubble-text');
    await navigator.clipboard.writeText(translationEl?.textContent || '');
    copyBtn.innerHTML = t('copied');
    copyBtn.style.color = 'var(--itranslate-copy-success-text)';
    copyBtn.style.borderColor = 'var(--itranslate-copy-success-border)';
    setTimeout(() => {
      copyBtn.innerHTML = copyIcon + t('copy');
      copyBtn.style.color = '';
      copyBtn.style.borderColor = '';
    }, 1500);
  });

  const spacer = document.createElement('span');
  spacer.style.flex = '1';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'itranslate-bubble-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble();
  });

  actions.appendChild(copyBtn);
  actions.appendChild(spacer);
  actions.appendChild(closeBtn);

  // ── Assemble ──
  bubble.appendChild(bar);
  bubble.appendChild(body);
  bubble.appendChild(actions);
  document.body.appendChild(bubble);

  const pos = getBubblePosition(rect);
  bubble.style.top = `${pos.top}px`;
  bubble.style.left = `${pos.left}px`;

  currentBubble = bubble;

  // ── Translation request ──
  try {
    const response = await sendToBgWithRetry({
      action: 'translate',
      segments: [{ id: 'sel_0', text }],
    });

    if (response?.success && response.results?.[0]) {
      // Replace loading dots with translation text
      placeholder.remove();
      const translationEl = document.createElement('div');
      translationEl.className = 'itranslate-bubble-text';
      translationEl.textContent = response.results[0].translated;
      body.appendChild(translationEl);
      copyBtn.style.display = '';
      console.log(`[iTranslate] 🔍 Selection translated: "${text.slice(0, 40)}" → "${response.results[0].translated.slice(0, 40)}"`);
    } else {
      placeholder.remove();
      const errorEl = document.createElement('div');
      errorEl.className = 'itranslate-bubble-text';
      errorEl.textContent = t('translationFailed');
      body.appendChild(errorEl);
      console.warn('[iTranslate] 🔍 Selection translation failed:', response);
    }
  } catch (err) {
    placeholder.remove();
    const errorEl = document.createElement('div');
    errorEl.className = 'itranslate-bubble-text';
    errorEl.textContent = t('translationFailed');
    body.appendChild(errorEl);
    console.warn('[iTranslate] 🔍 Selection translation error:', err);
  }
}

function onMouseUp(e: MouseEvent): void {
  // Ignore clicks inside the bubble (user interacting with buttons)
  if (currentBubble && currentBubble.contains(e.target as Node)) {
    console.log('[iTranslate] 🔍 onMouseUp: click inside bubble, ignoring');
    return;
  }

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!isValidSelection()) {
      console.log('[iTranslate] 🔍 onMouseUp: no valid selection after debounce');
      return;
    }

    const sel = window.getSelection()!;
    const text = sel.toString().trim();
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    console.log(`[iTranslate] 🔍 onMouseUp: selection detected — "${text.slice(0, 50)}" (${text.length} chars)`);

    showBubble(rect, text);
  }, DEBOUNCE_MS);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') hideBubble();
}

let selectionEnabled = false;

export function isSelectionEnabled(): boolean {
  return selectionEnabled;
}

// initSelection() removed — use enableSelection() instead

let selectionStyle: HTMLStyleElement | null = null;

function injectSelectionStyle(): void {
  if (selectionStyle) return;
  selectionStyle = document.createElement('style');
  selectionStyle.textContent = '::selection{background:var(--itranslate-accent-selection)} ::-moz-selection{background:var(--itranslate-accent-selection)}';
  document.head.appendChild(selectionStyle);
}

function removeSelectionStyle(): void {
  if (selectionStyle) {
    selectionStyle.remove();
    selectionStyle = null;
  }
}

export function enableSelection(): void {
  if (selectionEnabled) {
    console.log('[iTranslate] 🔍 enableSelection: already enabled, skipping');
    return;
  }
  selectionEnabled = true;
  console.log('[iTranslate] 🔍 enableSelection: injecting selection style + adding listeners');
  injectSelectionStyle();
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
  console.log('[iTranslate] 🔍 enableSelection: done — selectionEnabled=true, listeners attached');
}

export function disableSelection(): void {
  if (!selectionEnabled) {
    console.log('[iTranslate] 🔍 disableSelection: already disabled, skipping');
    return;
  }
  selectionEnabled = false;
  console.log('[iTranslate] 🔍 disableSelection: removing bubble, style, and listeners');
  hideBubble();
  removeSelectionStyle();
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('keydown', onKeyDown);
  console.log('[iTranslate] 🔍 disableSelection: done — selectionEnabled=false');
}
