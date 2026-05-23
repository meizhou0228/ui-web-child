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

  it('allows multiple daily check-ins when dailyLimit > 1', () => {
    const t = store.getState().addTask({
      categoryId: 'life', name: '做家务', icon: 'broom', points: 3,
      repeatable: 'daily', dailyLimit: 3, timeSlot: 'daytime', active: true,
    });
    expect(store.getState().checkIn(t.id)).not.toBeNull();
    expect(store.getState().checkIn(t.id)).not.toBeNull();
    expect(store.getState().checkIn(t.id)).not.toBeNull();
    expect(store.getState().records).toHaveLength(3);
    // Fourth attempt blocked
    expect(store.getState().checkIn(t.id)).toBeNull();
    expect(store.getState().records).toHaveLength(3);
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
