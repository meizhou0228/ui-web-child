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
