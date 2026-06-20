import { useEffect, useState } from 'react';
import { onServiceWorkerUpdate } from '@/utils/registerServiceWorker';

/** Surfaces a waiting service worker so the UI can offer a refresh. */
export function useServiceWorkerUpdate(): {
  updateReady: boolean;
  applyUpdate: (() => void) | null;
} {
  const [apply, setApply] = useState<(() => void) | null>(null);

  useEffect(() => {
    onServiceWorkerUpdate((fn) => setApply(() => fn));
  }, []);

  return { updateReady: apply !== null, applyUpdate: apply };
}
