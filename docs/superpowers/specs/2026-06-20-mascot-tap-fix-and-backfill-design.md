# Mascot Tap-Through Fix + 补打卡 (Backfill) — Design

Date: 2026-06-20
Status: Approved

## Summary

Two changes to 宝宝积分小屋:

1. **Bug fix** — tapping the bottom-left mascot accidentally completes a task.
2. **Feature** — let a user backfill (补打卡) a task check-in for a day in the last 7 days (e.g. forgot to check in yesterday).

---

## 1. Bug: MascotCorner tap-through

### Root cause

`MascotCorner` is `fixed bottom-20 left-3 z-30` and carries `pointer-events-none`
(`src/components/MascotCorner.tsx`). The mascot visually overlaps the bottom-left
task cards on the Today page. Because pointer events are disabled, a tap on the
mascot passes *through* it and lands on the `TaskItem` underneath, whose `onClick`
fires `onCheckIn` → an unintended check-in.

### Fix

Keep the outer wrapper `pointer-events-none` (so the floating animation area never
blocks the page), but re-enable pointer events on the **visible** elements (the
mascot `<img>` and the streak badge) and absorb the tap:

- Add `pointer-events-auto` to the image / badge.
- Add an `onClick` that calls `e.stopPropagation()` and does nothing else.

Result: a direct tap on the mascot is consumed (no check-in); taps anywhere else
still reach the task cards normally. No other file changes.

---

## 2. Feature: 补打卡 (backfill)

### Decisions (from brainstorming)

- **Range:** any day within the last 7 days.
- **Entry point:** the 明细 (History) page.
- **Streak / milestones:** backfilled check-ins add points (and can therefore
  unlock milestones), but do **not** repair the streak.

### Data model

Add an optional flag to the `Record` interface in `src/types/index.ts`:

```ts
/** True when the record was added retroactively via 补打卡. */
backfilled?: boolean;
```

Optional + additive → no store migration needed. Existing persisted records read
back as `undefined`, which is treated as "not backfilled".

### Store — `recordsSlice.ts`

New action:

```ts
backfillCheckIn: (taskId: string, dateKey: string) => Record | null;
```

Behaviour:

- Anchor the record timestamp to **noon** of `dateKey`
  (`dayjs(dateKey).hour(12).valueOf()`). Noon guarantees the timestamp falls
  inside that calendar day *and* its ISO week, so weekly `once` tasks count
  toward the correct week.
- Enforce the same limit rules as `checkIn`, but evaluated for the **target**
  date/week:
  - `daily`: count records with `taskId === id && date === dateKey`; reject when
    `>= dailyLimit (default 1)`.
  - `once`: count records with `taskId === id && isoWeekKey(timestamp) === isoWeekKey(targetTs)`;
    reject when `>= weeklyLimit (default 1)`.
- Build the record with the task snapshot (same as `checkIn`), `date: dateKey`,
  `timestamp: noonTs`, `backfilled: true`. Return the record, or `null` when over
  limit / task inactive / not found.

**Refactor:** extract the limit-check logic shared by `checkIn` and
`backfillCheckIn` into a private helper inside the slice so the two paths cannot
drift. `checkIn` keeps using "now / today"; `backfillCheckIn` passes the target
timestamp/date.

### Streak — `selectors.ts`

Modify `selectStreak` so a day only counts when it has at least one
**non-backfilled** record:

```ts
const days = new Set(
  s.records.filter((r) => !r.backfilled).map((r) => r.date),
);
```

Backfilled points still flow into `selectTotalEarned` / balance, but a day that
contains only backfilled records does not extend the streak chain. This honours
"只加分，不补连击".

### Milestones

No special handling. Backfilled points are real points, so `selectTotalEarned`
includes them and `checkMilestones()` may return a newly unlockable milestone.
The backfill flow reuses the existing unlock path
(`checkMilestones()` → `setRecentlyUnlocked` + celebrate), and the global
`MilestoneScene` (mounted in `App.tsx`) shows the celebration.

### UI — History page

`HistoryPage.tsx`: add a `补打卡` button near the page header that opens a new
`BackfillModal`.

New component `src/components/BackfillModal.tsx` (~120 lines, well under the
500-line cap):

- A row of 7 day-chips for the last 7 days (incl. today), each labelled with
  weekday + date; one is selected at a time (default: yesterday).
- Below the chips, a list of **active** tasks (icon · name · `+N 分`). For the
  selected day, show the current count when relevant.
- Tapping a task calls `backfillCheckIn(taskId, selectedDate)`:
  - success → toast (e.g. `已补打卡 {task.name} +{points}`), runs the milestone
    unlock check, modal stays open for more entries.
  - over limit → toast (e.g. `那天已完成过啦` / `那天已满 N 次`).
- Close button / backdrop dismiss.

Props: `open: boolean`, `onClose: () => void`. Reads tasks + `backfillCheckIn`
from the store; uses `useToast()`.

---

## Testing

Store (`recordsSlice` tests):

- `backfillCheckIn` writes a record with the correct `date`, noon `timestamp`,
  and `backfilled: true`.
- Respects `dailyLimit` for the target day.
- Respects `weeklyLimit` for the target ISO week.
- Returns `null` for inactive / missing task.

Selectors (`selectors` tests):

- `selectStreak` ignores days that contain only backfilled records.
- `selectStreak` still counts a day that has at least one non-backfilled record
  even if it also has backfilled ones.
- `selectTotalEarned` / balance include backfilled points.

Component:

- `BackfillModal`: selecting a day + tapping a task creates a record; over-limit
  tap shows a warning and creates no record.

Run `npm run test:run && npm run typecheck` before completion.

---

## Files touched

- `src/components/MascotCorner.tsx` — tap absorption.
- `src/types/index.ts` — `backfilled?: boolean`.
- `src/store/recordsSlice.ts` — `backfillCheckIn` + shared limit helper.
- `src/store/selectors.ts` — streak ignores backfilled-only days.
- `src/pages/HistoryPage.tsx` — 补打卡 button + modal wiring.
- `src/components/BackfillModal.tsx` — new.
- Tests under `src/store/__tests__/` and `src/components/__tests__/`.
