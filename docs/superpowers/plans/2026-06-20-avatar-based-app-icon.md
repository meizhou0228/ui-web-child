# Avatar-Based PWA App Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the installed PWA home-screen icon match the child's selected 头像 by generating the manifest + apple-touch icons at runtime from the avatar PNG.

**Architecture:** A `src/utils/appIcon.ts` module exposes a canvas compositor, a pure manifest builder, and a DOM link-swapper. A `useAppIcon()` hook runs the load→compose→build→apply pipeline whenever `child.icon` changes and revokes the previous blob URL. `App.tsx` calls the hook. Static `/pwa-icons/*` remain the fallback.

**Tech Stack:** React 18 + TypeScript, Zustand, Canvas 2D, Blob/object URLs, Vitest + Testing Library.

---

## Task 1: appIcon utilities (manifest builder + link swapper)

The pure manifest builder and the DOM link-swapper are unit-testable in jsdom; the canvas compositor includes a guard for the no-context case.

**Files:**
- Create: `src/utils/appIcon.ts`
- Test: `src/utils/__tests__/appIcon.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/__tests__/appIcon.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { buildIconManifest, applyAppIcon } from '@/utils/appIcon';

describe('buildIconManifest', () => {
  it('embeds the given icon data URLs with maskable purpose', () => {
    const m = buildIconManifest('data:image/png;base64,AAA', 'data:image/png;base64,BBB') as {
      name: string;
      icons: { src: string; sizes: string; type: string; purpose: string }[];
    };
    expect(m.name).toBe('宝宝积分小屋');
    expect(m.icons).toHaveLength(2);
    expect(m.icons[0]).toEqual({
      src: 'data:image/png;base64,AAA', sizes: '192x192', type: 'image/png', purpose: 'any maskable',
    });
    expect(m.icons[1]).toEqual({
      src: 'data:image/png;base64,BBB', sizes: '512x512', type: 'image/png', purpose: 'any maskable',
    });
  });
});

describe('applyAppIcon', () => {
  beforeEach(() => {
    document.head.innerHTML = '<link rel="manifest" href="/manifest.webmanifest" />';
  });

  it('swaps the manifest href and creates the apple-touch-icon link', () => {
    applyAppIcon({ manifestUrl: 'blob:fake-manifest', appleTouchUrl: 'data:image/png;base64,CCC' });

    const manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    const apple = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    expect(manifest.getAttribute('href')).toBe('blob:fake-manifest');
    expect(apple).not.toBeNull();
    expect(apple.getAttribute('href')).toBe('data:image/png;base64,CCC');
  });

  it('reuses an existing apple-touch-icon link', () => {
    document.head.innerHTML +=
      '<link rel="apple-touch-icon" href="/pwa-icons/apple-touch-icon.png" />';
    applyAppIcon({ manifestUrl: 'blob:m2', appleTouchUrl: 'data:image/png;base64,DDD' });
    const apples = document.querySelectorAll('link[rel="apple-touch-icon"]');
    expect(apples).toHaveLength(1);
    expect((apples[0] as HTMLLinkElement).getAttribute('href')).toBe('data:image/png;base64,DDD');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/utils/__tests__/appIcon.test.ts`
Expected: FAIL — cannot find module `@/utils/appIcon`.

- [ ] **Step 3: Implement the module**

Create `src/utils/appIcon.ts`:

```ts
/** Solid background behind the avatar; matches manifest background_color. */
export const ICON_BG = '#FEF3C7';
/** Avatar occupies this fraction of the canvas (keeps it inside the maskable safe zone). */
const SAFE_RATIO = 0.64;

/**
 * Draw the avatar centered on a solid background and return a PNG data URL.
 * Returns '' when a 2D context is unavailable (non-browser env).
 */
export function composeIcon(img: HTMLImageElement, size: number, bg: string = ICON_BG): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  const inner = size * SAFE_RATIO;
  const offset = (size - inner) / 2;
  ctx.drawImage(img, offset, offset, inner, inner);
  return canvas.toDataURL('image/png');
}

/** Build the web-manifest object with the given icon data URLs. Pure. */
export function buildIconManifest(icon192: string, icon512: string): object {
  return {
    name: '宝宝积分小屋',
    short_name: '积分小屋',
    description: '给大班宝宝使用的离线习惯打分和奖励小应用。',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FEF3C7',
    theme_color: '#7DD3FC',
    lang: 'zh-CN',
    icons: [
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
}

/** Point the manifest + apple-touch-icon links at the generated icons. */
export function applyAppIcon(opts: { manifestUrl: string; appleTouchUrl: string }): void {
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest) manifest.setAttribute('href', opts.manifestUrl);

  let apple = document.querySelector('link[rel="apple-touch-icon"]');
  if (!apple) {
    apple = document.createElement('link');
    apple.setAttribute('rel', 'apple-touch-icon');
    document.head.appendChild(apple);
  }
  apple.setAttribute('href', opts.appleTouchUrl);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/utils/__tests__/appIcon.test.ts`
Expected: PASS — all three tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/appIcon.ts src/utils/__tests__/appIcon.test.ts
git commit -m "feat: add appIcon manifest builder and link swapper"
```

---

## Task 2: useAppIcon hook

Orchestrates the pipeline and reacts to avatar changes, revoking the previous blob URL.

**Files:**
- Create: `src/hooks/useAppIcon.ts`

- [ ] **Step 1: Implement the hook**

Create `src/hooks/useAppIcon.ts`:

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAppIcon.ts
git commit -m "feat: add useAppIcon hook to sync icon with avatar"
```

---

## Task 3: Wire the hook into App

**Files:**
- Modify: `src/App.tsx:7,15`

- [ ] **Step 1: Import and call the hook**

In `src/App.tsx`, add the import after the `useBootstrap` import:

```ts
import { useAppIcon } from '@/hooks/useAppIcon';
```

Then call it inside `App`, directly after `useBootstrap();`:

```tsx
  useBootstrap();
  useAppIcon();
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open the app, go to 设置 → 宝宝, switch the avatar. Open
DevTools → Application → Manifest and confirm the icon preview updates to the new
avatar. (For a real home-screen test, run `npm run build && npm run preview` over
HTTPS and add to home screen before/after selecting the avatar.)

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: apply avatar-based app icon on load"
```

---

## Task 4: Full verification

- [ ] **Step 1: Run the whole suite and typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: all tests PASS, no type errors.

- [ ] **Step 2: Production build sanity**

Run: `npm run build`
Expected: build succeeds, `dist/` produced.
