# 宝宝积分小屋

> 让每一个好习惯都被记录，让每一份努力都有回报。

宝宝积分小屋是一个给 6 岁大班、即将升小学的孩子使用的习惯打分小应用。它把每日习惯、积分奖励、连续打卡、徽章收藏和奖励兑换做成轻量游戏化体验，适合家长和孩子一起使用。

应用是 100% 前端实现，没有后端服务。数据保存在当前设备浏览器的 `localStorage` 中，并支持作为 PWA 添加到手机主屏幕、离线打开。

## Features

- 今日任务打卡：按早晨、白天、晚间分组展示习惯任务。
- 成长地图：根据当天完成度推进“小学城堡”冒险进度。
- 积分系统：完成任务获得积分，兑换奖励时扣除积分。
- 奖励商店：按小惊喜、周末愿望、大心愿分层展示。
- 徽章收藏：累计积分解锁成长徽章。
- 连续打卡：展示 3 / 7 / 14 / 30 天坚持目标。
- 数据管理：通过设置页导出、导入或清空本地数据。
- 离线 PWA：首次加载后缓存应用壳和静态资源。

## Tech Stack

- React 18 + Vite + TypeScript
- Zustand + Immer，本地持久化到 `localStorage`
- React Router
- Tailwind CSS
- Framer Motion
- React Three Fiber + Drei
- Recharts
- Vitest + Testing Library

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Scripts

- `npm run dev`：启动 Vite 开发服务器。
- `npm run build`：执行 TypeScript 检查并构建到 `dist/`。
- `npm run preview`：本地预览生产构建。
- `npm test`：以 watch 模式运行 Vitest。
- `npm run test:run`：单次运行全部测试。
- `npm run test:coverage`：运行覆盖率测试。
- `npm run typecheck`：执行 TypeScript 类型检查。

## Install on Phone as PWA

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

Open the shown `Network` URL on the phone, then use the browser menu to add it to the home screen. After the first successful load, the app shell and assets are cached for offline use. Data remains on that phone in browser `localStorage`.

Service workers require a secure context. `localhost` works on the same device; phone access usually needs HTTPS. For long-term phone use, deploy to Cloudflare Pages or another static HTTPS host.

## Deploy to Cloudflare Pages

Cloudflare Pages can host this app as a free static site.

Use these build settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

After deployment, open the `*.pages.dev` HTTPS URL on the phone and add it to the home screen.

## Project Structure

```text
src/
  components/      Reusable UI, scenes, forms, cards
  constants/       Preset tasks, rewards, icons, gamification config
  hooks/           App lifecycle hooks
  pages/           Today, History, Shop, Stats, Settings
  store/           Zustand slices, selectors, tests
  styles/          Global CSS and theme variables
  types/           Shared TypeScript domain types
  utils/           Date, milestone, import/export, sound helpers
public/
  assets/          Icons, audio, Lottie files, 3D models
  manifest.webmanifest
  sw.js
test/              Vitest setup and factories
```

## Data

All user data lives under the `localStorage` key `ui-web-child:v1`. Cloudflare Pages only serves static files; it does not store habit records, points, rewards, or child profile data.

Use Settings → 数据 to export a backup before changing phones, clearing browser data, or reinstalling the PWA.

## Adding 3D-clay icons

Drop webp files into `public/assets/icons/{tasks,categories,rewards,milestones,child}/`.
Filenames must match icon `name` keys defined in `src/constants/iconCatalog.ts`.

Suggested source: Microsoft Fluent Emoji 3D (MIT) — https://github.com/microsoft/fluentui-emoji

## Development Notes

- Keep pages and components focused; split files before they approach 500 lines.
- Put complex reusable state logic in `src/hooks`.
- Put domain constants and preset data in `src/constants`.
- Add tests near the target module in `__tests__` folders.
- Run `npm run typecheck` and `npm run test:run` before publishing changes.

## Spec & plan

- Spec: `docs/superpowers/specs/2026-05-23-kids-points-system-design.md`
- Plan: `docs/superpowers/plans/2026-05-23-kids-points-system.md`
