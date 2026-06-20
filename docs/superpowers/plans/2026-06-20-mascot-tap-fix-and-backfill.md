# Mascot Tap-Through Fix + 补打卡 (Backfill) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the bottom-left mascot from triggering accidental check-ins, and let users backfill (补打卡) a task check-in for any of the last 7 days from the History page.

**Architecture:** The mascot fix is a pure CSS/pointer-events change in one component. Backfill adds an optional `backfilled` flag on `Record`, a date-aware `backfillCheckIn` store action that shares limit logic with `checkIn`, a `selectStreak` tweak so backfilled-only days never repair the streak, and a `BackfillModal` opened from the History page. Backfilled points still count toward totals and milestones.

**Tech Stack:** React 18 + TypeScript, Zustand (immer + persist), dayjs, Framer Motion, Vitest + Testing Library.

---

## Task 1: Fix mascot tap-through

The bottom-left mascot has `pointer-events-none`, so taps pass through to the task card underneath and fire a check-in. Re-enable pointer events on the visible mascot region and absorb the tap.

**Files:**
- Modify: `src/components/MascotCorner.tsx:19-23`

- [ ] **Step 1: Absorb taps on the mascot region**

In `src/components/MascotCorner.tsx`, change the inner animated wrapper (the one holding the `<img>` and streak badge) to capture and swallow clicks. Replace:

```tsx
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-end gap-1"
      >
```

with:

```tsx
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-end gap-1 pointer-events-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
```

The outer `fixed ... pointer-events-none` wrapper stays unchanged, so only the tight mascot+badge area becomes interactive; taps elsewhere still reach task cards.

- [ ] **Step 2: Verify the build typechecks**

Run: `npm run typecheck`
Expected: PASS, no errors.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open `http://localhost:5173`, tap directly on the bottom-left mascot.
Expected: no check-in toast/confetti fires; tapping a task card still checks in normally.

- [ ] **Step 4: Commit**

```bash
git add src/components/MascotCorner.tsx
git commit -m "fix: stop mascot taps from triggering task check-in"
```

---

## Task 2: Add `backfilled` flag and `noonOf` date util

Adds the data-model field and a date helper the store will use to anchor backfilled timestamps to noon of the target day.

**Files:**
- Modify: `src/types/index.ts:48-56`
- Modify: `src/utils/date.ts`
- Test: `src/utils/__tests__/date.test.ts`

- [ ] **Step 1: Add the `backfilled` field to `Record`**

In `src/types/index.ts`, inside the `Record` interface, add the field after `note?: string;`:

```ts
  note?: string;
  /** True when the record was added retroactively via 补打卡. */
  backfilled?: boolean;
```

- [ ] **Step 2: Write the failing test for `noonOf`**

Append to `src/utils/__tests__/date.test.ts`:

```ts
import { noonOf } from '@/utils/date';
import dayjs from 'dayjs';

describe('noonOf', () => {
  it('returns noon of the given date key', () => {
    const ts = noonOf('2026-05-20');
    expect(dayjs(ts).format('YYYY-MM-DD HH:mm:ss')).toBe('2026-05-20 12:00:00');
  });
});
```

(If `describe`/`it`/`expect` are already imported at the top of the file, do not re-import them — only add the `noonOf` and `dayjs` imports if missing.)

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/utils/__tests__/date.test.ts -t "noonOf"`
Expected: FAIL — `noonOf` is not exported.

- [ ] **Step 4: Implement `noonOf`**

Append to `src/utils/date.ts`:

```ts
export function noonOf(dateKey: string): number {
  return dayjs(dateKey).hour(12).minute(0).second(0).millisecond(0).valueOf();
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/utils/__tests__/date.test.ts -t "noonOf"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/utils/date.ts src/utils/__tests__/date.test.ts
git commit -m "feat: add backfilled record flag and noonOf date util"
```

---

## Task 3: Add `backfillCheckIn` store action

Adds the date-aware backfill action and refactors the limit check into a shared helper so `checkIn` and `backfillCheckIn` cannot drift.

**Files:**
- Modify: `src/store/recordsSlice.ts`
- Test: `src/store/__tests__/recordsSlice.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `src/store/__tests__/recordsSlice.test.ts` (add `import dayjs from 'dayjs';` at the top if not present):

```ts
describe('recordsSlice.backfillCheckIn', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('writes a record with target date, noon timestamp, and backfilled flag', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: '朗读', icon: 'book', points: 8,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const r = store.getState().backfillCheckIn(t.id, '2026-05-20');
    expect(r).not.toBeNull();
    expect(r!.date).toBe('2026-05-20');
    expect(r!.backfilled).toBe(true);
    expect(dayjs(r!.timestamp).format('YYYY-MM-DD HH:mm')).toBe('2026-05-20 12:00');
    expect(store.getState().records).toHaveLength(1);
  });

  it('respects dailyLimit for the target day but allows a different day', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    expect(store.getState().backfillCheckIn(t.id, '2026-05-20')).not.toBeNull();
    expect(store.getState().backfillCheckIn(t.id, '2026-05-20')).toBeNull();
    expect(store.getState().backfillCheckIn(t.id, '2026-05-19')).not.toBeNull();
  });

  it('respects weeklyLimit for the target ISO week', () => {
    const t = store.getState().addTask({
      categoryId: 'study', name: 'w', icon: 'x', points: 30,
      repeatable: 'once', weeklyLimit: 1, timeSlot: 'daytime', active: true,
    });
    // 2026-05-20 and 2026-05-21 are in the same ISO week
    expect(store.getState().backfillCheckIn(t.id, '2026-05-20')).not.toBeNull();
    expect(store.getState().backfillCheckIn(t.id, '2026-05-21')).toBeNull();
  });

  it('returns null for unknown or inactive task', () => {
    expect(store.getState().backfillCheckIn('nope', '2026-05-20')).toBeNull();
    const t = store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: false,
    });
    expect(store.getState().backfillCheckIn(t.id, '2026-05-20')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/store/__tests__/recordsSlice.test.ts -t "backfillCheckIn"`
Expected: FAIL — `backfillCheckIn` is not a function.

- [ ] **Step 3: Implement the action with a shared limit helper**

Rewrite `src/store/recordsSlice.ts` to this exact content:

```ts
import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { Record, Task } from '@/types';
import { todayKey, isoWeekKey, withinUndoWindow, noonOf } from '@/utils/date';

export interface RecordsSlice {
  records: Record[];
  checkIn: (taskId: string, note?: string) => Record | null;
  backfillCheckIn: (taskId: string, dateKey: string) => Record | null;
  undoRecord: (id: string) => boolean;
  removeRecord: (id: string) => void;
}

interface WithTasks {
  tasks: Task[];
}

/** True when the task has reached its limit for the day/week containing targetTs. */
function isOverLimit(records: Record[], task: Task, targetDate: string, targetTs: number): boolean {
  if (task.repeatable === 'daily') {
    const limit = task.dailyLimit ?? 1;
    const count = records.filter((r) => r.taskId === task.id && r.date === targetDate).length;
    return count >= limit;
  }
  const limit = task.weeklyLimit ?? 1;
  const week = isoWeekKey(targetTs);
  const count = records.filter(
    (r) => r.taskId === task.id && isoWeekKey(r.timestamp) === week,
  ).length;
  return count >= limit;
}

function buildRecord(
  task: Task,
  date: string,
  timestamp: number,
  opts: { backfilled?: boolean; note?: string } = {},
): Record {
  return {
    id: nanoid(),
    taskId: task.id,
    taskSnapshot: {
      name: task.name,
      icon: task.icon,
      categoryId: task.categoryId,
      points: task.points,
    },
    points: task.points,
    date,
    timestamp,
    note: opts.note,
    ...(opts.backfilled ? { backfilled: true } : {}),
  };
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
    if (isOverLimit(state.records, task, today, now)) return null;

    const record = buildRecord(task, today, now, { note });
    set((s) => { s.records.push(record); });
    return record;
  },
  backfillCheckIn: (taskId, dateKey) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || !task.active) return null;

    const ts = noonOf(dateKey);
    if (isOverLimit(state.records, task, dateKey, ts)) return null;

    const record = buildRecord(task, dateKey, ts, { backfilled: true });
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

- [ ] **Step 4: Run the full recordsSlice suite to verify it passes**

Run: `npx vitest run src/store/__tests__/recordsSlice.test.ts`
Expected: PASS — both the existing `checkIn` tests and the new `backfillCheckIn` tests.

- [ ] **Step 5: Commit**

```bash
git add src/store/recordsSlice.ts src/store/__tests__/recordsSlice.test.ts
git commit -m "feat: add backfillCheckIn store action with shared limit check"
```

---

## Task 4: Streak ignores backfilled-only days

`selectStreak` derives the streak from record dates. Filter out backfilled records so a day with only backfilled entries never repairs the streak; points still count.

**Files:**
- Modify: `src/store/selectors.ts:48-58`
- Test: `src/store/__tests__/selectors.test.ts`

- [ ] **Step 1: Write the failing tests**

In `src/store/__tests__/selectors.test.ts`, add `makeRecord` and `selectTotalEarned` to the imports and add these tests inside the `describe('selectors', ...)` block. Update the imports at the top:

```ts
import {
  selectTotalEarned, selectTotalSpent, selectBalance, selectTodayPoints, selectStreak,
} from '../selectors';
import { makeRecord } from '../../../test/factories';
```

(`selectTotalEarned` is already imported — only add `makeRecord`.)

Then add:

```ts
  it('selectStreak ignores days with only backfilled records', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T10:00'));
    useStore.setState({ records: [
      makeRecord({ date: '2026-05-23' }),
      makeRecord({ date: '2026-05-22', backfilled: true }),
    ] } as never);
    expect(selectStreak(useStore.getState())).toBe(1);
    vi.useRealTimers();
  });

  it('selectStreak still counts a day that also has a non-backfilled record', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-23T10:00'));
    useStore.setState({ records: [
      makeRecord({ date: '2026-05-23', backfilled: true }),
      makeRecord({ date: '2026-05-23' }),
      makeRecord({ date: '2026-05-22' }),
    ] } as never);
    expect(selectStreak(useStore.getState())).toBe(2);
    vi.useRealTimers();
  });

  it('selectTotalEarned includes backfilled points', () => {
    useStore.setState({ records: [
      makeRecord({ points: 10 }),
      makeRecord({ points: 7, backfilled: true }),
    ] } as never);
    expect(selectTotalEarned(useStore.getState())).toBe(17);
  });
```

- [ ] **Step 2: Run the tests to verify the streak ones fail**

Run: `npx vitest run src/store/__tests__/selectors.test.ts -t "backfilled"`
Expected: FAIL — `selectStreak ignores days with only backfilled records` returns 3 instead of 1 (the `selectTotalEarned` test already passes).

- [ ] **Step 3: Implement the filter**

In `src/store/selectors.ts`, change the `days` set inside `selectStreak`. Replace:

```ts
  const days = new Set(s.records.map((r) => r.date));
```

with:

```ts
  const days = new Set(s.records.filter((r) => !r.backfilled).map((r) => r.date));
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/store/__tests__/selectors.test.ts`
Expected: PASS — all selector tests including the new ones.

- [ ] **Step 5: Commit**

```bash
git add src/store/selectors.ts src/store/__tests__/selectors.test.ts
git commit -m "feat: exclude backfilled records from streak calculation"
```

---

## Task 5: BackfillModal component

A bottom-sheet modal with a 7-day chip selector and a tappable list of active tasks. Tapping a task backfills it for the selected day, reusing the milestone unlock flow.

**Files:**
- Create: `src/components/BackfillModal.tsx`
- Test: `src/components/__tests__/BackfillModal.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/BackfillModal.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import dayjs from 'dayjs';
import { BackfillModal } from '../BackfillModal';
import { ToastProvider } from '../ToastProvider';
import { useStore } from '@/store';

function seed() {
  useStore.setState({
    tasks: [], records: [], milestones: [], unlockedMilestones: [], recentlyUnlocked: null,
  } as never);
}

const yesterday = () => dayjs().subtract(1, 'day').format('YYYY-MM-DD');

describe('BackfillModal', () => {
  beforeEach(seed);

  it('backfills the tapped task for the default (yesterday) day', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: '朗读', icon: 'book', points: 8,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    render(<ToastProvider><BackfillModal open onClose={() => {}} /></ToastProvider>);
    fireEvent.click(screen.getByLabelText(`backfill-${t.id}`));
    const recs = useStore.getState().records;
    expect(recs).toHaveLength(1);
    expect(recs[0].backfilled).toBe(true);
    expect(recs[0].date).toBe(yesterday());
  });

  it('adds no record and stays at one when the day is already full', () => {
    const t = useStore.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 5,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    useStore.getState().backfillCheckIn(t.id, yesterday());
    render(<ToastProvider><BackfillModal open onClose={() => {}} /></ToastProvider>);
    fireEvent.click(screen.getByLabelText(`backfill-${t.id}`));
    expect(useStore.getState().records).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/__tests__/BackfillModal.test.tsx`
Expected: FAIL — cannot find module `../BackfillModal`.

- [ ] **Step 3: Implement the component**

Create `src/components/BackfillModal.tsx`:

```tsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dayjs from 'dayjs';
import { Icon } from './Icon';
import { useStore } from '@/store';
import { useToast } from './ToastProvider';

interface Props {
  open: boolean;
  onClose: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function BackfillModal({ open, onClose }: Props) {
  const tasks = useStore((s) => s.tasks);
  const records = useStore((s) => s.records);
  const backfillCheckIn = useStore((s) => s.backfillCheckIn);
  const checkMilestones = useStore((s) => s.checkMilestones);
  const setUnlocked = useStore((s) => s.setRecentlyUnlocked);
  const toast = useToast();

  const days = Array.from({ length: 7 }, (_, i) => dayjs().subtract(i, 'day'));
  const todayStr = dayjs().format('YYYY-MM-DD');
  const [selected, setSelected] = useState(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));

  const activeTasks = tasks.filter((t) => t.active);

  function handleTap(taskId: string, name: string, points: number) {
    const r = backfillCheckIn(taskId, selected);
    if (!r) {
      toast.show('warning', '那天已经完成过啦');
      return;
    }
    toast.show('success', `已补打卡 ${name} +${points}`);
    const m = checkMilestones();
    if (m) setUnlocked(m);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-t-huge p-5 w-full max-w-md max-h-[80vh] overflow-y-auto"
            initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold">补打卡</h3>
              <button onClick={onClose} aria-label="close" className="text-gray-400 text-2xl leading-none px-2">×</button>
            </div>

            <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
              {days.map((d) => {
                const key = d.format('YYYY-MM-DD');
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={`flex flex-col items-center px-3 py-2 rounded-big whitespace-nowrap ${
                      selected === key ? 'bg-sky-brand text-white' : 'bg-gray-100'
                    }`}
                  >
                    <span className="text-xs">{key === todayStr ? '今天' : `周${WEEKDAYS[d.day()]}`}</span>
                    <span className="text-sm font-bold">{d.format('M/D')}</span>
                  </button>
                );
              })}
            </div>

            {activeTasks.length === 0 && (
              <p className="text-center text-gray-500 py-6">还没有任务，去「设置 → 任务」添加吧！</p>
            )}

            <ul className="space-y-2">
              {activeTasks.map((t) => {
                const count = records.filter((r) => r.taskId === t.id && r.date === selected).length;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => handleTap(t.id, t.name, t.points)}
                      aria-label={`backfill-${t.id}`}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-big shadow-soft text-left"
                    >
                      <Icon type="task" name={t.icon} size={40} />
                      <div className="flex-1">
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-gray-500">
                          +{t.points} 分{count > 0 ? ` · 已记 ${count} 次` : ''}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/__tests__/BackfillModal.test.tsx`
Expected: PASS — both tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/BackfillModal.tsx src/components/__tests__/BackfillModal.test.tsx
git commit -m "feat: add BackfillModal for retroactive check-ins"
```

---

## Task 6: Wire 补打卡 button into the History page

Add a button to the History page header that opens the modal.

**Files:**
- Modify: `src/pages/HistoryPage.tsx`

- [ ] **Step 1: Add the import, state, button, and modal**

In `src/pages/HistoryPage.tsx`:

1. Add to the imports near the top (after the existing component imports):

```ts
import { BackfillModal } from '@/components/BackfillModal';
```

2. Add state alongside the existing `useState` hooks (after the `confirmDel` state):

```ts
  const [backfillOpen, setBackfillOpen] = useState(false);
```

3. Replace the heading line:

```tsx
      <h1 className="text-2xl font-bold">积分明细</h1>
```

with a header row that includes the button:

```tsx
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">积分明细</h1>
        <button
          onClick={() => setBackfillOpen(true)}
          className="px-3 py-1.5 rounded-big bg-sky-brand text-white text-sm font-bold shadow-3d"
        >＋ 补打卡</button>
      </div>
```

4. Render the modal just before the closing `</div>` of the page (right after the existing `<ConfirmModal ... />`):

```tsx
      <BackfillModal open={backfillOpen} onClose={() => setBackfillOpen(false)} />
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, open the 明细 page, tap `＋ 补打卡`, pick a past day, tap a task.
Expected: success toast, the record appears under that day in the list, and 连击 (streak) on the Today page is unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/pages/HistoryPage.tsx
git commit -m "feat: open 补打卡 modal from history page"
```

---

## Task 7: Full verification

- [ ] **Step 1: Run the whole suite and typecheck**

Run: `npm run test:run && npm run typecheck`
Expected: all tests PASS, no type errors.

- [ ] **Step 2: Production build sanity**

Run: `npm run build`
Expected: build succeeds, `dist/` produced.
