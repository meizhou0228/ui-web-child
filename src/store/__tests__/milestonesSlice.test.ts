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
