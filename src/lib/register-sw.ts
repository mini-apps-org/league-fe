// Registered in production only: in dev the worker would cache Vite's module graph and
// serve stale code after an edit.
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      // Installability is a nice-to-have; a failed registration must never break the app.
      console.warn('service worker registration failed', error);
    });
  });
}
