import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { Reward } from '@/types';
import { PRESET_REWARDS } from '@/constants/presetRewards';

export interface RewardsSlice {
  rewards: Reward[];
  addReward: (data: Omit<Reward, 'id' | 'createdAt'>) => Reward;
  updateReward: (id: string, patch: Partial<Omit<Reward, 'id'>>) => void;
  toggleRewardActive: (id: string) => void;
  removeReward: (id: string) => void;
  restorePresetRewards: () => void;
}

export const createRewardsSlice: StateCreator<
  RewardsSlice,
  [['zustand/immer', never]],
  [],
  RewardsSlice
> = (set, get) => ({
  rewards: [],
  addReward: (data) => {
    const r: Reward = { ...data, id: nanoid(), createdAt: Date.now() };
    set((s) => { s.rewards.push(r); });
    return r;
  },
  updateReward: (id, patch) => set((s) => {
    const r = s.rewards.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
  }),
  toggleRewardActive: (id) => set((s) => {
    const r = s.rewards.find((x) => x.id === id);
    if (r) r.active = !r.active;
  }),
  removeReward: (id) => set((s) => {
    s.rewards = s.rewards.filter((x) => x.id !== id);
  }),
  restorePresetRewards: () => {
    const existing = new Set(get().rewards.map((r) => r.name));
    const seeds = PRESET_REWARDS.filter((p) => !existing.has(p.name));
    set((s) => {
      for (const seed of seeds) {
        s.rewards.push({
          ...seed,
          id: nanoid(),
          stock: null,
          active: true,
          createdAt: Date.now(),
        });
      }
    });
  },
});
