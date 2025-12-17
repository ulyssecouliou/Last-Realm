// Comprehensive ResizeObserver error suppression
if (typeof window !== 'undefined') {
  // Store original methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('ResizeObserver loop completed') ||
      message.includes('ResizeObserver loop limit exceeded')
    ) {
      return; // Suppress ResizeObserver errors
    }
    originalError.apply(console, args);
  };

  // Override console.warn for ResizeObserver warnings
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('ResizeObserver')) {
      return; // Suppress ResizeObserver warnings
    }
    originalWarn.apply(console, args);
  };

  // Handle window error events
  window.addEventListener('error', (e) => {
    if (
      e.message?.includes('ResizeObserver loop completed') ||
      e.message?.includes('ResizeObserver loop limit exceeded') ||
      e.message?.includes('ResizeObserver')
    ) {
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
    if (
      e.reason?.message?.includes('ResizeObserver') ||
      e.reason?.toString()?.includes('ResizeObserver')
    ) {
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
