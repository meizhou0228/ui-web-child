import type { StateCreator } from 'zustand';
import type { Milestone } from '@/types';

export interface UiSlice {
  recentlyUnlocked: Milestone | null;
  setRecentlyUnlocked: (m: Milestone | null) => void;
}

export const createUiSlice: StateCreator<
  UiSlice,
  [['zustand/immer', never]],
  [],
  UiSlice
> = (set) => ({
  recentlyUnlocked: null,
  setRecentlyUnlocked: (m) => set((s) => { s.recentlyUnlocked = m; }),
});
