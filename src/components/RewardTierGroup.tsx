import { ShopCard } from './ShopCard';
import type { Reward } from '@/types';
import type { RewardTierId } from '@/constants/gamification';

interface Props {
  title: string;
  range: string;
  rewards: Reward[];
  balance: number;
  onRedeem: (rewardId: string) => void;
  tone: string;
  tierId: RewardTierId;
}

export function RewardTierGroup({ title, range, rewards, balance, onRedeem, tone, tierId }: Props) {
  if (rewards.length === 0) return null;

  return (
    <section className={`rounded-huge p-4 shadow-soft bg-gradient-to-br ${tone}`}>
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-xs text-gray-500">{range}</div>
          <h2 className="font-bold">{title}</h2>
        </div>
        <div className="text-xs text-gray-500">{tierId}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rewards.map((reward) => (
          <ShopCard
            key={reward.id}
            reward={reward}
            balance={balance}
            onRedeem={() => onRedeem(reward.id)}
          />
        ))}
      </div>
    </section>
  );
}
