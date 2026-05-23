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
      const limit = task.dailyLimit ?? 1;
      const sameDayCount = state.records.filter(
        (r) => r.taskId === taskId && r.date === today,
      ).length;
      if (sameDayCount >= limit) return null;
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
