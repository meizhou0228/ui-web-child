import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { composeIcon, buildIconManifest, applyAppIcon } from '@/utils/appIcon';

/**
 * Regenerate the PWA manifest + apple-touch icons from the selected avatar.
 * Runs on mount and whenever child.icon changes. No-op on any failure so the
 * static /pwa-icons fallback stays in place. Note: an already-installed
 * home-screen icon is frozen by the OS and will not change until reinstall.
 */
export function useAppIcon(): void {
  const icon = useStore((s) => s.child.icon);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.src = `/assets/icons/child/${icon}.png`;
    img.onload = () => {
      if (cancelled) return;
      const icon192 = composeIcon(img, 192);
      const icon512 = composeIcon(img, 512);
      const apple = composeIcon(img, 180);
      if (!icon192 || !icon512) return; // no canvas context

      const manifest = buildIconManifest(icon192, icon512);
      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
      const manifestUrl = URL.createObjectURL(blob);

      applyAppIcon({ manifestUrl, appleTouchUrl: apple });

      if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
      prevUrl.current = manifestUrl;
    };
    img.onerror = () => { /* keep static fallback */ };

    return () => { cancelled = true; };
  }, [icon]);
}
