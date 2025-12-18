// Comprehensive ResizeObserver error suppression
if (typeof window !== 'undefined') {
  // Store original methods
  const originalError = console.error;
  const originalWarn = console.warn;

  const isResizeObserverNoise = (value) => {
    try {
      const msg = (value?.message || value)?.toString?.() || '';
      return (
        msg.includes('ResizeObserver loop completed') ||
        msg.includes('ResizeObserver loop limit exceeded') ||
        msg.includes('ResizeObserver loop completed with undelivered notifications') ||
        msg.includes('ResizeObserver')
      );
    } catch (e) {
      return false;
    }
  };

  // Override console.error
  console.error = (...args) => {
    if (args.some(isResizeObserverNoise)) {
      return; // Suppress ResizeObserver errors
    }
    originalError.apply(console, args);
  };

  // Override console.warn for ResizeObserver warnings
  console.warn = (...args) => {
    if (args.some(isResizeObserverNoise)) {
      return; // Suppress ResizeObserver warnings
    }
    originalWarn.apply(console, args);
  };

  // Handle window error events
  window.addEventListener('error', (e) => {
    if (isResizeObserverNoise(e?.message) || isResizeObserverNoise(e?.error)) {
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    if (isResizeObserverNoise(e?.reason)) {
      e.preventDefault();
      return false;
    }
  });

  // Monkey patch ResizeObserver to prevent loops
  if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;
    
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback) {
        const wrappedCallback = (entries, observer) => {
          try {
            // Use requestAnimationFrame to prevent loops
            requestAnimationFrame(() => {
              callback(entries, observer);
            });
          } catch (error) {
            if (!error.message?.includes('ResizeObserver')) {
              throw error;
            }
          }
        };
        super(wrappedCallback);
      }
    };
  }
}

// Export for potential use
export const suppressResizeObserverErrors = () => {
  // This function is called automatically when the module is imported
};
