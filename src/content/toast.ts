let toastEl: HTMLElement | null = null;

export function showTranslatingToast(): void {
  if (toastEl) return;
  toastEl = document.createElement('div');
  toastEl.className = 'itranslate-toast';
  toastEl.innerHTML = '<span class="itranslate-toast-spinner"></span>Translating page…';
  document.body.appendChild(toastEl);
}

export function hideTranslatingToast(): void {
  if (!toastEl) return;
  toastEl.classList.add('itranslate-toast--hiding');
  const el = toastEl;
  toastEl = null;
  el.addEventListener('animationend', () => el.remove());
}
