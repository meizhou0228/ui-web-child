import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createRewardsSlice, RewardsSlice } from '../rewardsSlice';
import { PRESET_REWARDS } from '@/constants/presetRewards';

const makeStore = () => create<RewardsSlice>()(immer((...a) => createRewardsSlice(...a)));

describe('rewardsSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('starts empty', () => {
    expect(store.getState().rewards).toEqual([]);
  });

  it('addReward appends', () => {
    store.getState().addReward({ name: '糖', icon: 'candy', cost: 10, stock: null, active: true });
    expect(store.getState().rewards).toHaveLength(1);
  });

  it('updateReward patches', () => {
    store.getState().addReward({ name: 'a', icon: 'x', cost: 1, stock: null, active: true });
    const id = store.getState().rewards[0].id;
    store.getState().updateReward(id, { cost: 99 });
    expect(store.getState().rewards[0].cost).toBe(99);
  });

  it('toggleRewardActive flips flag', () => {
    store.getState().addReward({ name: 'a', icon: 'x', cost: 1, stock: null, active: true });
    const id = store.getState().rewards[0].id;
    store.getState().toggleRewardActive(id);
    expect(store.getState().rewards[0].active).toBe(false);
  });

  it('removeReward deletes', () => {
    store.getState().addReward({ name: 'a', icon: 'x', cost: 1, stock: null, active: true });
    const id = store.getState().rewards[0].id;
    store.getState().removeReward(id);
    expect(store.getState().rewards).toHaveLength(0);
  });

  it('restorePresetRewards loads all presets', () => {
    store.getState().restorePresetRewards();
    expect(store.getState().rewards.length).toBe(PRESET_REWARDS.length);
  });

  it('restorePresetRewards skips by name', () => {
    store.getState().restorePresetRewards();
    const before = store.getState().rewards.length;
    store.getState().restorePresetRewards();
    expect(store.getState().rewards.length).toBe(before);
  });
});
