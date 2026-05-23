import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createChildSlice, ChildSlice } from './childSlice';
import { createTasksSlice, TasksSlice } from './tasksSlice';
import { createRecordsSlice, RecordsSlice } from './recordsSlice';
import { createRewardsSlice, RewardsSlice } from './rewardsSlice';
import { createRedemptionsSlice, RedemptionsSlice } from './redemptionsSlice';
import { createMilestonesSlice, MilestonesSlice } from './milestonesSlice';
import { createUiSlice, UiSlice } from './uiSlice';

export type AppStore =
  & ChildSlice
  & TasksSlice
  & RecordsSlice
  & RewardsSlice
  & RedemptionsSlice
  & MilestonesSlice
  & UiSlice;

export const useStore = create<AppStore>()(
  persist(
    immer((...args) => ({
      ...createChildSlice(...args),
      ...createTasksSlice(...args),
      ...createRecordsSlice(...args),
      ...createRewardsSlice(...args),
      ...createRedemptionsSlice(...args),
      ...createMilestonesSlice(...args),
      ...createUiSlice(...args),
    })),
    {
      name: 'ui-web-child:v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        child: state.child,
        tasks: state.tasks,
        records: state.records,
        rewards: state.rewards,
        redemptions: state.redemptions,
        milestones: state.milestones,
        unlockedMilestones: state.unlockedMilestones,
      }),
      migrate: (persisted) => persisted as AppStore,
    },
  ),
);
