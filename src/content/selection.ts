import { sendToBgWithRetry } from './retry';

let currentBubble: HTMLElement | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;
const MAX_ORIGINAL_LENGTH = 80;

export function isValidSelection(): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;

  const text = sel.toString().trim();
  if (text.length === 0) return false;

  // Skip if selection is inside an already-translated element
  const range = sel.getRangeAt(0);
  let node: Node | null = range.commonAncestorContainer;
  while (node) {
    if (node instanceof Element && node.classList.contains('itranslate-translation')) {
      return false;
    }
    node = node.parentNode;
  }

  return true;
}

export function getBubblePosition(rect: DOMRect): { top: number; left: number } {
  const GAP = 8;
  const bubbleWidth = 320;
  const bubbleMaxHeight = 200;

  // Default: below selection, horizontally centered
  let top = rect.bottom + GAP + window.scrollY;
  let left = rect.left + rect.width / 2 - bubbleWidth / 2 + window.scrollX;

  // Not enough room below → place above
  if (top + bubbleMaxHeight > window.scrollY + window.innerHeight) {
    top = rect.top - GAP - bubbleMaxHeight + window.scrollY;
    if (top < window.scrollY) top = window.scrollY + GAP;
  }

  // Horizontal boundary clamping
  if (left < window.scrollX + GAP) left = window.scrollX + GAP;
  if (left + bubbleWidth > window.scrollX + window.innerWidth) {
    left = window.scrollX + window.innerWidth - bubbleWidth - GAP;
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

  const bubble = document.createElement('div');
  bubble.className = 'itranslate-selection-bubble';

  const header = document.createElement('div');
  header.className = 'itranslate-bubble-header';

  const original = document.createElement('div');
  original.className = 'itranslate-bubble-original';
  original.textContent = text.length > MAX_ORIGINAL_LENGTH
    ? text.slice(0, MAX_ORIGINAL_LENGTH) + '…'
    : text;

  const translation = document.createElement('div');
  translation.className = 'itranslate-bubble-translation';
  translation.textContent = '翻译中…';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'itranslate-bubble-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble();
  });

  bubble.appendChild(header);
  bubble.appendChild(original);
  bubble.appendChild(translation);
  bubble.appendChild(closeBtn);
  document.body.appendChild(bubble);

  const pos = getBubblePosition(rect);
  bubble.style.top = `${pos.top}px`;
  bubble.style.left = `${pos.left}px`;

  currentBubble = bubble;

  // Reuse background translation pipeline (retry + cache)
  try {
    const response = await sendToBgWithRetry({
      action: 'translate',
      segments: [{ id: 'sel_0', text }],
    });

    if (response?.success && response.results?.[0]) {
      translation.textContent = response.results[0].translated;
    } else {
      translation.textContent = '翻译失败';
    }
  } catch {
    translation.textContent = '翻译失败';
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
  if (e.key === 'Escape') hideBubble();
}

function onDocumentClick(e: MouseEvent): void {
  if (currentBubble && !currentBubble.contains(e.target as Node)) {
    hideBubble();
  }
}

export function initSelection(): void {
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', onDocumentClick);
}
