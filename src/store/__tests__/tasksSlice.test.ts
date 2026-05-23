import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createTasksSlice, TasksSlice } from '../tasksSlice';
import { PRESET_TASKS, PRESET_WEEKLY_TASKS } from '@/constants/presetTasks';

const makeStore = () => create<TasksSlice>()(immer((...a) => createTasksSlice(...a)));

describe('tasksSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('starts empty', () => {
    expect(store.getState().tasks).toEqual([]);
  });

  it('addTask appends with id and timestamp', () => {
    store.getState().addTask({
      categoryId: 'study', name: '练琴', icon: 'piano',
      points: 5, repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const tasks = store.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBeTruthy();
    expect(tasks[0].createdAt).toBeGreaterThan(0);
    expect(tasks[0].name).toBe('练琴');
  });

  it('updateTask patches existing', () => {
    store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 1,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const id = store.getState().tasks[0].id;
    store.getState().updateTask(id, { name: 'b', points: 99 });
    expect(store.getState().tasks[0].name).toBe('b');
    expect(store.getState().tasks[0].points).toBe(99);
  });

  it('toggleTaskActive flips active flag', () => {
    store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 1,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const id = store.getState().tasks[0].id;
    store.getState().toggleTaskActive(id);
    expect(store.getState().tasks[0].active).toBe(false);
    store.getState().toggleTaskActive(id);
    expect(store.getState().tasks[0].active).toBe(true);
  });

  it('removeTask deletes', () => {
    store.getState().addTask({
      categoryId: 'study', name: 'a', icon: 'x', points: 1,
      repeatable: 'daily', timeSlot: 'daytime', active: true,
    });
    const id = store.getState().tasks[0].id;
    store.getState().removeTask(id);
    expect(store.getState().tasks).toHaveLength(0);
  });

  it('restorePresetTasks loads all preset daily + weekly seeds when empty', () => {
    store.getState().restorePresetTasks();
    expect(store.getState().tasks.length).toBe(PRESET_TASKS.length + PRESET_WEEKLY_TASKS.length);
  });

  it('restorePresetTasks does not duplicate existing names', () => {
    store.getState().restorePresetTasks();
    const before = store.getState().tasks.length;
    store.getState().restorePresetTasks();
    expect(store.getState().tasks.length).toBe(before);
  });
});
