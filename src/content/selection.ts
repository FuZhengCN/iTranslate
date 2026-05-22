import { sendToBgWithRetry } from './retry';

let currentBubble: HTMLElement | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isPinned = false;
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

function hideBubble(force = false): void {
  if (isPinned && !force) return;
  if (currentBubble) {
    currentBubble.remove();
    currentBubble = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  isPinned = false;
}

async function showBubble(rect: DOMRect, text: string): Promise<void> {
  hideBubble(true);

  // ── Container ──
  const bubble = document.createElement('div');
  bubble.className = 'itranslate-selection-bubble itranslate-translation';

  // ── Purple bar ──
  const bar = document.createElement('div');
  bar.className = 'itranslate-bubble-header';

  // ── Body (translation only) ──
  const body = document.createElement('div');
  body.className = 'itranslate-bubble-body';
  const translation = document.createElement('div');
  translation.className = 'itranslate-bubble-text';
  translation.textContent = '翻译中…';
  body.appendChild(translation);

  // ── Actions bar ──
  const actions = document.createElement('div');
  actions.className = 'itranslate-bubble-actions';

  // Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'itranslate-bubble-btn';
  copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制';
  copyBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(translation.textContent || '');
    copyBtn.innerHTML = '已复制';
    copyBtn.style.color = '#059669';
    copyBtn.style.borderColor = '#a7f3d0';
    setTimeout(() => {
      copyBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 复制';
      copyBtn.style.color = '';
      copyBtn.style.borderColor = '';
    }, 1500);
  });

  // Pin button
  const pinBtn = document.createElement('button');
  pinBtn.className = 'itranslate-bubble-btn';
  pinBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="18 11 12 5 6 11"/></svg> 固定';
  pinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isPinned = !isPinned;
    if (isPinned) {
      pinBtn.classList.add('pinned');
      pinBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="18 11 12 5 6 11"/></svg> 已固定';
    } else {
      pinBtn.classList.remove('pinned');
      pinBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="18 11 12 5 6 11"/></svg> 固定';
    }
  });

  // Spacer
  const spacer = document.createElement('span');
  spacer.style.flex = '1';

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'itranslate-bubble-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble(true);
  });

  actions.appendChild(copyBtn);
  actions.appendChild(pinBtn);
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
      translation.textContent = response.results[0].translated;
      console.log(`[iTranslate] 🔍 Selection translated: "${text.slice(0, 40)}" → "${response.results[0].translated.slice(0, 40)}"`);
    } else {
      translation.textContent = '翻译失败';
      console.warn('[iTranslate] 🔍 Selection translation failed:', response);
    }
  } catch (err) {
    translation.textContent = '翻译失败';
    console.warn('[iTranslate] 🔍 Selection translation error:', err);
  }
}

function onMouseUp(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!isValidSelection()) return;

    const sel = window.getSelection()!;
    const text = sel.toString().trim();
    const rect = sel.getRangeAt(0).getBoundingClientRect();

    showBubble(rect, text);
  }, DEBOUNCE_MS);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') hideBubble(true);
}

function onDocumentClick(e: MouseEvent): void {
  if (currentBubble && !currentBubble.contains(e.target as Node) && !isPinned) {
    hideBubble(true);
  }
}

let selectionEnabled = false;

export function initSelection(): void {
  selectionEnabled = true;
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onDocumentClick);
}

export function enableSelection(): void {
  if (selectionEnabled) return;
  selectionEnabled = true;
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onDocumentClick);
}

export function disableSelection(): void {
  if (!selectionEnabled) return;
  selectionEnabled = false;
  hideBubble();
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('click', onDocumentClick);
}
