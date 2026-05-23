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
