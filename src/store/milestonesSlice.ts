import type { StateCreator } from 'zustand';
import type { Milestone, UnlockedMilestone, Record as PointRecord } from '@/types';
import { PRESET_MILESTONES } from '@/constants/presetMilestones';
import { findUnlockable } from '@/utils/milestones';

export interface MilestonesSlice {
  milestones: Milestone[];
  unlockedMilestones: UnlockedMilestone[];
  initPresetMilestones: () => void;
  checkMilestones: () => Milestone | null;
}

interface WithRecords {
  records: PointRecord[];
}

export const createMilestonesSlice: StateCreator<
  MilestonesSlice & WithRecords,
  [['zustand/immer', never]],
  [],
  MilestonesSlice
> = (set, get) => ({
  milestones: [],
  unlockedMilestones: [],
  initPresetMilestones: () => {
    if (get().milestones.length > 0) return;
    set((s) => { s.milestones = [...PRESET_MILESTONES]; });
  },
  checkMilestones: () => {
    const s = get();
    const totalEarned = s.records.reduce((sum, r) => sum + r.points, 0);
    const m = findUnlockable(s.milestones, totalEarned, s.unlockedMilestones);
    if (!m) return null;
    set((st) => {
      st.unlockedMilestones.push({ milestoneId: m.id, unlockedAt: Date.now() });
    });
    return m;
  },
});
