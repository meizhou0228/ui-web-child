# 宝宝积分小屋

> 让每一个好习惯都被记录，让每一份努力都有回报

H5 web app for tracking a 6-year-old's daily good-habit check-ins, points, rewards, and milestone badges. 100% client-side, data lives in browser localStorage.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build
- `npm test` — run Vitest in watch mode
- `npm run test:run` — run tests once
- `npm run typecheck` — TypeScript noEmit check

## Install on phone as PWA

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

Open the shown `Network` URL on the phone, then use the browser menu to add it to the home screen. After the first successful load, the app shell and assets are cached for offline use. Data remains on that phone in browser localStorage.

Note: service workers require a secure context. `localhost` works on the same device; phone access may need HTTPS or a secure local tunnel depending on the mobile browser.

## Architecture

- React 18 + Vite + TypeScript
- Zustand store (persisted to localStorage) with 7 slices
- React Router for 5 pages: Today / History / Shop / Stats / Settings
- Tailwind for styling, Framer Motion for 2D animation
- React Three Fiber for milestone unlock 3D scene (auto-falls-back to 2D on low-tier devices)
- Recharts for stats visualizations

## Data

All data lives under localStorage key `ui-web-child:v1`. Export / import / clear via Settings → 数据.

## Adding 3D-clay icons

Drop webp files into `public/assets/icons/{tasks,categories,rewards,milestones,child}/`.
Filenames must match icon `name` keys defined in `src/constants/iconCatalog.ts`.

Suggested source: Microsoft Fluent Emoji 3D (MIT) — https://github.com/microsoft/fluentui-emoji

## Spec & plan

- Spec: `docs/superpowers/specs/2026-05-23-kids-points-system-design.md`
- Plan: `docs/superpowers/plans/2026-05-23-kids-points-system.md`
