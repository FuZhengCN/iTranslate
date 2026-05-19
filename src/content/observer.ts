type Callback = () => void;

let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function startObserving(root: Element, onNewContent: Callback, debounceMs = 1000): void {
  stopObserving();

  observer = new MutationObserver((_mutations) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onNewContent();
    }, debounceMs);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false,
  });
}

export function stopObserving(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
