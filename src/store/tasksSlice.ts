import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { Task } from '@/types';
import { PRESET_TASKS, PRESET_WEEKLY_TASKS } from '@/constants/presetTasks';

export interface TasksSlice {
  tasks: Task[];
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id'>>) => void;
  toggleTaskActive: (id: string) => void;
  removeTask: (id: string) => void;
  restorePresetTasks: () => void;
}

export const createTasksSlice: StateCreator<
  TasksSlice,
  [['zustand/immer', never]],
  [],
  TasksSlice
> = (set, get) => ({
  tasks: [],
  addTask: (data) => {
    const task: Task = { ...data, id: nanoid(), createdAt: Date.now() };
    set((s) => { s.tasks.push(task); });
    return task;
  },
  updateTask: (id, patch) => set((s) => {
    const t = s.tasks.find((x) => x.id === id);
    if (t) Object.assign(t, patch);
  }),
  toggleTaskActive: (id) => set((s) => {
    const t = s.tasks.find((x) => x.id === id);
    if (t) t.active = !t.active;
  }),
  removeTask: (id) => set((s) => {
    s.tasks = s.tasks.filter((x) => x.id !== id);
  }),
  restorePresetTasks: () => {
    const existing = new Set(get().tasks.map((t) => t.name));
    const seeds = [...PRESET_TASKS, ...PRESET_WEEKLY_TASKS].filter((p) => !existing.has(p.name));
    set((s) => {
      for (const seed of seeds) {
        s.tasks.push({
          ...seed,
          id: nanoid(),
          createdAt: Date.now(),
          active: true,
        });
      }
    });
  },
});
