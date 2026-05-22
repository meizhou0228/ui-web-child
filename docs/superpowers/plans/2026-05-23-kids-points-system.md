# 儿童积分管理系统 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page React/TypeScript H5 web app that lets a parent log a 6-year-old's daily good-habit check-ins, award points, redeem rewards, and unlock milestone badges — all stored in browser localStorage, dressed up in a 3D-clay fairy-tale visual style.

**Architecture:** A Vite + React 18 SPA with React Router v6 for 5 pages (Today / History / Shop / Stats / Settings). State is a single Zustand store split into 7 slices (`child`, `tasks`, `records`, `rewards`, `redemptions`, `milestones`, `ui`) auto-persisted to localStorage via the `persist` middleware and edited via `immer`. UI uses Tailwind for layout, Framer Motion for 2D animation, React Three Fiber for 3D hero moments (mascot, milestone unlock, treasure-chest), and Recharts for stats. Icons are Microsoft Fluent Emoji 3D webp assets. Test-driven for store/slices/selectors/utils with Vitest; UI verified by manual smoke test.

**Tech Stack:** Vite • React 18 • TypeScript • React Router 6 • Zustand (+persist +immer) • Tailwind CSS • Framer Motion • React Three Fiber + drei + three • lottie-react • Recharts • dayjs • nanoid • zod • Vitest • @testing-library/react

**Spec reference:** `docs/superpowers/specs/2026-05-23-kids-points-system-design.md`

---

## Phase 0 — File Map (decompose first)

Files to create (grouped by responsibility):

```
ui-web-child/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .gitignore
├── README.md
├── public/
│   └── assets/
│       ├── icons/         (placeholder webp assets, populated by user)
│       ├── models/        (placeholder glb assets)
│       ├── lottie/        (placeholder json)
│       └── audio/         (placeholder mp3)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── theme.css
│   ├── types/
│   │   └── index.ts
│   ├── constants/
│   │   ├── categories.ts
│   │   ├── presetTasks.ts
│   │   ├── presetRewards.ts
│   │   └── presetMilestones.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── milestones.ts
│   │   ├── exportImport.ts
│   │   └── deviceTier.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── childSlice.ts
│   │   ├── tasksSlice.ts
│   │   ├── recordsSlice.ts
│   │   ├── rewardsSlice.ts
│   │   ├── redemptionsSlice.ts
│   │   ├── milestonesSlice.ts
│   │   ├── uiSlice.ts
│   │   └── selectors.ts
│   ├── hooks/
│   │   ├── useDayChange.ts
│   │   └── useBootstrap.ts
│   ├── components/
│   │   ├── Icon.tsx
│   │   ├── IconPicker.tsx
│   │   ├── Toast.tsx
│   │   ├── ToastProvider.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ScoreCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TaskItem.tsx
│   │   ├── ShopCard.tsx
│   │   ├── NavBar.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── TaskForm.tsx
│   │   ├── RewardForm.tsx
│   │   └── scenes/
│   │       ├── MascotScene.tsx
│   │       ├── MilestoneScene.tsx
│   │       └── TreasureChestScene.tsx
│   └── pages/
│       ├── TodayPage.tsx
│       ├── HistoryPage.tsx
│       ├── ShopPage.tsx
│       ├── StatsPage.tsx
│       └── SettingsPage/
│           ├── index.tsx
│           ├── ChildSection.tsx
│           ├── TasksSection.tsx
│           ├── RewardsSection.tsx
│           └── DataSection.tsx
├── test/
│   ├── setup.ts
│   └── factories.ts
└── src/store/__tests__/
    ├── childSlice.test.ts
    ├── tasksSlice.test.ts
    ├── recordsSlice.test.ts
    ├── rewardsSlice.test.ts
    ├── redemptionsSlice.test.ts
    ├── milestonesSlice.test.ts
    └── selectors.test.ts
```

Hard rule: every file ≤ 500 lines. Long pages must split into `components/` sub-files.

---

## Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `.gitignore`

- [ ] **Step 1: Initialize project structure**

Run:
```bash
cd /Users/zhouyongdong/ui-web-child
npm init -y
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install react@^18.3.1 react-dom@^18.3.1 react-router-dom@^6.26.0 \
  zustand@^4.5.5 immer@^10.1.1 \
  framer-motion@^11.5.0 \
  @react-three/fiber@^8.17.0 @react-three/drei@^9.114.0 three@^0.168.0 \
  lottie-react@^2.4.0 \
  recharts@^2.13.0 \
  lucide-react@^0.460.0 \
  dayjs@^1.11.13 nanoid@^5.0.7 zod@^3.23.8
```

```bash
npm install -D typescript@^5.6.3 @types/react@^18.3.12 @types/react-dom@^18.3.1 @types/three@^0.168.0 \
  vite@^5.4.10 @vitejs/plugin-react@^4.3.3 \
  tailwindcss@^3.4.14 postcss@^8.4.47 autoprefixer@^10.4.20 \
  vitest@^2.1.4 @testing-library/react@^16.0.1 @testing-library/jest-dom@^6.6.3 jsdom@^25.0.1
```

- [ ] **Step 3: Write `package.json` scripts**

Replace `scripts` in `package.json` with:

```json
{
  "name": "ui-web-child",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc -b --noEmit"
  }
}
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "test"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Write `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Write `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
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

- [ ] **Step 7: Write `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>宝宝积分小屋</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Write `src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 9: Write minimal `src/App.tsx`**

```typescript
export default function App() {
  return <div className="p-4">宝宝积分小屋</div>;
}
```

- [ ] **Step 10: Write `.gitignore`**

```
node_modules/
dist/
.vite/
coverage/
.DS_Store
*.log
```

- [ ] **Step 11: Initialize git and commit**

Run:
```bash
cd /Users/zhouyongdong/ui-web-child
git init
git add -A
git commit -m "chore: scaffold Vite + React + TS project"
```

Expected: Initial commit succeeds.

---

## Task 2: Tailwind config + theme + folder structure

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/styles/globals.css`, `src/styles/theme.css`, empty placeholder dirs

- [ ] **Step 1: Write `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sky:    { brand: '#7DD3FC' },
        mint:   { brand: '#A7F3D0' },
        peach:  { brand: '#FECACA' },
        gold:   { brand: '#FCD34D' },
        grape:  { brand: '#C4B5FD' },
        cream:  { brand: '#FEF3C7' },
      },
      boxShadow: {
        'soft': '0 20px 40px -10px rgba(0,0,0,0.15)',
        '3d':   '0 10px 0 #d4d4d4, 0 15px 25px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        'big':  '24px',
        'huge': '40px',
      },
      fontFamily: {
        cute: ['"ZCOOL KuaiLe"', '"LXGW WenKai"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Write `postcss.config.js`**

```javascript
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 3: Write `src/styles/theme.css`**

```css
:root {
  --color-sky:     #7DD3FC;
  --color-mint:    #A7F3D0;
  --color-peach:   #FECACA;
  --color-gold:    #FCD34D;
  --color-grape:   #C4B5FD;
  --color-cream:   #FEF3C7;
  --shadow-soft:   0 20px 40px -10px rgba(0,0,0,0.15);
  --shadow-3d:     0 10px 0 #d4d4d4, 0 15px 25px rgba(0,0,0,0.2);
  --radius-big:    24px;
  --radius-huge:   40px;
}
```

- [ ] **Step 4: Write `src/styles/globals.css`**

```css
@import './theme.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root { height: 100%; }
  body {
    background: linear-gradient(180deg, var(--color-cream) 0%, #FFFFFF 100%);
    color: #1f2937;
    font-family: 'ZCOOL KuaiLe', 'LXGW WenKai', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
}
```

- [ ] **Step 5: Create placeholder asset folders**

Run:
```bash
mkdir -p /Users/zhouyongdong/ui-web-child/public/assets/{icons/tasks,icons/categories,icons/rewards,icons/milestones,models,lottie,audio}
mkdir -p /Users/zhouyongdong/ui-web-child/src/{components/scenes,hooks,store/__tests__,pages/SettingsPage,types,constants,utils}
mkdir -p /Users/zhouyongdong/ui-web-child/test
touch /Users/zhouyongdong/ui-web-child/public/assets/icons/.gitkeep
```

- [ ] **Step 6: Verify dev server starts**

Run:
```bash
cd /Users/zhouyongdong/ui-web-child
npm run dev -- --port 5173 &
sleep 3
curl -s http://localhost:5173 | head -5
kill %1
```

Expected: HTML response containing `<div id="root">`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: configure Tailwind + theme + folder structure"
```

---

## Task 3: TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Write `src/types/index.ts`**

```typescript
export type CategoryId = 'study' | 'life' | 'sport';
export type TimeSlot = 'morning' | 'daytime' | 'evening';
export type RepeatType = 'daily' | 'once';
export type RedemptionStatus = 'pending' | 'fulfilled' | 'cancelled';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  accentColor: string;
}

export interface Task {
  id: string;
  categoryId: CategoryId;
  name: string;
  icon: string;
  points: number;
  repeatable: RepeatType;
  timeSlot: TimeSlot;
  weeklyLimit?: number;
  active: boolean;
  createdAt: number;
}

export interface TaskSnapshot {
  name: string;
  icon: string;
  categoryId: CategoryId;
  points: number;
}

export interface Record {
  id: string;
  taskId: string;
  taskSnapshot: TaskSnapshot;
  points: number;
  date: string;        // YYYY-MM-DD local
  timestamp: number;
  note?: string;
}

export interface Reward {
  id: string;
  name: string;
  icon: string;
  cost: number;
  stock: number | null;
  active: boolean;
  createdAt: number;
}

export interface RewardSnapshot {
  name: string;
  icon: string;
  cost: number;
}

export interface Redemption {
  id: string;
  rewardId: string;
  rewardSnapshot: RewardSnapshot;
  cost: number;
  timestamp: number;
  status: RedemptionStatus;
}

export interface Milestone {
  id: string;
  threshold: number;
  name: string;
  icon: string;
  model3d?: string;
  description: string;
}

export interface UnlockedMilestone {
  milestoneId: string;
  unlockedAt: number;
}

export interface Child {
  name: string;
  icon: string;
  birthday?: string;
}

export interface PresetTaskSeed {
  categoryId: CategoryId;
  name: string;
  icon: string;
  points: number;
  repeatable: RepeatType;
  timeSlot: TimeSlot;
  weeklyLimit?: number;
}

export interface PresetRewardSeed {
  name: string;
  icon: string;
  cost: number;
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
cd /Users/zhouyongdong/ui-web-child
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add TypeScript domain types"
```

---

## Task 4: Constants — categories, preset milestones, preset tasks, preset rewards

**Files:**
- Create: `src/constants/categories.ts`, `src/constants/presetMilestones.ts`, `src/constants/presetTasks.ts`, `src/constants/presetRewards.ts`

- [ ] **Step 1: Write `src/constants/categories.ts`**

```typescript
import type { Category } from '@/types';

export const PRESET_CATEGORIES: Category[] = [
  { id: 'study', name: '学习', icon: 'study', color: 'sky',     accentColor: '#7DD3FC' },
  { id: 'life',  name: '生活', icon: 'life',  color: 'amber',   accentColor: '#FCD34D' },
  { id: 'sport', name: '运动', icon: 'sport', color: 'emerald', accentColor: '#A7F3D0' },
];

export function findCategory(id: string): Category | undefined {
  return PRESET_CATEGORIES.find((c) => c.id === id);
}
```

- [ ] **Step 2: Write `src/constants/presetMilestones.ts`**

```typescript
import type { Milestone } from '@/types';

export const PRESET_MILESTONES: Milestone[] = [
  { id: 'm-100',  threshold: 100,  name: '习惯新星',    icon: 'rising-star',   description: '累计 100 分，你是新的小星星！' },
  { id: 'm-300',  threshold: 300,  name: '坚持小达人',  icon: 'shooting-star', description: '累计 300 分，坚持就是胜利！' },
  { id: 'm-500',  threshold: 500,  name: '五百精英',    icon: 'medal',         description: '累计 500 分，越来越棒了！' },
  { id: 'm-1000', threshold: 1000, name: '千分大师',    icon: 'trophy',        description: '累计 1000 分，了不起！' },
  { id: 'm-2000', threshold: 2000, name: '两千传奇',    icon: 'crown',         description: '累计 2000 分，习惯小王者！' },
  { id: 'm-5000', threshold: 5000, name: '五千王者',    icon: 'diamond',       description: '累计 5000 分，自律之光！' },
];
```

- [ ] **Step 3: Write `src/constants/presetTasks.ts`**

```typescript
import type { PresetTaskSeed } from '@/types';

export const PRESET_TASKS: PresetTaskSeed[] = [
  { categoryId: 'study', name: '朗读 15 分钟',       icon: 'book-open',     points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '数学小练习 10 分钟',  icon: 'input-numbers', points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '控笔/写字练习',      icon: 'pencil',        points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '亲子共读 20 分钟',   icon: 'books',         points: 10, timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'study', name: '英文分级阅读',       icon: 'abc',           points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '专注完成作业',       icon: 'memo',          points: 10, timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'life',  name: '7:00 自主起床',      icon: 'sunrise',       points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '自己穿衣叠被',       icon: 'shirt',         points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '刷牙洗脸',           icon: 'toothbrush',    points: 3,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '吃完早餐不挑食',     icon: 'bowl-of-food',  points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '整理玩具/书桌',      icon: 'teddy-bear',    points: 5,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'life',  name: '帮忙做一项家务',     icon: 'broom',         points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'life',  name: '屏幕时间 ≤ 30 分钟', icon: 'mobile-phone',  points: 5,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'life',  name: '21:00 前洗漱完毕',   icon: 'soap',          points: 3,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'life',  name: '21:30 入睡',         icon: 'sleeping-face', points: 5,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'sport', name: '跳绳 100-200 下',    icon: 'jumping-rope',  points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'sport', name: '户外活动 ≥ 1 小时',  icon: 'runner',        points: 10, timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'sport', name: '体能小练习',         icon: 'flexed-biceps', points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
];

export const PRESET_WEEKLY_TASKS: PresetTaskSeed[] = [
  { categoryId: 'study', name: '本周读完一本绘本', icon: 'closed-book', points: 30, timeSlot: 'daytime', repeatable: 'once', weeklyLimit: 1 },
  { categoryId: 'sport', name: '周末爬山/远足',     icon: 'mountain',    points: 30, timeSlot: 'daytime', repeatable: 'once', weeklyLimit: 1 },
  { categoryId: 'life',  name: '完整一周作息打卡', icon: 'trophy',      points: 50, timeSlot: 'evening', repeatable: 'once', weeklyLimit: 1 },
];
```

- [ ] **Step 4: Write `src/constants/presetRewards.ts`**

```typescript
import type { PresetRewardSeed } from '@/types';

export const PRESET_REWARDS: PresetRewardSeed[] = [
  { name: '看动画片 20 分钟', icon: 'tv',         cost: 30 },
  { name: '挑选今晚水果',     icon: 'strawberry', cost: 20 },
  { name: '小贴纸一张',       icon: 'sticker',    cost: 25 },
  { name: '亲子游戏 1 小时',  icon: 'game-dice',  cost: 60 },
  { name: '选今晚菜单',       icon: 'bento',      cost: 80 },
  { name: '周末晚睡 30 分钟', icon: 'moon',       cost: 80 },
  { name: '小玩具一个',       icon: 'gift',       cost: 100 },
  { name: '乐高一盒',         icon: 'lego',       cost: 500 },
  { name: '电影院看电影',     icon: 'movie',      cost: 600 },
  { name: '游乐场半日游',     icon: 'roller',     cost: 800 },
  { name: '心愿礼物',         icon: 'sparkles',   cost: 1500 },
];
```

- [ ] **Step 5: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add preset constants (categories, milestones, tasks, rewards)"
```

---

## Task 5: Date and milestone utils + Vitest setup

**Files:**
- Create: `src/utils/date.ts`, `src/utils/milestones.ts`, `src/utils/deviceTier.ts`, `test/setup.ts`, `test/factories.ts`, `src/utils/__tests__/date.test.ts`, `src/utils/__tests__/milestones.test.ts`

- [ ] **Step 1: Write `test/setup.ts`**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 2: Write `src/utils/date.ts`**

```typescript
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

export const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function todayKey(now: number = Date.now()): string {
  return dayjs(now).format('YYYY-MM-DD');
}

export function isSameDay(a: number, b: number): boolean {
  return dayjs(a).isSame(dayjs(b), 'day');
}

export function isoWeekKey(now: number = Date.now()): string {
  const d = dayjs(now);
  return `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, '0')}`;
}

export function startOfIsoWeek(now: number = Date.now()): number {
  return dayjs(now).startOf('isoWeek').valueOf();
}

export function endOfIsoWeek(now: number = Date.now()): number {
  return dayjs(now).endOf('isoWeek').valueOf();
}

export function withinUndoWindow(timestamp: number, now: number = Date.now()): boolean {
  return now - timestamp <= FIVE_MINUTES_MS;
}

export function formatHM(timestamp: number): string {
  return dayjs(timestamp).format('HH:mm');
}

export function formatDateZh(date: string): string {
  return dayjs(date).format('YYYY-MM-DD');
}
```

- [ ] **Step 3: Write `src/utils/__tests__/date.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import {
  todayKey, isSameDay, isoWeekKey, withinUndoWindow, FIVE_MINUTES_MS,
} from '../date';

describe('date utils', () => {
  it('todayKey returns YYYY-MM-DD', () => {
    const key = todayKey(new Date('2026-05-23T10:00:00').getTime());
    expect(key).toBe('2026-05-23');
  });

  it('isSameDay true for same calendar day', () => {
    const a = new Date('2026-05-23T01:00').getTime();
    const b = new Date('2026-05-23T23:59').getTime();
    expect(isSameDay(a, b)).toBe(true);
  });

  it('isSameDay false across days', () => {
    const a = new Date('2026-05-23T23:00').getTime();
    const b = new Date('2026-05-24T01:00').getTime();
    expect(isSameDay(a, b)).toBe(false);
  });

  it('isoWeekKey gives stable key', () => {
    const k1 = isoWeekKey(new Date('2026-05-18T00:00').getTime()); // Monday
    const k2 = isoWeekKey(new Date('2026-05-24T23:59').getTime()); // Sunday
    expect(k1).toBe(k2);
  });

  it('isoWeekKey differs across weeks', () => {
    const k1 = isoWeekKey(new Date('2026-05-24T23:00').getTime());
    const k2 = isoWeekKey(new Date('2026-05-25T01:00').getTime());
    expect(k1).not.toBe(k2);
  });

  it('withinUndoWindow true within 5 min', () => {
    const t = Date.now();
    expect(withinUndoWindow(t, t + FIVE_MINUTES_MS - 100)).toBe(true);
  });

  it('withinUndoWindow false past 5 min', () => {
    const t = Date.now();
    expect(withinUndoWindow(t, t + FIVE_MINUTES_MS + 100)).toBe(false);
  });
});
```

- [ ] **Step 4: Run date tests, watch them pass**

Run:
```bash
cd /Users/zhouyongdong/ui-web-child
npx vitest run src/utils/__tests__/date.test.ts
```

Expected: All 7 tests pass.

- [ ] **Step 5: Write `src/utils/milestones.ts`**

```typescript
import type { Milestone, UnlockedMilestone } from '@/types';

export function findUnlockable(
  milestones: Milestone[],
  totalEarned: number,
  alreadyUnlocked: UnlockedMilestone[],
): Milestone | null {
  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.milestoneId));
  const candidates = milestones
    .filter((m) => !unlockedIds.has(m.id) && totalEarned >= m.threshold)
    .sort((a, b) => a.threshold - b.threshold);
  return candidates[0] ?? null;
}

export function findNext(
  milestones: Milestone[],
  totalEarned: number,
  alreadyUnlocked: UnlockedMilestone[],
): Milestone | null {
  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.milestoneId));
  return [...milestones]
    .filter((m) => !unlockedIds.has(m.id) && m.threshold > totalEarned)
    .sort((a, b) => a.threshold - b.threshold)[0] ?? null;
}
```

- [ ] **Step 6: Write `src/utils/__tests__/milestones.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { findUnlockable, findNext } from '../milestones';
import { PRESET_MILESTONES } from '@/constants/presetMilestones';

describe('milestone utils', () => {
  it('findUnlockable returns lowest unlocked threshold', () => {
    const m = findUnlockable(PRESET_MILESTONES, 150, []);
    expect(m?.id).toBe('m-100');
  });

  it('findUnlockable skips already unlocked', () => {
    const m = findUnlockable(PRESET_MILESTONES, 350, [
      { milestoneId: 'm-100', unlockedAt: 0 },
    ]);
    expect(m?.id).toBe('m-300');
  });

  it('findUnlockable returns null when none cross threshold', () => {
    const m = findUnlockable(PRESET_MILESTONES, 50, []);
    expect(m).toBeNull();
  });

  it('findNext returns smallest threshold above earned', () => {
    const m = findNext(PRESET_MILESTONES, 350, [
      { milestoneId: 'm-100', unlockedAt: 0 },
      { milestoneId: 'm-300', unlockedAt: 0 },
    ]);
    expect(m?.id).toBe('m-500');
  });
});
```

- [ ] **Step 7: Run milestone tests**

```bash
npx vitest run src/utils/__tests__/milestones.test.ts
```

Expected: All 4 tests pass.

- [ ] **Step 8: Write `src/utils/deviceTier.ts`**

```typescript
export function isLowTierDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  return cores < 4 || memory < 2;
}
```

- [ ] **Step 9: Write `test/factories.ts`**

```typescript
import { nanoid } from 'nanoid';
import type { Task, Record, Reward, Redemption, Child } from '@/types';

export const makeChild = (overrides: Partial<Child> = {}): Child => ({
  name: '小宝',
  icon: 'bear',
  ...overrides,
});

export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: nanoid(),
  categoryId: 'study',
  name: '测试任务',
  icon: 'book-open',
  points: 10,
  repeatable: 'daily',
  timeSlot: 'daytime',
  active: true,
  createdAt: Date.now(),
  ...overrides,
});

export const makeRecord = (overrides: Partial<Record> = {}): Record => {
  const task = makeTask();
  return {
    id: nanoid(),
    taskId: task.id,
    taskSnapshot: { name: task.name, icon: task.icon, categoryId: task.categoryId, points: task.points },
    points: task.points,
    date: '2026-05-23',
    timestamp: Date.now(),
    ...overrides,
  };
};

export const makeReward = (overrides: Partial<Reward> = {}): Reward => ({
  id: nanoid(),
  name: '测试奖励',
  icon: 'gift',
  cost: 50,
  stock: null,
  active: true,
  createdAt: Date.now(),
  ...overrides,
});

export const makeRedemption = (overrides: Partial<Redemption> = {}): Redemption => {
  const reward = makeReward();
  return {
    id: nanoid(),
    rewardId: reward.id,
    rewardSnapshot: { name: reward.name, icon: reward.icon, cost: reward.cost },
    cost: reward.cost,
    timestamp: Date.now(),
    status: 'pending',
    ...overrides,
  };
};
```

- [ ] **Step 10: Run all utils tests + commit**

```bash
npx vitest run src/utils/__tests__/
git add -A
git commit -m "feat: add date/milestone/deviceTier utils with TDD"
```

---

## Task 6: childSlice with tests

**Files:**
- Create: `src/store/childSlice.ts`, `src/store/__tests__/childSlice.test.ts`

- [ ] **Step 1: Write `src/store/__tests__/childSlice.test.ts` (failing)**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createChildSlice, ChildSlice } from '../childSlice';

const makeStore = () => create<ChildSlice>()(immer((...a) => createChildSlice(...a)));

describe('childSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('defaults to a name "小宝"', () => {
    expect(store.getState().child.name).toBe('小宝');
  });

  it('setChildName updates name', () => {
    store.getState().setChildName('小明');
    expect(store.getState().child.name).toBe('小明');
  });

  it('setChildIcon updates icon', () => {
    store.getState().setChildIcon('fox');
    expect(store.getState().child.icon).toBe('fox');
  });

  it('setChildBirthday updates birthday', () => {
    store.getState().setChildBirthday('2020-01-01');
    expect(store.getState().child.birthday).toBe('2020-01-01');
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npx vitest run src/store/__tests__/childSlice.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/store/childSlice.ts`**

```typescript
import type { StateCreator } from 'zustand';
import type { Child } from '@/types';

export interface ChildSlice {
  child: Child;
  setChildName: (name: string) => void;
  setChildIcon: (icon: string) => void;
  setChildBirthday: (date: string) => void;
}

const DEFAULT_CHILD: Child = { name: '小宝', icon: 'bear' };

export const createChildSlice: StateCreator<
  ChildSlice,
  [['zustand/immer', never]],
  [],
  ChildSlice
> = (set) => ({
  child: DEFAULT_CHILD,
  setChildName: (name) => set((s) => { s.child.name = name; }),
  setChildIcon: (icon) => set((s) => { s.child.icon = icon; }),
  setChildBirthday: (date) => set((s) => { s.child.birthday = date; }),
});
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
npx vitest run src/store/__tests__/childSlice.test.ts
```

Expected: All 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(store): add childSlice with tests"
```

---

## Task 7: tasksSlice with tests

**Files:**
- Create: `src/store/tasksSlice.ts`, `src/store/__tests__/tasksSlice.test.ts`

- [ ] **Step 1: Write `src/store/__tests__/tasksSlice.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createTasksSlice, TasksSlice } from '../tasksSlice';
import { PRESET_TASKS } from '@/constants/presetTasks';

const makeStore = () => create<TasksSlice>()(immer((...a) => createTasksSlice(...a)));

describe('tasksSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('starts empty', () => {
    expect(store.getState().tasks).toEqual([]);
  });

  it('addTask appends with id and timestamp', () => {
    store.getState().addTask({
      categoryId: 'study', name: '练琴', icon: 'piano',
      points: 5, repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const tasks = store.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBeTruthy();
    expect(tasks[0].createdAt).toBeGreaterThan(0);
    expect(tasks[0].name).toBe('练琴');
  });

  it('updateTask patches existing', () => {
    store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 1,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const id = store.getState().tasks[0].id;
    store.getState().updateTask(id, { name: 'b', points: 99 });
    expect(store.getState().tasks[0].name).toBe('b');
    expect(store.getState().tasks[0].points).toBe(99);
  });

  it('toggleTaskActive flips active flag', () => {
    store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 1,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const id = store.getState().tasks[0].id;
    store.getState().toggleTaskActive(id);
    expect(store.getState().tasks[0].active).toBe(false);
    store.getState().toggleTaskActive(id);
    expect(store.getState().tasks[0].active).toBe(true);
  });

  it('removeTask deletes', () => {
    store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 1,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const id = store.getState().tasks[0].id;
    store.getState().removeTask(id);
    expect(store.getState().tasks).toHaveLength(0);
  });

  it('restorePresetTasks loads 21 presets when empty', () => {
    store.getState().restorePresetTasks();
    expect(store.getState().tasks.length).toBe(PRESET_TASKS.length + 3); // 18 daily + 3 weekly
  });

  it('restorePresetTasks does not duplicate existing names', () => {
    store.getState().restorePresetTasks();
    const before = store.getState().tasks.length;
    store.getState().restorePresetTasks();
    expect(store.getState().tasks.length).toBe(before);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npx vitest run src/store/__tests__/tasksSlice.test.ts
```

- [ ] **Step 3: Write `src/store/tasksSlice.ts`**

```typescript
import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { Task } from '@/types';
import { PRESET_TASKS, PRESET_WEEKLY_TASKS } from '@/constants/presetTasks';

export interface TasksSlice {
  tasks: Task[];
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void;
  toggleTaskActive: (id: string) => void;
  removeTask: (id: string) => void;
  restorePresetTasks: () => void;
}

export const createTasksSlice: StateCreator<
  TasksSlice,
  [['zustand/immer', never]],
  [],
  TasksSlice
> = (set, get) => ({
  tasks: [],
  addTask: (data) => {
    const task: Task = { ...data, id: nanoid(), createdAt: Date.now() };
    set((s) => { s.tasks.push(task); });
    return task;
  },
  updateTask: (id, patch) => set((s) => {
    const t = s.tasks.find((x) => x.id === id);
    if (t) Object.assign(t, patch);
  }),
  toggleTaskActive: (id) => set((s) => {
    const t = s.tasks.find((x) => x.id === id);
    if (t) t.active = !t.active;
  }),
  removeTask: (id) => set((s) => {
    s.tasks = s.tasks.filter((x) => x.id !== id);
  }),
  restorePresetTasks: () => {
    const existing = new Set(get().tasks.map((t) => t.name));
    const seeds = [...PRESET_TASKS, ...PRESET_WEEKLY_TASKS].filter((p) => !existing.has(p.name));
    set((s) => {
      for (const seed of seeds) {
        s.tasks.push({
          ...seed,
          id: nanoid(),
          createdAt: Date.now(),
          active: true,
        });
      }
    });
  },
});
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
npx vitest run src/store/__tests__/tasksSlice.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(store): add tasksSlice with tests"
```

---

## Task 8: recordsSlice with tests (core check-in logic)

**Files:**
- Create: `src/store/recordsSlice.ts`, `src/store/__tests__/recordsSlice.test.ts`

This slice depends on `tasksSlice` (to look up tasks) but uses a callback to stay independent. We will inject the task lookup at store-composition time in Task 12.

- [ ] **Step 1: Write `src/store/__tests__/recordsSlice.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createRecordsSlice, RecordsSlice } from '../recordsSlice';
import { createTasksSlice, TasksSlice } from '../tasksSlice';
import { todayKey } from '@/utils/date';

type Combined = TasksSlice & RecordsSlice;

const makeStore = () =>
  create<Combined>()(immer((...a) => ({
    ...createTasksSlice(...a),
    ...createRecordsSlice(...a),
  })));

describe('recordsSlice.checkIn', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('returns null for unknown task', () => {
    expect(store.getState().checkIn('nope')).toBeNull();
  });

  it('returns null for inactive task', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: false,
    });
    expect(store.getState().checkIn(t.id)).toBeNull();
  });

  it('creates record with snapshot on first check-in', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: '朗读', icon: 'book', points: 8,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const r = store.getState().checkIn(t.id);
    expect(r).not.toBeNull();
    expect(r!.points).toBe(8);
    expect(r!.taskSnapshot).toEqual({
      name: '朗读', icon: 'book', categoryId: 'study', points: 8,
    });
    expect(r!.date).toBe(todayKey());
    expect(store.getState().records).toHaveLength(1);
  });

  it('rejects same daily task twice in one day', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    expect(store.getState().checkIn(t.id)).not.toBeNull();
    expect(store.getState().checkIn(t.id)).toBeNull();
    expect(store.getState().records).toHaveLength(1);
  });

  it('rejects once-task past weeklyLimit', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'w', icon: 'x', points: 30,
      repeatable: 'once', weeklyLimit: 1, timeSlot: 'daytime', active: true,
    });
    expect(store.getState().checkIn(t.id)).not.toBeNull();
    expect(store.getState().checkIn(t.id)).toBeNull();
  });

  it('undoRecord removes within 5 min window', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const r = store.getState().checkIn(t.id)!;
    expect(store.getState().undoRecord(r.id)).toBe(true);
    expect(store.getState().records).toHaveLength(0);
  });

  it('undoRecord refuses past 5 min', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T10:00:00'));
    const t = store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const r = store.getState().checkIn(t.id)!;
    vi.setSystemTime(new Date('2026-05-23T10:06:00'));
    expect(store.getState().undoRecord(r.id)).toBe(false);
    expect(store.getState().records).toHaveLength(1);
    vi.useRealTimers();
  });

  it('removeRecord force-deletes any record', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const r = store.getState().checkIn(t.id)!;
    store.getState().removeRecord(r.id);
    expect(store.getState().records).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npx vitest run src/store/__tests__/recordsSlice.test.ts
```

- [ ] **Step 3: Write `src/store/recordsSlice.ts`**

```typescript
import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { Record, Task } from '@/types';
import { todayKey, isoWeekKey, withinUndoWindow } from '@/utils/date';

export interface RecordsSlice {
  records: Record[];
  checkIn: (taskId: string, note?: string) => Record | null;
  undoRecord: (id: string) => boolean;
  removeRecord: (id: string) => void;
}

interface WithTasks {
  tasks: Task[];
}

export const createRecordsSlice: StateCreator<
  RecordsSlice & WithTasks,
  [['zustand/immer', never]],
  [],
  RecordsSlice
> = (set, get) => ({
  records: [],
  checkIn: (taskId, note) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || !task.active) return null;

    const now = Date.now();
    const today = todayKey(now);

    if (task.repeatable === 'daily') {
      const dup = state.records.find((r) => r.taskId === taskId && r.date === today);
      if (dup) return null;
    } else {
      const limit = task.weeklyLimit ?? 1;
      const thisWeek = isoWeekKey(now);
      const sameWeekCount = state.records.filter(
        (r) => r.taskId === taskId && isoWeekKey(r.timestamp) === thisWeek,
      ).length;
      if (sameWeekCount >= limit) return null;
    }

    const record: Record = {
      id: nanoid(),
      taskId,
      taskSnapshot: {
        name: task.name,
        icon: task.icon,
        categoryId: task.categoryId,
        points: task.points,
      },
      points: task.points,
      date: today,
      timestamp: now,
      note,
    };
    set((s) => { s.records.push(record); });
    return record;
  },
  undoRecord: (id) => {
    const r = get().records.find((x) => x.id === id);
    if (!r) return false;
    if (!withinUndoWindow(r.timestamp)) return false;
    set((s) => { s.records = s.records.filter((x) => x.id !== id); });
    return true;
  },
  removeRecord: (id) => set((s) => {
    s.records = s.records.filter((x) => x.id !== id);
  }),
});
```

- [ ] **Step 4: Run tests, expect PASS**

```bash
npx vitest run src/store/__tests__/recordsSlice.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(store): add recordsSlice with TDD (checkIn, undo, weeklyLimit)"
```

---

## Task 9: rewardsSlice with tests

**Files:**
- Create: `src/store/rewardsSlice.ts`, `src/store/__tests__/rewardsSlice.test.ts`

- [ ] **Step 1: Write `src/store/__tests__/rewardsSlice.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createRewardsSlice, RewardsSlice } from '../rewardsSlice';
import { PRESET_REWARDS } from '@/constants/presetRewards';

const makeStore = () => create<RewardsSlice>()(immer((...a) => createRewardsSlice(...a)));

describe('rewardsSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('starts empty', () => {
    expect(store.getState().rewards).toEqual([]);
  });

  it('addReward appends', () => {
    store.getState().addReward({ name: '糖', icon: 'candy', cost: 10, stock: null, active: true });
    expect(store.getState().rewards).toHaveLength(1);
  });

  it('updateReward patches', () => {
    store.getState().addReward({ name: 'a', icon: 'x', cost: 1, stock: null, active: true });
    const id = store.getState().rewards[0].id;
    store.getState().updateReward(id, { cost: 99 });
    expect(store.getState().rewards[0].cost).toBe(99);
  });

  it('toggleRewardActive flips flag', () => {
    store.getState().addReward({ name: 'a', icon: 'x', cost: 1, stock: null, active: true });
    const id = store.getState().rewards[0].id;
    store.getState().toggleRewardActive(id);
    expect(store.getState().rewards[0].active).toBe(false);
  });

  it('removeReward deletes', () => {
    store.getState().addReward({ name: 'a', icon: 'x', cost: 1, stock: null, active: true });
    const id = store.getState().rewards[0].id;
    store.getState().removeReward(id);
    expect(store.getState().rewards).toHaveLength(0);
  });

  it('restorePresetRewards loads all presets', () => {
    store.getState().restorePresetRewards();
    expect(store.getState().rewards.length).toBe(PRESET_REWARDS.length);
  });

  it('restorePresetRewards skips by name', () => {
    store.getState().restorePresetRewards();
    const before = store.getState().rewards.length;
    store.getState().restorePresetRewards();
    expect(store.getState().rewards.length).toBe(before);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npx vitest run src/store/__tests__/rewardsSlice.test.ts
```

- [ ] **Step 3: Write `src/store/rewardsSlice.ts`**

```typescript
import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { Reward } from '@/types';
import { PRESET_REWARDS } from '@/constants/presetRewards';

export interface RewardsSlice {
  rewards: Reward[];
  addReward: (data: Omit<Reward, 'id' | 'createdAt'>) => Reward;
  updateReward: (id: string, patch: Partial<Omit<Reward, 'id'>>) => void;
  toggleRewardActive: (id: string) => void;
  removeReward: (id: string) => void;
  restorePresetRewards: () => void;
}

export const createRewardsSlice: StateCreator<
  RewardsSlice,
  [['zustand/immer', never]],
  [],
  RewardsSlice
> = (set, get) => ({
  rewards: [],
  addReward: (data) => {
    const r: Reward = { ...data, id: nanoid(), createdAt: Date.now() };
    set((s) => { s.rewards.push(r); });
    return r;
  },
  updateReward: (id, patch) => set((s) => {
    const r = s.rewards.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
  }),
  toggleRewardActive: (id) => set((s) => {
    const r = s.rewards.find((x) => x.id === id);
    if (r) r.active = !r.active;
  }),
  removeReward: (id) => set((s) => {
    s.rewards = s.rewards.filter((x) => x.id !== id);
  }),
  restorePresetRewards: () => {
    const existing = new Set(get().rewards.map((r) => r.name));
    const seeds = PRESET_REWARDS.filter((p) => !existing.has(p.name));
    set((s) => {
      for (const seed of seeds) {
        s.rewards.push({
          ...seed,
          id: nanoid(),
          stock: null,
          active: true,
          createdAt: Date.now(),
        });
      }
    });
  },
});
```

- [ ] **Step 4: Run + commit**

```bash
npx vitest run src/store/__tests__/rewardsSlice.test.ts
git add -A
git commit -m "feat(store): add rewardsSlice with tests"
```

---

## Task 10: redemptionsSlice with tests

**Files:**
- Create: `src/store/redemptionsSlice.ts`, `src/store/__tests__/redemptionsSlice.test.ts`

- [ ] **Step 1: Write `src/store/__tests__/redemptionsSlice.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createRewardsSlice, RewardsSlice } from '../rewardsSlice';
import { createRedemptionsSlice, RedemptionsSlice } from '../redemptionsSlice';
import { createRecordsSlice, RecordsSlice } from '../recordsSlice';
import { createTasksSlice, TasksSlice } from '../tasksSlice';

type Combined = TasksSlice & RecordsSlice & RewardsSlice & RedemptionsSlice;

const makeStore = () =>
  create<Combined>()(immer((...a) => ({
    ...createTasksSlice(...a),
    ...createRecordsSlice(...a),
    ...createRewardsSlice(...a),
    ...createRedemptionsSlice(...a),
  })));

function seedEarn(store: ReturnType<typeof makeStore>, total: number) {
  const t = store.getState().addTask({
    categoryId: 'study', name: 'big', icon: 'x', points: total,
    repeatable: 'daily', timeSlot: 'daytime', active: true,
  });
  store.getState().checkIn(t.id);
}

describe('redemptionsSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('redeem refuses when balance < cost', () => {
    const r = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    expect(store.getState().redeem(r.id)).toBeNull();
  });

  it('redeem creates pending when affordable', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    const red = store.getState().redeem(reward.id);
    expect(red).not.toBeNull();
    expect(red!.status).toBe('pending');
    expect(red!.cost).toBe(100);
    expect(red!.rewardSnapshot.name).toBe('gift');
  });

  it('redeem deducts from balance via selector logic', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    store.getState().redeem(reward.id);
    const totalSpent = store.getState().redemptions
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.cost, 0);
    expect(totalSpent).toBe(100);
  });

  it('fulfillRedemption marks fulfilled', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    const red = store.getState().redeem(reward.id)!;
    store.getState().fulfillRedemption(red.id);
    expect(store.getState().redemptions.find((r) => r.id === red.id)!.status).toBe('fulfilled');
  });

  it('cancelRedemption returns to cancelled', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    const red = store.getState().redeem(reward.id)!;
    store.getState().cancelRedemption(red.id);
    expect(store.getState().redemptions.find((r) => r.id === red.id)!.status).toBe('cancelled');
  });

  it('cannot cancel a fulfilled redemption', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    const red = store.getState().redeem(reward.id)!;
    store.getState().fulfillRedemption(red.id);
    const ok = store.getState().cancelRedemption(red.id);
    expect(ok).toBe(false);
    expect(store.getState().redemptions.find((r) => r.id === red.id)!.status).toBe('fulfilled');
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npx vitest run src/store/__tests__/redemptionsSlice.test.ts
```

- [ ] **Step 3: Write `src/store/redemptionsSlice.ts`**

```typescript
import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { Redemption, Reward, Record } from '@/types';

export interface RedemptionsSlice {
  redemptions: Redemption[];
  redeem: (rewardId: string) => Redemption | null;
  fulfillRedemption: (id: string) => boolean;
  cancelRedemption: (id: string) => boolean;
}

interface WithRewardsRecords {
  rewards: Reward[];
  records: Record[];
}

function computeBalance(records: Record[], redemptions: Redemption[]): number {
  const earned = records.reduce((sum, r) => sum + r.points, 0);
  const spent = redemptions
    .filter((r) => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.cost, 0);
  return earned - spent;
}

export const createRedemptionsSlice: StateCreator<
  RedemptionsSlice & WithRewardsRecords,
  [['zustand/immer', never]],
  [],
  RedemptionsSlice
> = (set, get) => ({
  redemptions: [],
  redeem: (rewardId) => {
    const s = get();
    const reward = s.rewards.find((r) => r.id === rewardId);
    if (!reward || !reward.active) return null;
    const balance = computeBalance(s.records, s.redemptions);
    if (balance < reward.cost) return null;
    const red: Redemption = {
      id: nanoid(),
      rewardId: reward.id,
      rewardSnapshot: { name: reward.name, icon: reward.icon, cost: reward.cost },
      cost: reward.cost,
      timestamp: Date.now(),
      status: 'pending',
    };
    set((st) => { st.redemptions.push(red); });
    return red;
  },
  fulfillRedemption: (id) => {
    let ok = false;
    set((st) => {
      const r = st.redemptions.find((x) => x.id === id);
      if (r && r.status === 'pending') {
        r.status = 'fulfilled';
        ok = true;
      }
    });
    return ok;
  },
  cancelRedemption: (id) => {
    let ok = false;
    set((st) => {
      const r = st.redemptions.find((x) => x.id === id);
      if (r && r.status === 'pending') {
        r.status = 'cancelled';
        ok = true;
      }
    });
    return ok;
  },
});
```

- [ ] **Step 4: Run + commit**

```bash
npx vitest run src/store/__tests__/redemptionsSlice.test.ts
git add -A
git commit -m "feat(store): add redemptionsSlice with TDD"
```

---

## Task 11: milestonesSlice with tests

**Files:**
- Create: `src/store/milestonesSlice.ts`, `src/store/__tests__/milestonesSlice.test.ts`

- [ ] **Step 1: Write `src/store/__tests__/milestonesSlice.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createMilestonesSlice, MilestonesSlice } from '../milestonesSlice';
import { createRecordsSlice, RecordsSlice } from '../recordsSlice';
import { createTasksSlice, TasksSlice } from '../tasksSlice';
import { PRESET_MILESTONES } from '@/constants/presetMilestones';

type Combined = TasksSlice & RecordsSlice & MilestonesSlice;

const makeStore = () =>
  create<Combined>()(immer((...a) => ({
    ...createTasksSlice(...a),
    ...createRecordsSlice(...a),
    ...createMilestonesSlice(...a),
  })));

describe('milestonesSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => {
    store = makeStore();
    store.getState().initPresetMilestones();
  });

  it('initPresetMilestones loads 6 presets', () => {
    expect(store.getState().milestones.length).toBe(PRESET_MILESTONES.length);
  });

  it('checkMilestones returns null below first threshold', () => {
    expect(store.getState().checkMilestones()).toBeNull();
  });

  it('checkMilestones unlocks 100-threshold once earned >= 100', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'big', icon: 'x', points: 100,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    store.getState().checkIn(t.id);
    const m = store.getState().checkMilestones();
    expect(m?.id).toBe('m-100');
    expect(store.getState().unlockedMilestones.find((u) => u.milestoneId === 'm-100')).toBeTruthy();
  });

  it('checkMilestones does not re-unlock same milestone', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'big', icon: 'x', points: 100,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    store.getState().checkIn(t.id);
    store.getState().checkMilestones();
    expect(store.getState().checkMilestones()).toBeNull();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

```bash
npx vitest run src/store/__tests__/milestonesSlice.test.ts
```

- [ ] **Step 3: Write `src/store/milestonesSlice.ts`**

```typescript
import type { StateCreator } from 'zustand';
import type { Milestone, UnlockedMilestone, Record as PointRecord } from '@/types';
import { PRESET_MILESTONES } from '@/constants/presetMilestones';
import { findUnlockable } from '@/utils/milestones';

export interface MilestonesSlice {
  milestones: Milestone[];
  unlockedMilestones: UnlockedMilestone[];
  initPresetMilestones: () => void;
  checkMilestones: () => Milestone | null;
}

interface WithRecords {
  records: PointRecord[];
}

export const createMilestonesSlice: StateCreator<
  MilestonesSlice & WithRecords,
  [['zustand/immer', never]],
  [],
  MilestonesSlice
> = (set, get) => ({
  milestones: [],
  unlockedMilestones: [],
  initPresetMilestones: () => {
    if (get().milestones.length > 0) return;
    set((s) => { s.milestones = [...PRESET_MILESTONES]; });
  },
  checkMilestones: () => {
    const s = get();
    const totalEarned = s.records.reduce((sum, r) => sum + r.points, 0);
    const m = findUnlockable(s.milestones, totalEarned, s.unlockedMilestones);
    if (!m) return null;
    set((st) => {
      st.unlockedMilestones.push({ milestoneId: m.id, unlockedAt: Date.now() });
    });
    return m;
  },
});
```

- [ ] **Step 4: Run + commit**

```bash
npx vitest run src/store/__tests__/milestonesSlice.test.ts
git add -A
git commit -m "feat(store): add milestonesSlice with TDD"
```

---

## Task 12: uiSlice + store composition + selectors + tests

**Files:**
- Create: `src/store/uiSlice.ts`, `src/store/index.ts`, `src/store/selectors.ts`, `src/store/__tests__/selectors.test.ts`

- [ ] **Step 1: Write `src/store/uiSlice.ts`**

```typescript
import type { StateCreator } from 'zustand';
import type { Milestone } from '@/types';

export interface UiSlice {
  recentlyUnlocked: Milestone | null;
  setRecentlyUnlocked: (m: Milestone | null) => void;
}

export const createUiSlice: StateCreator<
  UiSlice,
  [['zustand/immer', never]],
  [],
  UiSlice
> = (set) => ({
  recentlyUnlocked: null,
  setRecentlyUnlocked: (m) => set((s) => { s.recentlyUnlocked = m; }),
});
```

- [ ] **Step 2: Write `src/store/index.ts`**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createChildSlice, ChildSlice } from './childSlice';
import { createTasksSlice, TasksSlice } from './tasksSlice';
import { createRecordsSlice, RecordsSlice } from './recordsSlice';
import { createRewardsSlice, RewardsSlice } from './rewardsSlice';
import { createRedemptionsSlice, RedemptionsSlice } from './redemptionsSlice';
import { createMilestonesSlice, MilestonesSlice } from './milestonesSlice';
import { createUiSlice, UiSlice } from './uiSlice';

export type AppStore =
  & ChildSlice
  & TasksSlice
  & RecordsSlice
  & RewardsSlice
  & RedemptionsSlice
  & MilestonesSlice
  & UiSlice;

export const useStore = create<AppStore>()(
  persist(
    immer((...args) => ({
      ...createChildSlice(...args),
      ...createTasksSlice(...args),
      ...createRecordsSlice(...args),
      ...createRewardsSlice(...args),
      ...createRedemptionsSlice(...args),
      ...createMilestonesSlice(...args),
      ...createUiSlice(...args),
    })),
    {
      name: 'ui-web-child:v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        child: state.child,
        tasks: state.tasks,
        records: state.records,
        rewards: state.rewards,
        redemptions: state.redemptions,
        milestones: state.milestones,
        unlockedMilestones: state.unlockedMilestones,
      }),
      migrate: (persisted) => persisted as AppStore,
    },
  ),
);
```

- [ ] **Step 3: Write `src/store/selectors.ts`**

```typescript
import type { AppStore } from './index';
import { todayKey } from '@/utils/date';
import dayjs from 'dayjs';
import { findNext, findUnlockable } from '@/utils/milestones';

export const selectTotalEarned = (s: AppStore) =>
  s.records.reduce((sum, r) => sum + r.points, 0);

export const selectTotalSpent = (s: AppStore) =>
  s.redemptions.filter((r) => r.status !== 'cancelled').reduce((sum, r) => sum + r.cost, 0);

export const selectBalance = (s: AppStore) =>
  selectTotalEarned(s) - selectTotalSpent(s);

export const selectTodayPoints = (s: AppStore) => {
  const today = todayKey();
  return s.records.filter((r) => r.date === today).reduce((sum, r) => sum + r.points, 0);
};

export const selectTodayCheckedTaskIds = (s: AppStore): Set<string> => {
  const today = todayKey();
  return new Set(s.records.filter((r) => r.date === today).map((r) => r.taskId));
};

export function selectStreak(s: AppStore): number {
  if (s.records.length === 0) return 0;
  const days = new Set(s.records.map((r) => r.date));
  let streak = 0;
  let cursor = dayjs();
  while (days.has(cursor.format('YYYY-MM-DD'))) {
    streak += 1;
    cursor = cursor.subtract(1, 'day');
  }
  return streak;
}

export const selectNextMilestone = (s: AppStore) =>
  findNext(s.milestones, selectTotalEarned(s), s.unlockedMilestones);

export const selectUnlockableMilestone = (s: AppStore) =>
  findUnlockable(s.milestones, selectTotalEarned(s), s.unlockedMilestones);
```

- [ ] **Step 4: Write `src/store/__tests__/selectors.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../index';
import {
  selectTotalEarned, selectTotalSpent, selectBalance, selectTodayPoints, selectStreak,
} from '../selectors';

function reset() {
  useStore.setState({
    child: { name: '小宝', icon: 'bear' },
    tasks: [],
    records: [],
    rewards: [],
    redemptions: [],
    milestones: [],
    unlockedMilestones: [],
    recentlyUnlocked: null,
  } as Partial<ReturnType<typeof useStore.getState>> as never);
}

describe('selectors', () => {
  beforeEach(reset);

  it('selectTotalEarned sums records', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 10,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    useStore.getState().checkIn(t.id);
    expect(selectTotalEarned(useStore.getState())).toBe(10);
  });

  it('selectTotalSpent excludes cancelled', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 100,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    useStore.getState().checkIn(t.id);
    const r = useStore.getState().addReward({ name: 'g', icon: 'g', cost: 50, stock: null, active: true });
    const red = useStore.getState().redeem(r.id)!;
    expect(selectTotalSpent(useStore.getState())).toBe(50);
    useStore.getState().cancelRedemption(red.id);
    expect(selectTotalSpent(useStore.getState())).toBe(0);
  });

  it('selectBalance = earned − spent', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 100,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    useStore.getState().checkIn(t.id);
    const r = useStore.getState().addReward({ name: 'g', icon: 'g', cost: 30, stock: null, active: true });
    useStore.getState().redeem(r.id);
    expect(selectBalance(useStore.getState())).toBe(70);
  });

  it('selectTodayPoints filters by today', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 10,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    useStore.getState().checkIn(t.id);
    expect(selectTodayPoints(useStore.getState())).toBe(10);
  });

  it('selectStreak counts consecutive days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T10:00'));
    const t = useStore.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    useStore.getState().checkIn(t.id);
    vi.setSystemTime(new Date('2026-05-22T10:00'));
    useStore.getState().checkIn(t.id);
    vi.setSystemTime(new Date('2026-05-23T10:00'));
    useStore.getState().checkIn(t.id);
    expect(selectStreak(useStore.getState())).toBe(3);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 5: Run all store tests**

```bash
npx vitest run src/store/__tests__/
```

Expected: All slice + selector tests pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(store): compose persisted store with uiSlice and selectors"
```

---

## Task 13: Icon component + IconPicker

**Files:**
- Create: `src/components/Icon.tsx`, `src/components/IconPicker.tsx`, `src/constants/iconCatalog.ts`

- [ ] **Step 1: Write `src/constants/iconCatalog.ts`**

```typescript
export const ICON_CATALOG = {
  task: [
    'book-open', 'input-numbers', 'pencil', 'books', 'abc', 'memo',
    'sunrise', 'shirt', 'toothbrush', 'bowl-of-food', 'teddy-bear',
    'broom', 'mobile-phone', 'soap', 'sleeping-face',
    'jumping-rope', 'runner', 'flexed-biceps',
    'closed-book', 'mountain', 'trophy',
    'piano', 'guitar', 'paint-brush', 'puzzle',
  ],
  reward: [
    'tv', 'strawberry', 'sticker', 'game-dice', 'bento', 'moon',
    'gift', 'lego', 'movie', 'roller', 'sparkles', 'candy', 'ice-cream',
  ],
  milestone: [
    'rising-star', 'shooting-star', 'medal', 'trophy', 'crown', 'diamond',
  ],
  category: ['study', 'life', 'sport'],
  child: ['bear', 'fox', 'rabbit', 'dinosaur', 'panda', 'unicorn'],
} as const;

export type IconType = keyof typeof ICON_CATALOG;
```

- [ ] **Step 2: Write `src/components/Icon.tsx`**

```typescript
import { motion } from 'framer-motion';
import type { IconType } from '@/constants/iconCatalog';

interface IconProps {
  type: IconType;
  name: string;
  size?: number;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Icon({ type, name, size = 64, animated = false, className, onClick }: IconProps) {
  const src = `/assets/icons/${type === 'category' ? 'categories' : `${type}s`}/${name}.webp`;
  return (
    <motion.img
      src={src}
      width={size}
      height={size}
      whileHover={animated ? { scale: 1.15, rotate: [0, -5, 5, 0] } : undefined}
      whileTap={animated ? { scale: 0.92 } : undefined}
      transition={{ duration: 0.3 }}
      loading="lazy"
      alt={name}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = `/assets/icons/${type === 'category' ? 'categories' : `${type}s`}/_fallback.webp`;
      }}
      onClick={onClick}
      className={className}
      style={{ display: 'inline-block', objectFit: 'contain' }}
    />
  );
}
```

- [ ] **Step 3: Write `src/components/IconPicker.tsx`**

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { ICON_CATALOG, type IconType } from '@/constants/iconCatalog';

interface IconPickerProps {
  open: boolean;
  type: IconType;
  value?: string;
  onPick: (name: string) => void;
  onClose: () => void;
}

export function IconPicker({ open, type, value, onPick, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const items = (ICON_CATALOG[type] as readonly string[]).filter((n) => n.includes(search));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full sm:max-w-md bg-white rounded-t-huge sm:rounded-huge p-6 shadow-soft"
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-3">选个图标</h3>
            <input
              type="text"
              placeholder="搜索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-big border-2 border-gray-200 mb-4 focus:outline-none focus:border-sky-brand"
            />
            <div className="grid grid-cols-6 gap-3 max-h-80 overflow-y-auto">
              {items.map((n) => (
                <button
                  key={n}
                  onClick={() => { onPick(n); onClose(); }}
                  className={`p-2 rounded-big ${value === n ? 'bg-sky-100 ring-2 ring-sky-brand' : 'hover:bg-gray-100'}`}
                >
                  <Icon type={type} name={n} size={48} />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add Icon and IconPicker components"
```

---

## Task 14: Toast + ErrorBoundary + ConfirmModal

**Files:**
- Create: `src/components/Toast.tsx`, `src/components/ToastProvider.tsx`, `src/components/ErrorBoundary.tsx`, `src/components/ConfirmModal.tsx`

- [ ] **Step 1: Write `src/components/Toast.tsx`**

```typescript
import { AnimatePresence, motion } from 'framer-motion';

export type ToastLevel = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  level: ToastLevel;
  message: string;
}

const COLOR: Record<ToastLevel, string> = {
  success: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  error:   'bg-rose-100   text-rose-900   border-rose-300',
  warning: 'bg-amber-100  text-amber-900  border-amber-300',
  info:    'bg-sky-100    text-sky-900    border-sky-300',
};

const ICON: Record<ToastLevel, string> = {
  success: '🎉', error: '⚠️', warning: '🔔', info: 'ℹ️',
};

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  return (
    <motion.div
      layout
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className={`pointer-events-auto px-5 py-3 rounded-big border-2 shadow-soft flex items-center gap-3 ${COLOR[toast.level]}`}
      onClick={onDismiss}
    >
      <span className="text-2xl">{ICON[toast.level]}</span>
      <span className="font-semibold">{toast.message}</span>
    </motion.div>
  );
}

export function ToastList({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/ToastProvider.tsx`**

```typescript
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { nanoid } from 'nanoid';
import { ToastList, type ToastData, type ToastLevel } from './Toast';

interface ToastApi {
  show: (level: ToastLevel, message: string, durationMs?: number) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const dismiss = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);
  const show = useCallback((level: ToastLevel, message: string, durationMs = 3000) => {
    const id = nanoid();
    setToasts((cur) => [...cur, { id, level, message }]);
    setTimeout(() => dismiss(id), durationMs);
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
```

- [ ] **Step 3: Write `src/components/ErrorBoundary.tsx`**

```typescript
import { Component, type ReactNode } from 'react';

interface State { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: unknown) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="text-7xl">😢</div>
          <h1 className="text-2xl font-bold">糟糕，出错啦</h1>
          <p className="text-gray-600">{this.state.error.message}</p>
          <button
            onClick={() => location.reload()}
            className="px-6 py-3 bg-sky-brand text-white rounded-big shadow-3d font-bold"
          >刷新页面</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 4: Write `src/components/ConfirmModal.tsx`**

```typescript
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open, title, body, confirmText = '确定', cancelText = '取消',
  destructive = false, onConfirm, onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-white rounded-huge p-6 shadow-soft max-w-sm w-full"
            initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            {body && <div className="text-gray-700 mb-5">{body}</div>}
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-3 rounded-big bg-gray-100 font-bold">
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-big text-white font-bold shadow-3d ${
                  destructive ? 'bg-rose-500' : 'bg-sky-brand'
                }`}
              >{confirmText}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 5: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add Toast, ErrorBoundary, ConfirmModal"
```

---

## Task 15: ScoreCard + ProgressBar + NavBar

**Files:**
- Create: `src/components/ScoreCard.tsx`, `src/components/ProgressBar.tsx`, `src/components/NavBar.tsx`

- [ ] **Step 1: Write `src/components/ProgressBar.tsx`**

```typescript
import { motion } from 'framer-motion';

interface Props {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: Props) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="w-full">
      {label && <div className="text-sm text-gray-600 mb-1">{label}</div>}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-brand to-grape-brand"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="text-xs text-right text-gray-500 mt-0.5">{value} / {max}</div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/ScoreCard.tsx`**

```typescript
import { motion } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { Icon } from './Icon';
import { useStore } from '@/store';
import {
  selectBalance, selectTotalEarned, selectTodayPoints, selectNextMilestone,
} from '@/store/selectors';

export function ScoreCard() {
  const child = useStore((s) => s.child);
  const balance = useStore(selectBalance);
  const earned = useStore(selectTotalEarned);
  const today = useStore(selectTodayPoints);
  const next = useStore(selectNextMilestone);

  return (
    <motion.div
      layout
      className="bg-gradient-to-br from-cream-brand to-peach-brand rounded-huge p-6 shadow-soft"
    >
      <div className="flex items-center gap-4 mb-4">
        <Icon type="child" name={child.icon} size={72} animated />
        <div>
          <div className="text-sm text-gray-600">嗨</div>
          <div className="text-2xl font-bold">{child.name}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="今日" value={today} color="text-sky-700" />
        <Stat label="累计" value={earned} color="text-gold-700" />
        <Stat label="余额" value={balance} color="text-emerald-700" />
      </div>
      {next && (
        <ProgressBar
          value={earned}
          max={next.threshold}
          label={`距离「${next.name}」还差 ${next.threshold - earned} 分`}
        />
      )}
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/60 rounded-big p-2 text-center">
      <div className="text-xs text-gray-600">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/NavBar.tsx`**

```typescript
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ListChecks, ShoppingBag, BarChart3, Settings } from 'lucide-react';

const ITEMS = [
  { to: '/',          label: '今日',  icon: Home },
  { to: '/history',   label: '明细',  icon: ListChecks },
  { to: '/shop',      label: '商店',  icon: ShoppingBag },
  { to: '/stats',     label: '统计',  icon: BarChart3 },
  { to: '/settings',  label: '设置',  icon: Settings },
];

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 pb-safe">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {ITEMS.map(({ to, label, icon: I }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 ${isActive ? 'text-sky-700' : 'text-gray-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div animate={isActive ? { scale: 1.15 } : { scale: 1 }}>
                  <I size={22} />
                </motion.div>
                <span className="text-xs mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add ScoreCard, ProgressBar, NavBar"
```

---

## Task 16: TaskItem with tests

**Files:**
- Create: `src/components/TaskItem.tsx`, `src/components/__tests__/TaskItem.test.tsx`

- [ ] **Step 1: Write `src/components/TaskItem.tsx`**

```typescript
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { withinUndoWindow, formatHM } from '@/utils/date';
import type { Task, Record as PointRecord } from '@/types';

interface Props {
  task: Task;
  todayRecord?: PointRecord;
  onCheckIn: () => void;
  onUndo: () => void;
}

export function TaskItem({ task, todayRecord, onCheckIn, onUndo }: Props) {
  const done = !!todayRecord;
  const canUndo = done && withinUndoWindow(todayRecord!.timestamp);

  return (
    <motion.div
      layout
      whileHover={!done ? { y: -2, rotateX: 4 } : undefined}
      whileTap={!done ? { scale: 0.97 } : undefined}
      className={`p-4 rounded-big bg-white shadow-soft flex items-center gap-4 cursor-pointer ${done ? 'opacity-70' : ''}`}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
      onClick={!done ? onCheckIn : undefined}
      data-testid={`task-${task.id}`}
    >
      <Icon type="task" name={task.icon} size={56} animated={!done} />
      <div className="flex-1">
        <div className="font-bold text-lg">{task.name}</div>
        <div className="text-sm text-gray-500">+{task.points} 分</div>
        {done && (
          <div className="text-xs text-emerald-600 mt-1">
            已完成 ✅ {formatHM(todayRecord!.timestamp)}
          </div>
        )}
      </div>
      {!done && (
        <button
          className="px-4 py-2 rounded-big bg-sky-brand text-white font-bold shadow-3d"
          aria-label="check in"
        >打卡</button>
      )}
      {done && canUndo && (
        <button
          onClick={(e) => { e.stopPropagation(); onUndo(); }}
          className="text-xs text-gray-500 underline"
          aria-label="undo"
        >撤销</button>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Write `src/components/__tests__/TaskItem.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '../TaskItem';
import { makeTask, makeRecord } from '../../../test/factories';

describe('TaskItem', () => {
  it('renders task name and points', () => {
    const t = makeTask({ name: '刷牙', points: 3 });
    render(<TaskItem task={t} onCheckIn={() => {}} onUndo={() => {}} />);
    expect(screen.getByText('刷牙')).toBeInTheDocument();
    expect(screen.getByText('+3 分')).toBeInTheDocument();
  });

  it('shows 打卡 button when not done', () => {
    const t = makeTask();
    const onCheckIn = vi.fn();
    render(<TaskItem task={t} onCheckIn={onCheckIn} onUndo={() => {}} />);
    fireEvent.click(screen.getByLabelText('check in'));
    expect(onCheckIn).toHaveBeenCalled();
  });

  it('shows undo when done within window', () => {
    const t = makeTask();
    const r = makeRecord({ taskId: t.id, timestamp: Date.now() });
    const onUndo = vi.fn();
    render(<TaskItem task={t} todayRecord={r} onCheckIn={() => {}} onUndo={onUndo} />);
    fireEvent.click(screen.getByLabelText('undo'));
    expect(onUndo).toHaveBeenCalled();
  });

  it('hides undo after window expires', () => {
    const t = makeTask();
    const r = makeRecord({ taskId: t.id, timestamp: Date.now() - 10 * 60 * 1000 });
    render(<TaskItem task={t} todayRecord={r} onCheckIn={() => {}} onUndo={() => {}} />);
    expect(screen.queryByLabelText('undo')).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests + commit**

```bash
npx vitest run src/components/__tests__/TaskItem.test.tsx
git add -A
git commit -m "feat: add TaskItem with tests"
```

---

## Task 17: ShopCard with tests

**Files:**
- Create: `src/components/ShopCard.tsx`, `src/components/__tests__/ShopCard.test.tsx`

- [ ] **Step 1: Write `src/components/ShopCard.tsx`**

```typescript
import { motion } from 'framer-motion';
import { Icon } from './Icon';
import type { Reward } from '@/types';

interface Props {
  reward: Reward;
  balance: number;
  onRedeem: () => void;
}

export function ShopCard({ reward, balance, onRedeem }: Props) {
  const canAfford = balance >= reward.cost;
  const tier =
    reward.cost >= 500 ? 'gold' :
    reward.cost >= 100 ? 'silver' : 'wood';
  const TIER_BG: Record<typeof tier, string> = {
    wood:   'from-amber-100 to-amber-200',
    silver: 'from-gray-100 to-gray-200',
    gold:   'from-yellow-100 to-yellow-200',
  };
  return (
    <motion.div
      layout
      whileHover={canAfford ? { y: -4 } : undefined}
      className={`rounded-big p-4 shadow-soft bg-gradient-to-br ${TIER_BG[tier]} flex flex-col items-center text-center gap-2`}
      data-testid={`reward-${reward.id}`}
    >
      <Icon type="reward" name={reward.icon} size={72} animated={canAfford} />
      <div className="font-bold">{reward.name}</div>
      <div className="text-sm text-gray-700">{reward.cost} 分</div>
      <button
        disabled={!canAfford}
        onClick={onRedeem}
        className={`w-full py-2 rounded-big font-bold ${
          canAfford ? 'bg-sky-brand text-white shadow-3d' : 'bg-gray-200 text-gray-400'
        }`}
        aria-label={canAfford ? 'redeem' : 'insufficient'}
      >
        {canAfford ? '兑换' : `还差 ${reward.cost - balance} 分`}
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 2: Write `src/components/__tests__/ShopCard.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShopCard } from '../ShopCard';
import { makeReward } from '../../../test/factories';

describe('ShopCard', () => {
  it('enables redeem when affordable', () => {
    const reward = makeReward({ cost: 50 });
    const onRedeem = vi.fn();
    render(<ShopCard reward={reward} balance={100} onRedeem={onRedeem} />);
    fireEvent.click(screen.getByLabelText('redeem'));
    expect(onRedeem).toHaveBeenCalled();
  });

  it('disables and shows "还差 X 分" when not affordable', () => {
    const reward = makeReward({ cost: 100 });
    render(<ShopCard reward={reward} balance={40} onRedeem={() => {}} />);
    const btn = screen.getByLabelText('insufficient') as HTMLButtonElement;
    expect(btn).toBeDisabled();
    expect(btn.textContent).toContain('还差 60');
  });
});
```

- [ ] **Step 3: Run + commit**

```bash
npx vitest run src/components/__tests__/ShopCard.test.tsx
git add -A
git commit -m "feat: add ShopCard with tests"
```

---

## Task 18: TaskForm + RewardForm

**Files:**
- Create: `src/components/TaskForm.tsx`, `src/components/RewardForm.tsx`

- [ ] **Step 1: Write `src/components/TaskForm.tsx`**

```typescript
import { useState } from 'react';
import { Icon } from './Icon';
import { IconPicker } from './IconPicker';
import { PRESET_CATEGORIES } from '@/constants/categories';
import type { Task, CategoryId, RepeatType, TimeSlot } from '@/types';

type FormData = Omit<Task, 'id' | 'createdAt'>;

interface Props {
  initial?: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

const TIME_SLOTS: { id: TimeSlot; label: string }[] = [
  { id: 'morning', label: '早晨' },
  { id: 'daytime', label: '白天' },
  { id: 'evening', label: '晚间' },
];

export function TaskForm({ initial, onSave, onCancel }: Props) {
  const [data, setData] = useState<FormData>(initial ?? {
    categoryId: 'study',
    name: '',
    icon: 'book-open',
    points: 5,
    repeatable: 'daily',
    timeSlot: 'daytime',
    active: true,
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const valid = data.name.trim().length >= 1 && data.points >= 1 && data.points <= 100;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1">任务名</label>
        <input
          type="text"
          value={data.name}
          maxLength={20}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200 focus:border-sky-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">分类</label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setData({ ...data, categoryId: c.id as CategoryId })}
              className={`p-3 rounded-big border-2 ${
                data.categoryId === c.id ? 'border-sky-brand bg-sky-50' : 'border-gray-200'
              }`}
            >{c.name}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">图标</label>
        <button onClick={() => setPickerOpen(true)} className="flex items-center gap-3 p-3 rounded-big border-2 border-gray-200">
          <Icon type="task" name={data.icon} size={48} />
          <span className="text-gray-600">点击更换</span>
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">分数</label>
        <input
          type="number"
          min={1}
          max={100}
          value={data.points}
          onChange={(e) => setData({ ...data, points: Number(e.target.value) || 1 })}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200 focus:border-sky-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">重复</label>
        <div className="grid grid-cols-2 gap-2">
          {(['daily', 'once'] as RepeatType[]).map((r) => (
            <button
              key={r}
              onClick={() => setData({ ...data, repeatable: r })}
              className={`py-2 rounded-big border-2 ${
                data.repeatable === r ? 'border-sky-brand bg-sky-50' : 'border-gray-200'
              }`}
            >{r === 'daily' ? '每日' : '一次性'}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">时段</label>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((t) => (
            <button
              key={t.id}
              onClick={() => setData({ ...data, timeSlot: t.id })}
              className={`py-2 rounded-big border-2 ${
                data.timeSlot === t.id ? 'border-sky-brand bg-sky-50' : 'border-gray-200'
              }`}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {data.repeatable === 'once' && (
        <div>
          <label className="block text-sm font-bold mb-1">每周可打卡次数</label>
          <input
            type="number"
            min={1}
            max={7}
            value={data.weeklyLimit ?? 1}
            onChange={(e) => setData({ ...data, weeklyLimit: Number(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-big border-2 border-gray-200"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-big bg-gray-100 font-bold">取消</button>
        <button
          disabled={!valid}
          onClick={() => onSave(data)}
          className={`flex-1 py-3 rounded-big text-white font-bold shadow-3d ${
            valid ? 'bg-sky-brand' : 'bg-gray-300'
          }`}
        >保存</button>
      </div>

      <IconPicker
        open={pickerOpen}
        type="task"
        value={data.icon}
        onPick={(name) => setData({ ...data, icon: name })}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/RewardForm.tsx`**

```typescript
import { useState } from 'react';
import { Icon } from './Icon';
import { IconPicker } from './IconPicker';
import type { Reward } from '@/types';

type FormData = Omit<Reward, 'id' | 'createdAt'>;

interface Props {
  initial?: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

export function RewardForm({ initial, onSave, onCancel }: Props) {
  const [data, setData] = useState<FormData>(initial ?? {
    name: '',
    icon: 'gift',
    cost: 50,
    stock: null,
    active: true,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const valid = data.name.trim().length >= 1 && data.cost >= 1;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1">奖励名</label>
        <input
          type="text"
          value={data.name}
          maxLength={20}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200 focus:border-sky-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">图标</label>
        <button onClick={() => setPickerOpen(true)} className="flex items-center gap-3 p-3 rounded-big border-2 border-gray-200">
          <Icon type="reward" name={data.icon} size={48} />
          <span className="text-gray-600">点击更换</span>
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">兑换分数</label>
        <input
          type="number"
          min={1}
          max={9999}
          value={data.cost}
          onChange={(e) => setData({ ...data, cost: Number(e.target.value) || 1 })}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-1">
          <input
            type="checkbox"
            checked={data.stock === null}
            onChange={(e) => setData({ ...data, stock: e.target.checked ? null : 1 })}
          />
          无限量
        </label>
        {data.stock !== null && (
          <input
            type="number"
            min={1}
            value={data.stock}
            onChange={(e) => setData({ ...data, stock: Number(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-big border-2 border-gray-200 mt-2"
          />
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-big bg-gray-100 font-bold">取消</button>
        <button
          disabled={!valid}
          onClick={() => onSave(data)}
          className={`flex-1 py-3 rounded-big text-white font-bold shadow-3d ${
            valid ? 'bg-sky-brand' : 'bg-gray-300'
          }`}
        >保存</button>
      </div>

      <IconPicker
        open={pickerOpen}
        type="reward"
        value={data.icon}
        onPick={(name) => setData({ ...data, icon: name })}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
```

- [ ] **Step 3: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add TaskForm and RewardForm"
```

---

## Task 19: 3D scenes (Mascot, Milestone, TreasureChest) with fallback

**Files:**
- Create: `src/components/scenes/MascotScene.tsx`, `src/components/scenes/MilestoneScene.tsx`, `src/components/scenes/TreasureChestScene.tsx`

Scenes use placeholder geometry (sphere / box / torus). User can swap in actual glb models in `public/assets/models/` later. Each scene auto-falls-back to a 2D Icon when device is low-tier.

- [ ] **Step 1: Write `src/components/scenes/MascotScene.tsx`**

```typescript
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { Mesh } from 'three';
import { isLowTierDevice } from '@/utils/deviceTier';
import { Icon } from '@/components/Icon';

function BearBlob() {
  const ref = useRef<Mesh>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.4;
    ref.current.position.y = Math.sin(performance.now() * 0.002) * 0.1;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#A0522D" roughness={0.5} />
    </mesh>
  );
}

export function MascotScene({ size = 120 }: { size?: number }) {
  if (isLowTierDevice()) {
    return <Icon type="child" name="bear" size={size} animated />;
  }
  return (
    <div style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={1} />
        <Suspense fallback={null}>
          <BearBlob />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/scenes/MilestoneScene.tsx`**

```typescript
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, Suspense } from 'react';
import { Mesh } from 'three';
import type { Milestone } from '@/types';
import { Icon } from '@/components/Icon';
import { isLowTierDevice } from '@/utils/deviceTier';

function SpinningBadge() {
  const ref = useRef<Mesh>(null!);
  useFrame((_, dt) => { ref.current.rotation.y += dt * 2; });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1, 0.3, 16, 64]} />
      <meshStandardMaterial color="#FCD34D" metalness={0.9} roughness={0.2} />
    </mesh>
  );
}

interface Props {
  milestone: Milestone | null;
  onClose: () => void;
}

export function MilestoneScene({ milestone, onClose }: Props) {
  useEffect(() => {
    if (!milestone) return;
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, [milestone, onClose]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/70"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
            className="flex flex-col items-center gap-4"
          >
            {isLowTierDevice() ? (
              <Icon type="milestone" name={milestone.icon} size={180} animated />
            ) : (
              <div style={{ width: 220, height: 220 }}>
                <Canvas camera={{ position: [0, 0, 4] }}>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[3, 3, 3]} intensity={1.2} />
                  <Suspense fallback={null}><SpinningBadge /></Suspense>
                </Canvas>
              </div>
            )}
            <h2 className="text-3xl font-bold text-white">🎉 {milestone.name} 解锁！</h2>
            <p className="text-white/80">{milestone.description}</p>
            <button onClick={onClose} className="mt-3 px-6 py-2 bg-white text-gray-900 rounded-big font-bold">
              太棒了
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Write `src/components/scenes/TreasureChestScene.tsx`**

```typescript
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/Icon';

interface Props {
  open: boolean;
  rewardName: string;
  rewardIcon: string;
  onClose: () => void;
}

export function TreasureChestScene({ open, rewardName, rewardIcon, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.4, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gold-brand to-peach-brand rounded-huge p-8 text-center shadow-soft"
          >
            <div className="text-7xl mb-2">🎁</div>
            <Icon type="reward" name={rewardIcon} size={120} animated />
            <h2 className="text-2xl font-bold mt-3">兑换成功！</h2>
            <p className="text-gray-700">{rewardName}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add 3D scenes (Mascot, Milestone, TreasureChest) with low-tier fallback"
```

---

## Task 20: useDayChange + useBootstrap hooks

**Files:**
- Create: `src/hooks/useDayChange.ts`, `src/hooks/useBootstrap.ts`

- [ ] **Step 1: Write `src/hooks/useDayChange.ts`**

```typescript
import { useEffect, useState } from 'react';
import { todayKey } from '@/utils/date';

export function useDayChange(): string {
  const [day, setDay] = useState(todayKey());
  useEffect(() => {
    const id = setInterval(() => {
      const t = todayKey();
      setDay((cur) => (cur === t ? cur : t));
    }, 60_000);
    return () => clearInterval(id);
  }, []);
  return day;
}
```

- [ ] **Step 2: Write `src/hooks/useBootstrap.ts`**

```typescript
import { useEffect } from 'react';
import { useStore } from '@/store';

export function useBootstrap() {
  useEffect(() => {
    const s = useStore.getState();
    if (s.tasks.length === 0) s.restorePresetTasks();
    if (s.rewards.length === 0) s.restorePresetRewards();
    if (s.milestones.length === 0) s.initPresetMilestones();
  }, []);
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add useDayChange and useBootstrap hooks"
```

---

## Task 21: App shell + routing

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Write `src/App.tsx`**

```typescript
import { Routes, Route } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MilestoneScene } from '@/components/scenes/MilestoneScene';
import { useStore } from '@/store';
import { useBootstrap } from '@/hooks/useBootstrap';
import { TodayPage } from '@/pages/TodayPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ShopPage } from '@/pages/ShopPage';
import { StatsPage } from '@/pages/StatsPage';
import { SettingsPage } from '@/pages/SettingsPage';

export default function App() {
  useBootstrap();
  const unlocked = useStore((s) => s.recentlyUnlocked);
  const setUnlocked = useStore((s) => s.setRecentlyUnlocked);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="max-w-md mx-auto pb-20 min-h-screen">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
          </Routes>
          <NavBar />
          <MilestoneScene milestone={unlocked} onClose={() => setUnlocked(null)} />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 2: Commit (no typecheck yet — pages don't exist)**

```bash
git add -A
git commit -m "feat: wire App shell with router, toast, error boundary"
```

---

## Task 22: TodayPage

**Files:**
- Create: `src/pages/TodayPage.tsx`

- [ ] **Step 1: Write `src/pages/TodayPage.tsx`**

```typescript
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScoreCard } from '@/components/ScoreCard';
import { TaskItem } from '@/components/TaskItem';
import { useStore } from '@/store';
import { selectTodayCheckedTaskIds } from '@/store/selectors';
import { useDayChange } from '@/hooks/useDayChange';
import { useToast } from '@/components/ToastProvider';
import type { TimeSlot, Task } from '@/types';

const SLOTS: { id: TimeSlot; label: string; emoji: string }[] = [
  { id: 'morning', label: '早晨', emoji: '🌅' },
  { id: 'daytime', label: '白天', emoji: '☀️' },
  { id: 'evening', label: '晚间', emoji: '🌙' },
];

export function TodayPage() {
  useDayChange();
  const tasks = useStore((s) => s.tasks);
  const records = useStore((s) => s.records);
  const checkedIds = useStore(selectTodayCheckedTaskIds);
  const checkIn = useStore((s) => s.checkIn);
  const undo = useStore((s) => s.undoRecord);
  const checkMilestones = useStore((s) => s.checkMilestones);
  const setUnlocked = useStore((s) => s.setRecentlyUnlocked);
  const toast = useToast();

  const grouped = useMemo(() => {
    const map: Record<TimeSlot, Task[]> = { morning: [], daytime: [], evening: [] };
    for (const t of tasks) {
      if (!t.active) continue;
      map[t.timeSlot].push(t);
    }
    return map;
  }, [tasks]);

  function handleCheckIn(taskId: string, taskName: string, points: number) {
    const r = checkIn(taskId);
    if (!r) {
      toast.show('warning', '今天已经完成过啦');
      return;
    }
    toast.show('success', `${taskName} +${points} 分！`);
    const m = checkMilestones();
    if (m) setUnlocked(m);
  }

  function handleUndo(recordId: string) {
    if (undo(recordId)) toast.show('info', '撤销成功');
    else toast.show('warning', '已超过撤销时间');
  }

  return (
    <div className="p-4 space-y-4">
      <ScoreCard />
      {SLOTS.map(({ id, label, emoji }) => (
        grouped[id].length > 0 && (
          <section key={id}>
            <h2 className="text-lg font-bold mb-2">{emoji} {label}</h2>
            <motion.div layout className="space-y-3">
              {grouped[id].map((t) => {
                const isChecked = checkedIds.has(t.id);
                const todayRec = isChecked ? records.find((r) => r.taskId === t.id && r.date === records.find((rr) => rr.taskId === t.id)?.date) : undefined;
                return (
                  <TaskItem
                    key={t.id}
                    task={t}
                    todayRecord={todayRec}
                    onCheckIn={() => handleCheckIn(t.id, t.name, t.points)}
                    onUndo={() => todayRec && handleUndo(todayRec.id)}
                  />
                );
              })}
            </motion.div>
          </section>
        )
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add TodayPage with grouped tasks and check-in flow"
```

---

## Task 23: HistoryPage

**Files:**
- Create: `src/pages/HistoryPage.tsx`

- [ ] **Step 1: Write `src/pages/HistoryPage.tsx`**

```typescript
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useStore } from '@/store';
import { formatHM } from '@/utils/date';
import type { CategoryId } from '@/types';

type Range = 'today' | 'week' | 'month' | 'all';
type Filter = 'all' | CategoryId;

export function HistoryPage() {
  const records = useStore((s) => s.records);
  const removeRecord = useStore((s) => s.removeRecord);
  const [range, setRange] = useState<Range>('week');
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = {
      today: now - 86400_000,
      week: now - 7 * 86400_000,
      month: now - 30 * 86400_000,
      all: 0,
    }[range];
    return records
      .filter((r) => r.timestamp >= cutoff)
      .filter((r) => filter === 'all' || r.taskSnapshot.categoryId === filter)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [records, range, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof records>();
    for (const r of filtered) {
      const list = map.get(r.date) ?? [];
      list.push(r);
      map.set(r.date, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">积分明细</h1>

      <div className="flex gap-2 overflow-x-auto">
        {(['today', 'week', 'month', 'all'] as Range[]).map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              range === r ? 'bg-sky-brand text-white' : 'bg-gray-100'
            }`}
          >{ {today: '今日', week: '本周', month: '本月', all: '全部'}[r] }</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(['all', 'study', 'life', 'sport'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === f ? 'bg-grape-brand text-white' : 'bg-gray-100'
            }`}
          >{ {all:'全部', study:'学习', life:'生活', sport:'运动'}[f] }</button>
        ))}
      </div>

      {grouped.size === 0 && <p className="text-center text-gray-500 py-10">还没有打卡记录</p>}

      {[...grouped.entries()].map(([date, list]) => {
        const sum = list.reduce((acc, r) => acc + r.points, 0);
        return (
          <section key={date}>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>📅 {date}</span>
              <span className="font-bold text-emerald-600">+{sum} 分</span>
            </div>
            <motion.ul layout className="space-y-2">
              {list.map((r) => (
                <li key={r.id}
                  onContextMenu={(e) => { e.preventDefault(); setConfirmDel(r.id); }}
                  className="flex items-center gap-3 p-3 bg-white rounded-big shadow-soft"
                >
                  <Icon type="task" name={r.taskSnapshot.icon} size={40} />
                  <div className="flex-1">
                    <div className="font-bold">{r.taskSnapshot.name}</div>
                    <div className="text-xs text-gray-500">{formatHM(r.timestamp)}</div>
                  </div>
                  <div className="text-emerald-600 font-bold">+{r.points}</div>
                </li>
              ))}
            </motion.ul>
          </section>
        );
      })}

      <ConfirmModal
        open={!!confirmDel}
        title="删除这条记录？"
        body="此操作无法撤销。"
        destructive
        onConfirm={() => { if (confirmDel) removeRecord(confirmDel); setConfirmDel(null); }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add HistoryPage with filters and delete"
```

---

## Task 24: ShopPage

**Files:**
- Create: `src/pages/ShopPage.tsx`

- [ ] **Step 1: Write `src/pages/ShopPage.tsx`**

```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShopCard } from '@/components/ShopCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import { TreasureChestScene } from '@/components/scenes/TreasureChestScene';
import { Icon } from '@/components/Icon';
import { useStore } from '@/store';
import { selectBalance } from '@/store/selectors';
import { useToast } from '@/components/ToastProvider';
import { formatHM, formatDateZh } from '@/utils/date';

export function ShopPage() {
  const balance = useStore(selectBalance);
  const rewards = useStore((s) => s.rewards.filter((r) => r.active));
  const redemptions = useStore((s) => s.redemptions);
  const redeem = useStore((s) => s.redeem);
  const fulfill = useStore((s) => s.fulfillRedemption);
  const cancel = useStore((s) => s.cancelRedemption);
  const toast = useToast();
  const [tab, setTab] = useState<'shop' | 'records'>('shop');
  const [pendingRedeem, setPendingRedeem] = useState<string | null>(null);
  const [chest, setChest] = useState<{ name: string; icon: string } | null>(null);

  function handleRedeem(rewardId: string) {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;
    const ok = redeem(rewardId);
    if (!ok) {
      toast.show('error', '积分不够呢');
      return;
    }
    setChest({ name: reward.name, icon: reward.icon });
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-br from-grape-brand to-sky-brand rounded-huge p-5 text-white shadow-soft">
        <div className="text-sm opacity-90">可用积分</div>
        <div className="text-4xl font-bold">{balance}</div>
      </div>

      <div className="flex gap-2">
        {(['shop', 'records'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-big font-bold ${
              tab === t ? 'bg-sky-brand text-white' : 'bg-white shadow-soft'
            }`}
          >{t === 'shop' ? '可兑换' : '兑换记录'}</button>
        ))}
      </div>

      {tab === 'shop' && (
        <motion.div layout className="grid grid-cols-2 gap-3">
          {rewards.map((r) => (
            <ShopCard
              key={r.id}
              reward={r}
              balance={balance}
              onRedeem={() => setPendingRedeem(r.id)}
            />
          ))}
        </motion.div>
      )}

      {tab === 'records' && (
        <ul className="space-y-2">
          {[...redemptions].sort((a, b) => b.timestamp - a.timestamp).map((r) => (
            <li key={r.id} className="p-3 bg-white rounded-big shadow-soft flex items-center gap-3">
              <Icon type="reward" name={r.rewardSnapshot.icon} size={44} />
              <div className="flex-1">
                <div className="font-bold">{r.rewardSnapshot.name}</div>
                <div className="text-xs text-gray-500">
                  {formatDateZh(new Date(r.timestamp).toISOString().slice(0, 10))} {formatHM(r.timestamp)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-rose-500 font-bold">-{r.cost}</div>
                <StatusBadge status={r.status} />
                {r.status === 'pending' && (
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => { fulfill(r.id); toast.show('success', '已发放'); }}
                      className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">发放</button>
                    <button onClick={() => { cancel(r.id); toast.show('info', '已取消'); }}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">取消</button>
                  </div>
                )}
              </div>
            </li>
          ))}
          {redemptions.length === 0 && <p className="text-center text-gray-500 py-10">还没有兑换</p>}
        </ul>
      )}

      <ConfirmModal
        open={!!pendingRedeem}
        title="确定兑换吗？"
        body="兑换后会扣除相应积分。"
        onConfirm={() => { if (pendingRedeem) handleRedeem(pendingRedeem); setPendingRedeem(null); }}
        onCancel={() => setPendingRedeem(null)}
      />

      <TreasureChestScene
        open={!!chest}
        rewardName={chest?.name ?? ''}
        rewardIcon={chest?.icon ?? 'gift'}
        onClose={() => setChest(null)}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'fulfilled' | 'cancelled' }) {
  const cfg = {
    pending:   { txt: '待发放', cls: 'bg-amber-100 text-amber-700' },
    fulfilled: { txt: '已发放', cls: 'bg-emerald-100 text-emerald-700' },
    cancelled: { txt: '已取消', cls: 'bg-gray-100 text-gray-500' },
  }[status];
  return <span className={`text-xs px-2 py-0.5 rounded ${cfg.cls}`}>{cfg.txt}</span>;
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add ShopPage with redeem and records tabs"
```

---

## Task 25: StatsPage

**Files:**
- Create: `src/pages/StatsPage.tsx`

- [ ] **Step 1: Write `src/pages/StatsPage.tsx`**

```typescript
import { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { useStore } from '@/store';
import {
  selectTotalEarned, selectStreak, selectTodayPoints,
} from '@/store/selectors';
import type { CategoryId } from '@/types';

const CATEGORY_COLOR: Record<CategoryId, string> = {
  study: '#7DD3FC',
  life:  '#FCD34D',
  sport: '#A7F3D0',
};

export function StatsPage() {
  const records = useStore((s) => s.records);
  const unlockedCount = useStore((s) => s.unlockedMilestones.length);
  const streak = useStore(selectStreak);
  const earned = useStore(selectTotalEarned);
  const today = useStore(selectTodayPoints);

  const last7Days = useMemo(() => {
    const arr: { date: string; label: string; points: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day');
      const key = d.format('YYYY-MM-DD');
      const points = records.filter((r) => r.date === key).reduce((s, r) => s + r.points, 0);
      arr.push({ date: key, label: d.format('M/D'), points });
    }
    return arr;
  }, [records]);

  const thisWeekByCategory = useMemo(() => {
    const start = dayjs().startOf('isoWeek').valueOf();
    const totals: Record<CategoryId, number> = { study: 0, life: 0, sport: 0 };
    for (const r of records) {
      if (r.timestamp >= start) totals[r.taskSnapshot.categoryId] += r.points;
    }
    return [
      { name: '学习', value: totals.study, color: CATEGORY_COLOR.study },
      { name: '生活', value: totals.life,  color: CATEGORY_COLOR.life },
      { name: '运动', value: totals.sport, color: CATEGORY_COLOR.sport },
    ].filter((x) => x.value > 0);
  }, [records]);

  const last30Cumulative = useMemo(() => {
    const arr: { date: string; total: number }[] = [];
    let cum = 0;
    const start = dayjs().subtract(29, 'day');
    for (let i = 0; i < 30; i++) {
      const d = start.add(i, 'day');
      const key = d.format('YYYY-MM-DD');
      cum += records.filter((r) => r.date === key).reduce((s, r) => s + r.points, 0);
      arr.push({ date: d.format('M/D'), total: cum });
    }
    return arr;
  }, [records]);

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-2xl font-bold">数据看看看</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card label="连续打卡" value={`${streak} 天 🔥`} />
        <Card label="徽章数"   value={`${unlockedCount} 🏅`} />
        <Card label="本周得分" value={`${last7Days.reduce((s, d) => s + d.points, 0)}`} />
        <Card label="累计 / 今日" value={`${earned} / ${today}`} />
      </div>

      <Section title="近 7 天每日得分">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7Days}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="points" fill="#7DD3FC" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="本周分类占比">
        {thisWeekByCategory.length === 0 ? <p className="text-gray-500 text-center py-10">本周还没打卡</p> : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={thisWeekByCategory} dataKey="value" nameKey="name" outerRadius={80} label>
                {thisWeekByCategory.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Section>

      <Section title="近 30 天累计趋势">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={last30Cumulative}>
            <XAxis dataKey="date" interval={4} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#C4B5FD" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-big p-3 shadow-soft">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-huge p-4 shadow-soft">
      <h2 className="font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add StatsPage with 3 Recharts visualizations"
```

---

## Task 26: SettingsPage - ChildSection + TasksSection

**Files:**
- Create: `src/pages/SettingsPage/index.tsx`, `src/pages/SettingsPage/ChildSection.tsx`, `src/pages/SettingsPage/TasksSection.tsx`

- [ ] **Step 1: Write `src/pages/SettingsPage/index.tsx`**

```typescript
import { useState } from 'react';
import { ChildSection } from './ChildSection';
import { TasksSection } from './TasksSection';
import { RewardsSection } from './RewardsSection';
import { DataSection } from './DataSection';

type Tab = 'child' | 'tasks' | 'rewards' | 'data';

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('child');

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">设置</h1>
      <div className="flex gap-2 overflow-x-auto">
        {(['child', 'tasks', 'rewards', 'data'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-big whitespace-nowrap ${
              tab === t ? 'bg-sky-brand text-white' : 'bg-white shadow-soft'
            }`}
          >{ {child:'宝宝', tasks:'任务', rewards:'奖励', data:'数据'}[t] }</button>
        ))}
      </div>

      {tab === 'child' && <ChildSection />}
      {tab === 'tasks' && <TasksSection />}
      {tab === 'rewards' && <RewardsSection />}
      {tab === 'data' && <DataSection />}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/pages/SettingsPage/ChildSection.tsx`**

```typescript
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { IconPicker } from '@/components/IconPicker';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';

export function ChildSection() {
  const child = useStore((s) => s.child);
  const setName = useStore((s) => s.setChildName);
  const setIcon = useStore((s) => s.setChildIcon);
  const setBd   = useStore((s) => s.setChildBirthday);
  const toast = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <section className="space-y-4 bg-white rounded-huge p-4 shadow-soft">
      <div>
        <label className="block text-sm font-bold mb-1">名字</label>
        <input
          type="text"
          value={child.name}
          maxLength={12}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => toast.show('success', '已保存')}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200 focus:border-sky-brand focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">头像</label>
        <button onClick={() => setPickerOpen(true)} className="flex items-center gap-3 p-3 rounded-big border-2 border-gray-200">
          <Icon type="child" name={child.icon} size={64} />
          <span className="text-gray-600">点击更换</span>
        </button>
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">生日</label>
        <input
          type="date"
          value={child.birthday ?? ''}
          onChange={(e) => setBd(e.target.value)}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200"
        />
      </div>
      <IconPicker
        open={pickerOpen}
        type="child"
        value={child.icon}
        onPick={(name) => { setIcon(name); toast.show('success', '头像已更换'); }}
        onClose={() => setPickerOpen(false)}
      />
    </section>
  );
}
```

- [ ] **Step 3: Write `src/pages/SettingsPage/TasksSection.tsx`**

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Copy, Trash2 } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { TaskForm } from '@/components/TaskForm';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';
import type { Task } from '@/types';

export function TasksSection() {
  const tasks = useStore((s) => s.tasks);
  const records = useStore((s) => s.records);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const toggleActive = useStore((s) => s.toggleTaskActive);
  const removeTask = useStore((s) => s.removeTask);
  const restorePreset = useStore((s) => s.restorePresetTasks);
  const toast = useToast();
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  function recordCount(taskId: string) {
    return records.filter((r) => r.taskId === taskId).length;
  }

  return (
    <section className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setEditing('new')}
          className="flex-1 flex items-center justify-center gap-1 py-3 bg-sky-brand text-white rounded-big font-bold shadow-3d"
        ><Plus size={18} /> 新增任务</button>
        <button
          onClick={() => { restorePreset(); toast.show('success', '已补全预设'); }}
          className="px-4 py-3 bg-white rounded-big font-bold shadow-soft"
        >恢复预设</button>
      </div>

      <motion.ul layout className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className={`p-3 bg-white rounded-big shadow-soft flex items-center gap-3 ${!t.active ? 'opacity-50' : ''}`}>
            <Icon type="task" name={t.icon} size={40} />
            <div className="flex-1">
              <div className="font-bold">{t.name}</div>
              <div className="text-xs text-gray-500">+{t.points} · {t.repeatable === 'daily' ? '每日' : '一次性'} · 打过 {recordCount(t.id)} 次</div>
            </div>
            <input type="checkbox" checked={t.active} onChange={() => toggleActive(t.id)} className="w-5 h-5" />
            <button onClick={() => setEditing(t)} aria-label="edit"><Pencil size={18} /></button>
            <button
              onClick={() => addTask({ ...t, name: `${t.name} (副本)` })}
              aria-label="copy"
            ><Copy size={18} /></button>
            <button onClick={() => setDeleting(t)} aria-label="delete" className="text-rose-500"><Trash2 size={18} /></button>
          </li>
        ))}
      </motion.ul>

      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="w-full sm:max-w-md bg-white rounded-t-huge sm:rounded-huge p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold mb-4">{editing === 'new' ? '新增任务' : '编辑任务'}</h3>
              <TaskForm
                initial={editing === 'new' ? undefined : { ...editing }}
                onSave={(data) => {
                  if (editing === 'new') {
                    addTask(data);
                    toast.show('success', '任务已添加');
                  } else {
                    updateTask(editing.id, data);
                    toast.show('success', '已保存');
                  }
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!deleting}
        title="删除任务？"
        body={deleting ? `「${deleting.name}」已打卡 ${recordCount(deleting.id)} 次。删除后历史仍保留。` : ''}
        destructive
        onConfirm={() => { if (deleting) { removeTask(deleting.id); toast.show('info', '已删除'); } setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
```

- [ ] **Step 4: Type-check + commit**

```bash
npm run typecheck
git add -A
git commit -m "feat: add SettingsPage ChildSection and TasksSection"
```

---

## Task 27: SettingsPage - RewardsSection + DataSection

**Files:**
- Create: `src/pages/SettingsPage/RewardsSection.tsx`, `src/pages/SettingsPage/DataSection.tsx`, `src/utils/exportImport.ts`

- [ ] **Step 1: Write `src/utils/exportImport.ts`**

```typescript
import { z } from 'zod';
import type { AppStore } from '@/store';

const ExportSchema = z.object({
  version: z.number(),
  exportedAt: z.number(),
  child: z.any(),
  tasks: z.array(z.any()),
  records: z.array(z.any()),
  rewards: z.array(z.any()),
  redemptions: z.array(z.any()),
  milestones: z.array(z.any()),
  unlockedMilestones: z.array(z.any()),
});

export type ExportPayload = z.infer<typeof ExportSchema>;

export function buildExport(state: AppStore): ExportPayload {
  return {
    version: 1,
    exportedAt: Date.now(),
    child: state.child,
    tasks: state.tasks,
    records: state.records,
    rewards: state.rewards,
    redemptions: state.redemptions,
    milestones: state.milestones,
    unlockedMilestones: state.unlockedMilestones,
  };
}

export function parseImport(json: string): ExportPayload {
  const parsed = JSON.parse(json);
  return ExportSchema.parse(parsed);
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Write `src/pages/SettingsPage/RewardsSection.tsx`**

```typescript
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Copy, Trash2 } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { RewardForm } from '@/components/RewardForm';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';
import type { Reward } from '@/types';

export function RewardsSection() {
  const rewards = useStore((s) => s.rewards);
  const addReward = useStore((s) => s.addReward);
  const updateReward = useStore((s) => s.updateReward);
  const toggleActive = useStore((s) => s.toggleRewardActive);
  const removeReward = useStore((s) => s.removeReward);
  const restorePreset = useStore((s) => s.restorePresetRewards);
  const redemptions = useStore((s) => s.redemptions);
  const toast = useToast();
  const [editing, setEditing] = useState<Reward | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Reward | null>(null);

  function redeemCount(rewardId: string) {
    return redemptions.filter((r) => r.rewardId === rewardId).length;
  }

  return (
    <section className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setEditing('new')}
          className="flex-1 flex items-center justify-center gap-1 py-3 bg-sky-brand text-white rounded-big font-bold shadow-3d"
        ><Plus size={18} /> 新增奖励</button>
        <button onClick={() => { restorePreset(); toast.show('success', '已补全预设'); }}
          className="px-4 py-3 bg-white rounded-big font-bold shadow-soft"
        >恢复预设</button>
      </div>

      <motion.ul layout className="space-y-2">
        {rewards.map((r) => (
          <li key={r.id} className={`p-3 bg-white rounded-big shadow-soft flex items-center gap-3 ${!r.active ? 'opacity-50' : ''}`}>
            <Icon type="reward" name={r.icon} size={40} />
            <div className="flex-1">
              <div className="font-bold">{r.name}</div>
              <div className="text-xs text-gray-500">{r.cost} 分 · 被兑过 {redeemCount(r.id)} 次</div>
            </div>
            <input type="checkbox" checked={r.active} onChange={() => toggleActive(r.id)} className="w-5 h-5" />
            <button onClick={() => setEditing(r)} aria-label="edit"><Pencil size={18} /></button>
            <button onClick={() => addReward({ ...r, name: `${r.name} (副本)` })} aria-label="copy"><Copy size={18} /></button>
            <button onClick={() => setDeleting(r)} aria-label="delete" className="text-rose-500"><Trash2 size={18} /></button>
          </li>
        ))}
      </motion.ul>

      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="w-full sm:max-w-md bg-white rounded-t-huge sm:rounded-huge p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold mb-4">{editing === 'new' ? '新增奖励' : '编辑奖励'}</h3>
              <RewardForm
                initial={editing === 'new' ? undefined : { ...editing }}
                onSave={(data) => {
                  if (editing === 'new') {
                    addReward(data);
                    toast.show('success', '奖励已添加');
                  } else {
                    updateReward(editing.id, data);
                    toast.show('success', '已保存');
                  }
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!deleting}
        title="删除奖励？"
        body={deleting ? `「${deleting.name}」已被兑换 ${redeemCount(deleting.id)} 次。历史保留。` : ''}
        destructive
        onConfirm={() => { if (deleting) { removeReward(deleting.id); toast.show('info', '已删除'); } setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
```

- [ ] **Step 3: Write `src/pages/SettingsPage/DataSection.tsx`**

```typescript
import { useRef, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';
import { buildExport, parseImport, downloadJson } from '@/utils/exportImport';

export function DataSection() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmText, setConfirmText] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  function handleExport() {
    const state = useStore.getState();
    const payload = buildExport(state);
    downloadJson(`ui-web-child-backup-${new Date().toISOString().slice(0, 10)}.json`, payload);
    toast.show('success', '已导出');
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        const payload = parseImport(txt);
        useStore.setState((s) => ({
          ...s,
          child: payload.child,
          tasks: payload.tasks,
          records: payload.records,
          rewards: payload.rewards,
          redemptions: payload.redemptions,
          milestones: payload.milestones,
          unlockedMilestones: payload.unlockedMilestones,
        }));
        toast.show('success', '导入成功');
      } catch (err) {
        toast.show('error', '文件格式不对');
        console.error(err);
      }
    });
    e.target.value = '';
  }

  function handleClear() {
    if (confirmText !== '确认清空') {
      toast.show('error', '请输入"确认清空"');
      return;
    }
    localStorage.removeItem('ui-web-child:v1');
    location.reload();
  }

  return (
    <section className="space-y-3">
      <button onClick={handleExport}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-big font-bold shadow-3d"
      ><Download size={18} /> 导出数据 (JSON)</button>

      <label className="w-full flex items-center justify-center gap-2 py-3 bg-sky-brand text-white rounded-big font-bold shadow-3d cursor-pointer">
        <Upload size={18} /> 导入数据
        <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
      </label>

      <button onClick={() => setConfirmClear(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-big font-bold shadow-3d"
      ><Trash2 size={18} /> 清空全部数据</button>

      <ConfirmModal
        open={confirmClear}
        title="确定清空全部数据？"
        body={
          <div>
            <p className="mb-2 text-rose-600">此操作无法撤销！</p>
            <p className="mb-2">请输入「确认清空」继续：</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded border-2 border-gray-300"
            />
          </div>
        }
        destructive
        confirmText="清空"
        onConfirm={handleClear}
        onCancel={() => { setConfirmClear(false); setConfirmText(''); }}
      />
    </section>
  );
}
```

- [ ] **Step 4: Type-check + run full test suite + commit**

```bash
npm run typecheck
npm run test:run
git add -A
git commit -m "feat: complete SettingsPage with rewards and data management"
```

---

## Task 28: Bootstrap polish, README, manual smoke test

**Files:**
- Create: `README.md`
- Modify: `src/main.tsx` (add localStorage availability guard)

- [ ] **Step 1: Add localStorage guard in `src/main.tsx`**

Replace contents of `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/globals.css';

function checkStorage(): string | null {
  try {
    const k = '__ui_web_child_storage_test';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return null;
  } catch {
    return '浏览器存储不可用，请打开 cookies / localStorage 后重试';
  }
}

const root = document.getElementById('root')!;
const err = checkStorage();
if (err) {
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:system-ui;">
      <div style="font-size:64px;">😢</div>
      <h1 style="margin-top:8px;">${err}</h1>
    </div>
  `;
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
```

- [ ] **Step 2: Write `README.md`**

```markdown
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
```

- [ ] **Step 3: Final type-check + tests**

```bash
cd /Users/zhouyongdong/ui-web-child
npm run typecheck
npm run test:run
```

Expected: All tests pass, no type errors.

- [ ] **Step 4: Build verifies bundling**

```bash
npm run build
```

Expected: `dist/` produced, no errors.

- [ ] **Step 5: Manual smoke test (run dev, check 12 scenarios)**

Run:
```bash
npm run dev
```

Walk through each checklist item below in the browser at `http://localhost:5173`. Record any failures as new tasks.

1. Open page → see ScoreCard with name "小宝", balance 0, today 0
2. Today tab shows preset tasks grouped by 早晨 / 白天 / 晚间
3. Tap a task → toast "+X 分"; total points update
4. Tap same task again → toast "今天已经完成过啦"
5. Tap undo on a just-checked task → record removed, total updates
6. Wait 5 min → undo button disappears
7. Earn 100 points → MilestoneScene appears with "习惯新星 解锁"
8. Shop tab → see balance; affordable items have 兑换 button
9. Tap 兑换 → confirm → TreasureChestScene → record appears in 兑换记录 tab
10. Mark 已发放 → status badge updates
11. Cancel a pending → balance returns
12. Settings → 任务 → add a new task → appears in Today
13. Settings → 数据 → 导出 → JSON downloads
14. Settings → 数据 → 清空 → type "确认清空" → reload restores presets

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: localStorage guard, README, MVP polish"
```

---

## Self-Review

**Spec coverage:**
- §0 design principles → reflected in store logic (only-add, snapshots, derived balance) ✓
- §1 stack + structure → Tasks 1-2 ✓
- §2 types + presets → Tasks 3-4 ✓
- §3 pages + nav → Tasks 21-27 ✓
- §3.5 3D scenes + theme → Tasks 2, 19 ✓
- §3.6 Icon system → Tasks 13, 17 ✓
- §3.7 custom tasks/rewards UX → Tasks 18, 26-27 ✓
- §4 Zustand + slices + persist + selectors → Tasks 6-12 ✓
- §5 error handling → Tasks 14, 27, 28 (boundaries, toasts, modals, storage check) ✓
- §6 testing → Tasks 5-12, 16-17 (TDD covers store + key components) ✓
- §7 sources cited in spec, not in plan ✓
- §8 MVP scope respected ✓
- §9 constraints (500-line cap, separation of UI/logic/types) → enforced via file structure ✓

**Placeholder scan:** None — every step ships actual code or a real command.

**Type consistency:** All slice signatures, selector names, hook names match across tasks. `checkMilestones`, `initPresetMilestones`, `restorePresetTasks`, `restorePresetRewards`, `redeem`, `fulfillRedemption`, `cancelRedemption`, `undoRecord`, `setRecentlyUnlocked` consistent. `Record` type aliased only where needed to avoid collision with TS built-in `Record`.

**Known gaps (acceptable for MVP):**
- 3D scenes use placeholder geometry (sphere/torus); user supplies actual .glb later
- Icon webp files not bundled — user populates `public/assets/icons/` per README
- Audio system not implemented (spec §3.5 lists as "可关"; deferred without loss of MVP value)
- E2E tests deferred to v1.1 per spec §6
- PWA / offline mode deferred per spec §8.1

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-23-kids-points-system.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
