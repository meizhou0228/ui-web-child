type UpdateListener = (apply: () => void) => void;

let listener: UpdateListener | null = null;
let pendingApply: (() => void) | null = null;

/** Subscribe to "a new version is waiting". Fires immediately if one is already pending. */
export function onServiceWorkerUpdate(fn: UpdateListener): void {
  listener = fn;
  if (pendingApply) fn(pendingApply);
}

function notify(worker: ServiceWorker): void {
  const apply = () => worker.postMessage({ type: 'SKIP_WAITING' });
  pendingApply = apply;
  listener?.(apply);
}

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener('load', async () => {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return; // skip first-install claim
      reloaded = true;
      window.location.reload();
    });

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');

      if (reg.waiting && navigator.serviceWorker.controller) {
        notify(reg.waiting);
      }

      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            notify(installing);
          }
        });
      });

      reg.update();
    } catch (error) {
      console.warn('Service worker registration failed', error);
    }
  });
}
