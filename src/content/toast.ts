let toastEl: HTMLElement | null = null;
let dots: HTMLElement[] = [];

const DOT_COUNT = 5;

export function showTranslatingToast(): void {
  if (toastEl) return;
  toastEl = document.createElement('div');
  toastEl.className = 'itranslate-toast';

  const dotsHtml = Array.from({ length: DOT_COUNT }, () =>
    '<span class="itranslate-toast-dot"></span>'
  ).join('');

  toastEl.innerHTML = `<div class="itranslate-toast-dots">${dotsHtml}</div>Translating page…`;
  document.body.appendChild(toastEl);

  dots = Array.from(toastEl.querySelectorAll('.itranslate-toast-dot'));
}

export function updateProgress(completed: number, total: number): void {
  if (dots.length === 0) return;
  const litCount = Math.ceil((completed / total) * DOT_COUNT);
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('on', i < litCount);
  }
}

export function hideTranslatingToast(): void {
  if (!toastEl) return;
  toastEl.remove();
  toastEl = null;
  dots = [];
}
