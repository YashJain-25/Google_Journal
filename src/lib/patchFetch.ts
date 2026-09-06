// Safeguard against browser/iframe environments where window.fetch has only a getter
(function ensureFetchWritable() {
  if (typeof window === 'undefined') return;

  try {
    let currentFetch = window.fetch ? window.fetch.bind(window) : undefined;
    const proto = Object.getPrototypeOf(window) || Window.prototype;
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch') ||
                 (proto ? Object.getOwnPropertyDescriptor(proto, 'fetch') : undefined);

    if (!desc || !desc.set) {
      Object.defineProperty(window, 'fetch', {
        get() {
          return currentFetch;
        },
        set(newFetch) {
          currentFetch = typeof newFetch === 'function' ? newFetch : currentFetch;
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch (err) {
    // If strict mode or non-configurable prevents redefining on window directly, attempt prototype
    try {
      let currentFetch = window.fetch ? window.fetch.bind(window) : undefined;
      const proto = Object.getPrototypeOf(window) || Window.prototype;
      if (proto) {
        Object.defineProperty(proto, 'fetch', {
          get() {
            return currentFetch;
          },
          set(newFetch) {
            currentFetch = typeof newFetch === 'function' ? newFetch : currentFetch;
          },
          configurable: true,
          enumerable: true,
        });
      }
    } catch {
      // Graceful fallback
    }
  }
})();
