import { motion } from 'framer-motion';
import { Icon } from './Icon';
import type { Reward } from '@/types';

interface Props {
  reward: Reward;
  balance: number;
  onRedeem: () => void;
}

export function ShopCard({ reward, balance, onRedeem }: Props) {
  const canAfford = balance >= reward.cost;
  const tier =
    reward.cost >= 500 ? 'gold' :
    reward.cost >= 100 ? 'silver' : 'wood';
  const TIER_BG: Record<typeof tier, string> = {
    wood:   'from-amber-100 to-amber-200',
    silver: 'from-gray-100 to-gray-200',
    gold:   'from-yellow-100 to-yellow-200',
  };
  return (
    <motion.div
      layout
      whileHover={canAfford ? { y: -4 } : undefined}
      className={`rounded-big p-4 shadow-soft bg-gradient-to-br ${TIER_BG[tier]} flex flex-col items-center text-center gap-2`}
      data-testid={`reward-${reward.id}`}
    >
      <Icon type="reward" name={reward.icon} size={72} animated={canAfford} />
      <div className="font-bold">{reward.name}</div>
      <div className="text-sm text-gray-700">{reward.cost} 分</div>
      <button
        disabled={!canAfford}
        onClick={onRedeem}
        className={`w-full py-2 rounded-big font-bold ${
          canAfford ? 'bg-sky-brand text-white shadow-3d' : 'bg-gray-200 text-gray-400'
        }`}
        aria-label={canAfford ? 'redeem' : 'insufficient'}
      >
        {canAfford ? '兑换' : `还差 ${reward.cost - balance} 分`}
      </button>
    </motion.div>
  );
}
