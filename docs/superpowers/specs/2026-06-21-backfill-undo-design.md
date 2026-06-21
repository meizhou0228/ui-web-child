# 补打卡 Row-Level Undo — Design

Date: 2026-06-21
Status: Approved

## Problem

The 补打卡 (backfill) modal has no undo. A mis-tap creates a record that cannot be
rolled back from the modal. The existing `undoRecord` only works inside the 5-minute
undo window, and backfilled records carry a past-day (noon) timestamp, so that window
never applies to them.

## Decision (from brainstorming)

Per-task-row delete: each row exposes a control that removes the most recent
**backfilled** record for that task on the selected day.

## Approach

Store needs no change — `removeRecord(id)` already force-deletes regardless of the undo
window.

In `src/components/BackfillModal.tsx`, for each active task row and the selected day:

- Compute the day's records for that task.
- Find the most recent record among them with `backfilled === true`.
- When one exists, render a `✕ 撤销` control (aria-label `undo-backfill-<taskId>`) on the
  right of the row. Tapping it:
  - calls `e.stopPropagation()` so it does not also trigger another backfill,
  - calls `removeRecord(record.id)`,
  - shows a toast `已撤销 {task.name}`.

Only `backfilled` records are removable here, so a real same-day check-in is never
deleted from this modal. Removing a backfilled record rolls back its points/total
automatically; the streak already excludes backfilled records, so there is no streak
impact.

The existing `已记 N 次` count stays. The `✕` removes the latest backfilled record; the
user can tap again to remove more.

## Testing

Extend `src/components/__tests__/BackfillModal.test.tsx`:

- After backfilling a task, an `undo-backfill-<taskId>` control appears, and clicking it
  removes the record (records length returns to 0).
- The undo control is absent before any backfill exists for the selected day.

## Files touched

- Modify `src/components/BackfillModal.tsx`
- Modify `src/components/__tests__/BackfillModal.test.tsx`
