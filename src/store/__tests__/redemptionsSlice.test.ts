import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createRewardsSlice, RewardsSlice } from '../rewardsSlice';
import { createRedemptionsSlice, RedemptionsSlice } from '../redemptionsSlice';
import { createRecordsSlice, RecordsSlice } from '../recordsSlice';
import { createTasksSlice, TasksSlice } from '../tasksSlice';

type Combined = TasksSlice & RecordsSlice & RewardsSlice & RedemptionsSlice;

const makeStore = () =>
  create<Combined>()(immer((...a) => ({
    ...createTasksSlice(...a),
    ...createRecordsSlice(...a),
    ...createRewardsSlice(...a),
    ...createRedemptionsSlice(...a),
  })));

function seedEarn(store: ReturnType<typeof makeStore>, total: number) {
  const t = store.getState().addTask({
    categoryId: 'study', name: 'big', icon: 'x', points: total,
    repeatable: 'daily', timeSlot: 'daytime', active: true,
  });
  store.getState().checkIn(t.id);
}

describe('redemptionsSlice', () => {
  let store: ReturnType<typeof makeStore>;
  beforeEach(() => { store = makeStore(); });

  it('redeem refuses when balance < cost', () => {
    const r = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    expect(store.getState().redeem(r.id)).toBeNull();
  });

  it('redeem creates pending when affordable', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    const red = store.getState().redeem(reward.id);
    expect(red).not.toBeNull();
    expect(red!.status).toBe('pending');
    expect(red!.cost).toBe(100);
    expect(red!.rewardSnapshot.name).toBe('gift');
  });

  it('redeem deducts from balance via selector logic', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    store.getState().redeem(reward.id);
    const totalSpent = store.getState().redemptions
      .filter((r) => r.status !== 'cancelled')
      .reduce((sum, r) => sum + r.cost, 0);
    expect(totalSpent).toBe(100);
  });

  it('fulfillRedemption marks fulfilled', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    const red = store.getState().redeem(reward.id)!;
    store.getState().fulfillRedemption(red.id);
    expect(store.getState().redemptions.find((r) => r.id === red.id)!.status).toBe('fulfilled');
  });

  it('cancelRedemption returns to cancelled', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    const red = store.getState().redeem(reward.id)!;
    store.getState().cancelRedemption(red.id);
    expect(store.getState().redemptions.find((r) => r.id === red.id)!.status).toBe('cancelled');
  });

  it('cannot cancel a fulfilled redemption', () => {
    seedEarn(store, 150);
    const reward = store.getState().addReward({ name: 'gift', icon: 'g', cost: 100, stock: null, active: true });
    const red = store.getState().redeem(reward.id)!;
    store.getState().fulfillRedemption(red.id);
    const ok = store.getState().cancelRedemption(red.id);
    expect(ok).toBe(false);
    expect(store.getState().redemptions.find((r) => r.id === red.id)!.status).toBe('fulfilled');
  });
});
