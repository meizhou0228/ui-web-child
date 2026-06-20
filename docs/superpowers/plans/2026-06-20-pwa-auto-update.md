# PWA Auto-Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every deploy ship a byte-changed service worker and prompt the user with a 刷新 banner so the installed PWA actually updates to the latest content.

**Architecture:** A build-time placeholder (`__BUILD_ID__`) in `public/sw.js` is replaced with a unique id by a Vite `writeBundle` plugin, so the browser detects each new SW. The SW now waits instead of self-activating; `registerServiceWorker.ts` detects the waiting worker and exposes it through a subscribe API, a hook surfaces it, and an `UpdatePrompt` banner lets the user trigger `SKIP_WAITING` + reload. A Cloudflare `_headers` file keeps `sw.js`/HTML uncached.

**Tech Stack:** React 18 + TypeScript, Vite, Service Worker API, Vitest + Testing Library.

---

## Task 1: Service worker — wait + build-id placeholder + SKIP_WAITING

**Files:**
- Modify: `public/sw.js:1,33-39`

- [ ] **Step 1: Replace the hardcoded cache version with a placeholder**

In `public/sw.js`, change line 1:

```js
const CACHE_VERSION = 'ui-web-child-v2';
```

to:

```js
const CACHE_VERSION = '__BUILD_ID__';
```

- [ ] **Step 2: Make the new SW wait instead of self-activating**

Replace the `install` handler:

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});
```

with (drop `skipWaiting`, add a message-driven skip):

```js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

Leave the `activate` and `fetch` handlers unchanged.

- [ ] **Step 3: Verify the placeholder is present and skipWaiting moved**

Run: `grep -n "__BUILD_ID__\|SKIP_WAITING\|skipWaiting" public/sw.js`
Expected: `CACHE_VERSION = '__BUILD_ID__'`, a `SKIP_WAITING` message check, and `self.skipWaiting()` only inside the message handler (not in `install`).

- [ ] **Step 4: Commit**

```bash
git add public/sw.js
git commit -m "feat: make service worker wait and use build-id placeholder"
```

---

## Task 2: Inject a unique build id into dist/sw.js

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Add the build-id plugin**

Replace the entire contents of `vite.config.ts` with:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

/** Stamp dist/sw.js with a unique cache version so each deploy ships a new SW. */
function swBuildId() {
  return {
    name: 'sw-build-id',
    apply: 'build' as const,
    writeBundle() {
      const swPath = path.resolve(__dirname, 'dist/sw.js');
      const id = `ui-web-child-${Date.now()}`;
      const src = readFileSync(swPath, 'utf8').replace(/__BUILD_ID__/g, id);
      writeFileSync(swPath, src);
    },
  };
}

export default defineConfig({
  plugins: [react(), swBuildId()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
});
```

- [ ] **Step 2: Build and verify the id was injected**

Run: `npm run build && grep -c "__BUILD_ID__" dist/sw.js; grep -o "ui-web-child-[0-9]*" dist/sw.js`
Expected: the `grep -c` prints `0` (placeholder gone) and the second grep prints a `ui-web-child-<digits>` line.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts
git commit -m "build: inject unique build id into service worker"
```

---

## Task 3: Rewrite registerServiceWorker with update detection

**Files:**
- Rewrite: `src/utils/registerServiceWorker.ts`

- [ ] **Step 1: Rewrite the module**

Replace the entire contents of `src/utils/registerServiceWorker.ts` with:

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/utils/registerServiceWorker.ts
git commit -m "feat: detect waiting service worker and expose update apply hook"
```

---

## Task 4: useServiceWorkerUpdate hook + UpdatePrompt banner

**Files:**
- Create: `src/hooks/useServiceWorkerUpdate.ts`
- Create: `src/components/UpdatePrompt.tsx`
- Test: `src/components/__tests__/UpdatePrompt.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/UpdatePrompt.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

let captured: ((apply: () => void) => void) | null = null;

vi.mock('@/utils/registerServiceWorker', () => ({
  onServiceWorkerUpdate: (fn: (apply: () => void) => void) => { captured = fn; },
}));

import { UpdatePrompt } from '../UpdatePrompt';

describe('UpdatePrompt', () => {
  beforeEach(() => { captured = null; });

  it('renders nothing until an update is announced', () => {
    render(<UpdatePrompt />);
    expect(screen.queryByText(/发现新版本/)).toBeNull();
  });

  it('shows the banner and applies the update on click', () => {
    const apply = vi.fn();
    render(<UpdatePrompt />);
    act(() => { captured?.(apply); });
    fireEvent.click(screen.getByRole('button', { name: /刷新/ }));
    expect(apply).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/UpdatePrompt.test.tsx`
Expected: FAIL — cannot find module `../UpdatePrompt`.

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useServiceWorkerUpdate.ts`:

```ts
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
```

- [ ] **Step 4: Implement the component**

Create `src/components/UpdatePrompt.tsx`:

```tsx
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/UpdatePrompt.test.tsx`
Expected: PASS — both tests.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useServiceWorkerUpdate.ts src/components/UpdatePrompt.tsx src/components/__tests__/UpdatePrompt.test.tsx
git commit -m "feat: add update prompt banner for new app versions"
```

---

## Task 5: Render UpdatePrompt in App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import and render the banner**

In `src/App.tsx`, add the import after the existing component imports (e.g. after the `MilestoneScene` import):

```ts
import { UpdatePrompt } from '@/components/UpdatePrompt';
```

Then render it inside the top-level layout `div`, right after the opening
`<div className="max-w-md mx-auto pb-20 min-h-screen">`:

```tsx
        <div className="max-w-md mx-auto pb-20 min-h-screen">
          <UpdatePrompt />
```

- [ ] **Step 2: Typecheck + full test suite**

Run: `npm run typecheck && npm run test:run`
Expected: PASS, all tests green.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: show update prompt in app shell"
```

---

## Task 6: Cloudflare no-cache headers for sw.js + HTML

**Files:**
- Create: `public/_headers`

- [ ] **Step 1: Create the headers file**

Create `public/_headers`:

```
/sw.js
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/
  Cache-Control: no-cache
```

- [ ] **Step 2: Verify it ships to dist**

Run: `npm run build && cat dist/_headers`
Expected: the three rules above are printed (Vite copies `public/` into `dist/`).

- [ ] **Step 3: Commit**

```bash
git add public/_headers
git commit -m "build: serve sw.js and html with no-cache on cloudflare pages"
```

---

## Task 7: Full verification

- [ ] **Step 1: Whole suite + typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: all tests PASS, no type errors.

- [ ] **Step 2: Build + SW id sanity**

Run: `npm run build && grep -c "__BUILD_ID__" dist/sw.js`
Expected: build succeeds and the count is `0`.

- [ ] **Step 3: Manual PWA update check**

Run: `npm run build && npm run preview -- --host 0.0.0.0`, open the Network URL, then
rebuild after a visible change and reload.
Expected: the "发现新版本，点击刷新" banner appears; tapping it reloads into the new version.
