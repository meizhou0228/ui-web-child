import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '../index';
import {
  selectTotalEarned, selectTotalSpent, selectBalance, selectTodayPoints, selectStreak,
} from '../selectors';
import { makeRecord } from '../../../test/factories';

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
});
