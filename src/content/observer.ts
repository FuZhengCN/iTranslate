type Callback = () => void;

let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function startObserving(root: Element, onNewContent: Callback, debounceMs = 1000): void {
  stopObserving();

  observer = new MutationObserver((mutations) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const addedNodes = mutations.reduce((sum, m) => sum + m.addedNodes.length, 0);
    const removedNodes = mutations.reduce((sum, m) => sum + m.removedNodes.length, 0);
    console.log(`[iTranslate] 👁  Observer: ${mutations.length} mutations (${addedNodes} added, ${removedNodes} removed nodes), debouncing ${debounceMs}ms`);
    debounceTimer = setTimeout(() => {
      console.log('[iTranslate] 👁  Observer debounce fired → firing catch-up callback');
      onNewContent();
    }, debounceMs);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: true,
    attributeFilter: ['class', 'style'],
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
