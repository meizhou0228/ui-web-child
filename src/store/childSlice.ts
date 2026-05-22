import type { StateCreator } from 'zustand';
import type { Child } from '@/types';

export interface ChildSlice {
  child: Child;
  setChildName: (name: string) => void;
  setChildIcon: (icon: string) => void;
  setChildBirthday: (date: string) => void;
}

const DEFAULT_CHILD: Child = { name: '小宝', icon: 'bear' };

export const createChildSlice: StateCreator<
  ChildSlice,
  [['zustand/immer', never]],
  [],
  ChildSlice
> = (set) => ({
  child: DEFAULT_CHILD,
  setChildName: (name) => set((s) => { s.child.name = name; }),
  setChildIcon: (icon) => set((s) => { s.child.icon = icon; }),
  setChildBirthday: (date) => set((s) => { s.child.birthday = date; }),
});
