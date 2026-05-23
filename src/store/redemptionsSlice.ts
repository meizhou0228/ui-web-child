import type { StateCreator } from 'zustand';
import { nanoid } from 'nanoid';
import type { Redemption, Reward, Record } from '@/types';

export interface RedemptionsSlice {
  redemptions: Redemption[];
  redeem: (rewardId: string) => Redemption | null;
  fulfillRedemption: (id: string) => boolean;
  cancelRedemption: (id: string) => boolean;
}

interface WithRewardsRecords {
  rewards: Reward[];
  records: Record[];
}

function computeBalance(records: Record[], redemptions: Redemption[]): number {
  const earned = records.reduce((sum, r) => sum + r.points, 0);
  const spent = redemptions
    .filter((r) => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.cost, 0);
  return earned - spent;
}

export const createRedemptionsSlice: StateCreator<
  RedemptionsSlice & WithRewardsRecords,
  [['zustand/immer', never]],
  [],
  RedemptionsSlice
> = (set, get) => ({
  redemptions: [],
  redeem: (rewardId) => {
    const s = get();
    const reward = s.rewards.find((r) => r.id === rewardId);
    if (!reward || !reward.active) return null;
    const balance = computeBalance(s.records, s.redemptions);
    if (balance < reward.cost) return null;
    const red: Redemption = {
      id: nanoid(),
      rewardId: reward.id,
      rewardSnapshot: { name: reward.name, icon: reward.icon, cost: reward.cost },
      cost: reward.cost,
      timestamp: Date.now(),
      status: 'pending',
    };
    set((st) => { st.redemptions.push(red); });
    return red;
  },
  fulfillRedemption: (id) => {
    let ok = false;
    set((st) => {
      const r = st.redemptions.find((x) => x.id === id);
      if (r && r.status === 'pending') {
        r.status = 'fulfilled';
        ok = true;
      }
    });
    return ok;
  },
  cancelRedemption: (id) => {
    let ok = false;
    set((st) => {
      const r = st.redemptions.find((x) => x.id === id);
      if (r && r.status === 'pending') {
        r.status = 'cancelled';
        ok = true;
      }
    });
    return ok;
  },
});
