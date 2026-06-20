# PWA Auto-Update — Design

Date: 2026-06-20
Status: Approved

## Problem

Opening the installed PWA from the desktop does not show freshly deployed content.

Root cause (three layers):

1. **`sw.js` is byte-identical every deploy.** `CACHE_VERSION` is hardcoded
   (`ui-web-child-v2`) in `public/sw.js`, which Vite copies verbatim. The browser only
   installs a new service worker when the SW file's bytes change, so it never installs
   the new one — `install`/`activate` (which purge old caches) never run.
2. **The old SW serves a stale precache.** It precached the old `index.html` + assets
   at first install. Navigation is network-first, but on a flaky desktop cold-launch it
   falls back to the cached old `index.html`, which references old hashed bundles (also
   cached) → old app.
3. **No in-app update flow.** `registerServiceWorker.ts` is fire-and-forget: no
   `registration.update()`, no waiting-worker detection, no reload.

## Decision (from brainstorming)

Show a **toast/banner prompt with a 刷新 button**; the user taps to apply the update.
No silent surprise reload.

## Approach

Make every deploy ship a byte-changed SW, detect the waiting worker, prompt the user,
and reload when they accept.

### 1. `public/sw.js`

- Replace `const CACHE_VERSION = 'ui-web-child-v2';` with
  `const CACHE_VERSION = '__BUILD_ID__';` (a build-time placeholder).
- Remove `self.skipWaiting()` from the `install` handler so the new SW *waits*.
- Add a `message` handler: `if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();`.
- Keep the `activate` cache-purge and `clients.claim()` unchanged. The purge filter
  `key.startsWith('ui-web-child-')` keeps working because the injected id keeps that prefix.

### 2. `vite.config.ts` — build-id injection plugin

Add an inline plugin with a `writeBundle` hook that reads `dist/sw.js`, replaces
`__BUILD_ID__` with `ui-web-child-<Date.now()>`, and writes it back. Runs only for the
build (not tests). Every build therefore produces a distinct SW.

### 3. `src/utils/registerServiceWorker.ts` (rewrite)

- Register `/sw.js` on `load` (PROD only, as today).
- Capture `hadController = !!navigator.serviceWorker.controller` at registration time.
- Add a `controllerchange` listener that reloads the page once — guarded so it is a
  no-op when `!hadController` (prevents a first-ever-install self-reload) and guarded by
  a `reloaded` flag against double reload.
- Detect an update: if `registration.waiting` exists with a controller present, or when
  an `installing` worker reaches `state === 'installed'` with a controller present,
  notify via a module-level subscribe API.
- Expose `onServiceWorkerUpdate(listener: (apply: () => void) => void)`. The `apply`
  function posts `{ type: 'SKIP_WAITING' }` to the waiting worker. If an update is
  already pending when a listener subscribes, call it immediately.
- Call `registration.update()` after registering.

### 4. `src/hooks/useServiceWorkerUpdate.ts`

`useServiceWorkerUpdate()` subscribes via `onServiceWorkerUpdate` in an effect and
returns `{ updateReady: boolean; applyUpdate: (() => void) | null }`.

### 5. `src/components/UpdatePrompt.tsx`

A fixed top banner shown only when `updateReady`. Contains text "发现新版本，点击刷新"
and a button that calls `applyUpdate()`. Returns `null` otherwise.

### 6. `src/App.tsx`

Render `<UpdatePrompt />` inside the existing layout.

### 7. `public/_headers` (Cloudflare Pages)

```
/sw.js
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/
  Cache-Control: no-cache
```

Forces revalidation of the SW and the HTML entry on each visit. Hashed `/assets/*`
bundles keep their default long-lived caching (their names change per build).

## Flow

deploy → browser revalidates `sw.js` (no-cache) → sees new bytes → installs new SW,
which waits → `installed` + controller present → app shows the banner → user taps 刷新 →
`apply()` posts `SKIP_WAITING` → new SW activates + claims → `controllerchange` →
page reloads → new version live.

First-ever install: no controller, banner not shown, no self-reload; SW controls from
the next launch.

## Testing

Unit (jsdom):

- `useServiceWorkerUpdate` / `UpdatePrompt` with a mocked `onServiceWorkerUpdate`:
  banner hidden by default; after the subscribe callback fires it renders and a click
  invokes `applyUpdate`.

Build verification:

- After `npm run build`, `dist/sw.js` contains no `__BUILD_ID__` and contains
  `ui-web-child-`.

Manual (SW internals + controllerchange are not exercisable in jsdom):

- `npm run build && npm run preview`, load over the network, deploy a change, reload,
  confirm the banner appears and tapping it loads the new version.

## Files touched

- Modify `public/sw.js`
- Modify `vite.config.ts`
- Rewrite `src/utils/registerServiceWorker.ts`
- Create `src/hooks/useServiceWorkerUpdate.ts`
- Create `src/components/UpdatePrompt.tsx`
- Modify `src/App.tsx`
- Create `public/_headers`
- Create `src/components/__tests__/UpdatePrompt.test.tsx`
