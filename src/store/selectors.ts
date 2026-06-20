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

/** Today's check-in count per taskId. Used for dailyLimit progression. */
export const selectTodayCountsByTask = (s: AppStore): Map<string, number> => {
  const today = todayKey();
  const map = new Map<string, number>();
  for (const r of s.records) {
    if (r.date !== today) continue;
    map.set(r.taskId, (map.get(r.taskId) ?? 0) + 1);
  }
  return map;
};

/** Most recent record per taskId (for showing latest check-in time + undo). */
export const selectTodayLastRecordByTask = (s: AppStore): Map<string, AppStore['records'][number]> => {
  const today = todayKey();
  const map = new Map<string, AppStore['records'][number]>();
  for (const r of s.records) {
    if (r.date !== today) continue;
    const prev = map.get(r.taskId);
    if (!prev || r.timestamp > prev.timestamp) map.set(r.taskId, r);
  }
  return map;
};

export function selectStreak(s: AppStore): number {
  if (s.records.length === 0) return 0;
  const days = new Set(s.records.filter((r) => !r.backfilled).map((r) => r.date));
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
