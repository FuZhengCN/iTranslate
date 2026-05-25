import { sendToBgWithRetry } from './retry';
import { t } from '../shared/i18n';

let currentBubble: HTMLElement | null = null;
let currentBall: HTMLElement | null = null;
let ballHoverTimer: ReturnType<typeof setTimeout> | null = null;
let dragState: { el: HTMLElement; startX: number; startY: number; startLeft: number; startTop: number } | null = null;

export function isValidSelection(): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;

  const text = sel.toString().trim();
  return text.length > 0;
}

function isSingleWord(text: string): boolean {
  return text.trim().split(/\s+/).length === 1;
}

function isEnglishText(text: string): boolean {
  // Reject if contains CJK, hiragana, katakana, or hangul
  return !/[一-鿿぀-ゟ゠-ヿ가-힯]/.test(text);
}

export function getBubblePosition(rect: DOMRect): { top: number; left: number } {
  const GAP = 8;
  const bubbleWidth = 380;
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

function hideBubble(clearSelection = false): void {
  if (currentBubble) {
    currentBubble.remove();
    currentBubble = null;
  }
  dragState = null;
  if (clearSelection) {
    window.getSelection()?.removeAllRanges();
  }
  removeBall();
}

function removeBall(): void {
  if (ballHoverTimer) {
    clearTimeout(ballHoverTimer);
    ballHoverTimer = null;
  }
  if (currentBall) {
    currentBall.remove();
    currentBall = null;
  }
}

function positionBall(rect: DOMRect): { top: number; left: number } {
  const BALL_SIZE = 12;
  const GAP = 2;

  let top = rect.top - BALL_SIZE - GAP;
  let left = rect.right + GAP;

  // Vertical boundary: don't go above viewport
  if (top < GAP) top = rect.bottom + GAP;

  // Horizontal boundary: don't go past right edge
  if (left + BALL_SIZE > window.innerWidth - GAP) {
    left = rect.left - BALL_SIZE - GAP;
  }
  // Final clamp: don't go past left edge (fallback for full-width selections)
  if (left < GAP) left = GAP;

  return { top, left };
}

function createBall(rect: DOMRect, text: string): HTMLElement {
  removeBall();

  const ball = document.createElement('div');
  ball.className = 'itranslate-selection-ball';
  const pos = positionBall(rect);
  ball.style.top = `${pos.top}px`;
  ball.style.left = `${pos.left}px`;
  ball.dataset.label = t('ballLabel');

  ball.addEventListener('mouseenter', () => {
    if (ballHoverTimer) return;
    // Delay translation so the CSS hover animation (ball enlarge + glow + label)
    // has time to play before the ball is removed
    ballHoverTimer = setTimeout(() => {
      ballHoverTimer = null;
      if (!currentBall) return; // ball was removed by another event (scroll, etc.)
      removeBall();
      const sel = window.getSelection();
      const currentRect = (sel && sel.rangeCount > 0)
        ? sel.getRangeAt(0).getBoundingClientRect()
        : rect;
      showBubble(currentRect, text);
    }, 550);
  });

  document.body.appendChild(ball);
  currentBall = ball;
  return ball;
}

function renderDictionaryResult(body: HTMLElement, jsonStr: string): void {
  try {
    const data = JSON.parse(jsonStr);
    // Word + IPA + POS line
    const headRow = document.createElement('div');
    headRow.className = 'itranslate-dict-head';
    const wordEl = document.createElement('span');
    wordEl.className = 'itranslate-dict-word';
    wordEl.textContent = data.word;
    headRow.appendChild(wordEl);
    if (data.ipa) {
      const ipaEl = document.createElement('span');
      ipaEl.className = 'itranslate-dict-ipa';
      ipaEl.textContent = data.ipa;
      headRow.appendChild(ipaEl);
    }
    if (data.pos) {
      const posEl = document.createElement('span');
      posEl.className = 'itranslate-dict-pos';
      posEl.textContent = data.pos;
      headRow.appendChild(posEl);
    }
    body.appendChild(headRow);

    // Separator
    const sep = document.createElement('div');
    sep.className = 'itranslate-dict-sep';
    body.appendChild(sep);

    // Definitions list
    const list = document.createElement('div');
    list.className = 'itranslate-dict-defs';
    data.definitions.forEach((def: { zh: string }, i: number) => {
      const item = document.createElement('div');
      item.className = 'itranslate-dict-def';
      const num = document.createElement('span');
      num.className = i === 0 ? 'itranslate-dict-num-primary' : 'itranslate-dict-num';
      num.textContent = `${i + 1}.`;
      item.appendChild(num);
      const zh = document.createElement('span');
      zh.className = i === 0 ? 'itranslate-dict-text-primary' : 'itranslate-dict-text';
      zh.textContent = def.zh;
      item.appendChild(zh);
      list.appendChild(item);
    });
    body.appendChild(list);
  } catch {
    const fallback = document.createElement('div');
    fallback.className = 'itranslate-bubble-translation';
    fallback.textContent = jsonStr;
    body.appendChild(fallback);
  }
}

async function showBubble(rect: DOMRect, text: string): Promise<void> {
  hideBubble();

  // ── Container ──
  const bubble = document.createElement('div');
  bubble.className = 'itranslate-selection-bubble itranslate-translation';

  // ── Bar: 4px gradient line ──
  const bar = document.createElement('div');
  bar.className = 'itranslate-bubble-bar';

  // ── Header: brand name (drag handle) ──
  const header = document.createElement('div');
  header.className = 'itranslate-bubble-header';
  const brand = document.createElement('span');
  brand.className = 'itranslate-bubble-brand';
  brand.textContent = t('appName');
  header.appendChild(brand);

  // ── Body ──
  const body = document.createElement('div');
  body.className = 'itranslate-bubble-body';

  // Original text (collapsed with gradient fade for long text)
  const origEl = document.createElement('div');
  origEl.className = 'itranslate-bubble-original';
  origEl.textContent = text;
  body.appendChild(origEl);

  // Loading placeholder in translation area
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
    const translationEl = body.querySelector('.itranslate-bubble-translation');
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

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'itranslate-bubble-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble(true);
  });

  actions.appendChild(copyBtn);
  actions.appendChild(closeBtn);

  // ── Assemble ──
  bubble.appendChild(bar);
  bubble.appendChild(header);
  bubble.appendChild(body);
  bubble.appendChild(actions);
  document.body.appendChild(bubble);

  const pos = getBubblePosition(rect);
  bubble.style.top = `${pos.top}px`;
  bubble.style.left = `${pos.left}px`;

  currentBubble = bubble;

  // Check if original text overflows and needs fade gradient
  if (origEl.scrollHeight > origEl.clientHeight) {
    origEl.classList.add('faded');
  }

  // ── Drag to reposition (bar + header = 28px combined drag area) ──
  const onDragStart = (e: MouseEvent) => {
    dragState = {
      el: bubble,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: bubble.offsetLeft,
      startTop: bubble.offsetTop,
    };
    e.preventDefault();
  };
  bar.addEventListener('mousedown', onDragStart);
  header.addEventListener('mousedown', onDragStart);

  // ── Translation request ──
  const single = isSingleWord(text);
  const english = isEnglishText(text);
  const mode = (single && english) ? 'dictionary' : 'translate';
  console.log(`[iTranslate] 🔀 Mode decision: text="${text.slice(0, 40)}" singleWord=${single} englishText=${english} → ${mode}`);
  try {
    const response = await sendToBgWithRetry({
      action: 'translate',
      segments: [{ id: 'sel_0', text }],
      mode,
    });

    placeholder.remove();

    if (response?.success && response.results?.[0]) {
      if (response.mode === 'dictionary') {
        renderDictionaryResult(body, response.results[0].translated);
      } else {
        const translationEl = document.createElement('div');
        translationEl.className = 'itranslate-bubble-translation';
        translationEl.textContent = response.results[0].translated;
        body.appendChild(translationEl);
      }
      copyBtn.style.display = '';
    } else {
      const errorEl = document.createElement('div');
      errorEl.className = 'itranslate-bubble-translation';
      errorEl.textContent = t('translationFailed');
      body.appendChild(errorEl);
    }
  } catch (err) {
    placeholder.remove();
    const errorEl = document.createElement('div');
    errorEl.className = 'itranslate-bubble-translation';
    errorEl.textContent = t('translationFailed');
    body.appendChild(errorEl);
    console.warn('[iTranslate] 🔍 Selection translation error:', err);
  }
}

function onMouseUp(e: MouseEvent): void {
  // Ignore clicks inside the bubble
  if (currentBubble && currentBubble.contains(e.target as Node)) {
    return;
  }

  // Defer to next tick so getSelection reflects the completed selection
  setTimeout(() => {
    if (!selectionEnabled) return;
    if (!isValidSelection()) {
      removeBall();
      return;
    }

    // Close any existing bubble from a previous selection (don't use hideBubble
    // as it would clear the current selection via removeAllRanges)
    if (currentBubble) {
      currentBubble.remove();
      currentBubble = null;
    }

    const sel = window.getSelection()!;
    const text = sel.toString().trim();
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    console.log(`[iTranslate] 🔍 Selection detected — "${text.slice(0, 50)}"`);
    createBall(rect, text);
  }, 0);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') hideBubble(true);
}

function onSelectionChange(): void {
  // Ball is cleaned up by mouseup (click elsewhere → invalid selection → removeBall),
  // scroll (removeBall), keydown (Escape → hideBubble), or mouseenter (showBubble).
  // Don't remove ball here — browser may clear selection when mouse approaches the
  // ball, which would prevent mouseenter from firing.
}

function onDragMove(e: MouseEvent): void {
  if (!dragState) return;
  dragState.el.style.left = `${dragState.startLeft + e.clientX - dragState.startX}px`;
  dragState.el.style.top = `${dragState.startTop + e.clientY - dragState.startY}px`;
}

function onDragEnd(): void {
  dragState = null;
}

function onScroll(): void {
  if (currentBall) {
    removeBall();
  }
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
  document.addEventListener('selectionchange', onSelectionChange);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
  console.log('[iTranslate] 🔍 enableSelection: done — selectionEnabled=true, listeners attached');
}

export function disableSelection(): void {
  if (!selectionEnabled) {
    console.log('[iTranslate] 🔍 disableSelection: already disabled, skipping');
    return;
  }
  selectionEnabled = false;
  console.log('[iTranslate] 🔍 disableSelection: removing bubble, ball, style, and listeners');
  hideBubble(true);
  removeBall();
  removeSelectionStyle();
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('selectionchange', onSelectionChange);
  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
  console.log('[iTranslate] 🔍 disableSelection: done — selectionEnabled=false');
}
