# Avatar-Based PWA App Icon — Design

Date: 2026-06-20
Status: Approved

## Summary

Make the installed PWA home-screen icon match the child's selected 头像 (`child.icon`).
The icon is generated at runtime from the avatar PNG, so no new image assets ship.

## Hard constraint (accepted)

On iOS and Android the home-screen icon is captured when the user taps "add to home
screen" and is then frozen — editing the manifest later does not re-skin an
already-installed app. Therefore this feature makes the icon **match the avatar
selected at install time**. Changing the avatar after install is handled **silently**
(no UI hint); the pre-install icon will always be correct.

## Decisions (from brainstorming)

- **Generation:** runtime `<canvas>` composition (no pre-rendered asset sets).
- **Post-install avatar change:** silent — keep the manifest in sync, show no hint.

## Approach

On app load and whenever `child.icon` changes:

1. Load `/assets/icons/child/<icon>.png` (already SW-cached, so it works offline).
2. Compose it onto a solid themed background on an offscreen canvas at three sizes:
   192, 512 (manifest icons, `purpose: "any maskable"`) and 180 (apple-touch-icon).
   Avatar is centered at ~64% of the canvas so it stays inside the maskable safe zone.
3. Build a web-manifest object (same metadata as the static `manifest.webmanifest`)
   whose `icons` point at the generated data URLs. Serialize to a Blob and create an
   object URL.
4. Swap `<link rel="manifest">` href to the blob URL, and `<link rel="apple-touch-icon">`
   href to the 180px data URL. Revoke the previous blob URL to avoid leaks.

The static `/pwa-icons/*` files and `public/manifest.webmanifest` remain as the
default/fallback (used if JS hasn't run or canvas is unavailable).

## Components

`src/utils/appIcon.ts`:

- `composeIcon(img: HTMLImageElement, size: number, bg: string): string`
  — draws bg + centered avatar to a canvas, returns a PNG data URL. Returns `''`
  if a 2D context is unavailable (e.g. non-browser env).
- `buildIconManifest(icon192: string, icon512: string): object`
  — pure function returning the manifest object with the given icon data URLs.
  Metadata mirrors `public/manifest.webmanifest`.
- `applyAppIcon(opts: { manifestUrl: string; appleTouchUrl: string }): void`
  — updates the `<link rel="manifest">` and `<link rel="apple-touch-icon">` href
  attributes (creating the apple-touch link if absent).

`src/hooks/useAppIcon.ts`:

- `useAppIcon()` — subscribes to `child.icon`, runs the load→compose→build→apply
  pipeline in an effect, tracks and revokes the previous blob URL. No-op on failure
  (e.g. image load error) so the static icons remain.

`src/App.tsx`:

- Call `useAppIcon()` alongside `useBootstrap()`.

## Constants

- Background color: `#FEF3C7` (matches manifest `background_color`).
- Maskable safe-zone ratio: avatar drawn at `0.64 * size`, centered.
- Sizes: manifest 192 + 512; apple-touch 180.

## Testing

Canvas pixel composition is not exercised in jsdom (no 2D context), so tests cover
the pure and DOM pieces:

- `buildIconManifest` returns a manifest whose `icons[0].src` / `icons[1].src` equal
  the passed data URLs, sizes `192x192` / `512x512`, and `purpose` `any maskable`.
- `applyAppIcon` sets `<link rel="manifest">` href to the given manifest URL and
  creates/updates `<link rel="apple-touch-icon">` href to the apple-touch URL.
- `composeIcon` returns `''` when `getContext('2d')` is null (guard path).

Manual verification: select each avatar, open DevTools → Application → Manifest, and
confirm the icon preview updates; install to home screen and confirm the icon matches.

## Files touched

- Create `src/utils/appIcon.ts`
- Create `src/hooks/useAppIcon.ts`
- Create `src/utils/__tests__/appIcon.test.ts`
- Modify `src/App.tsx` — call `useAppIcon()`
