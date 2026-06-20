import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';

/** Top banner shown when a new app version is waiting to activate. */
export function UpdatePrompt() {
  const { updateReady, applyUpdate } = useServiceWorkerUpdate();
  if (!updateReady) return null;

  return (
    <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <button
        onClick={() => applyUpdate?.()}
        className="pointer-events-auto px-4 py-2 rounded-big bg-sky-brand text-white text-sm font-bold shadow-3d"
      >
        发现新版本，点击刷新 🔄
      </button>
    </div>
  );
}
