import { motion } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { Icon } from './Icon';
import { useStore } from '@/store';
import {
  selectBalance,
  selectTotalEarned,
  selectTodayPoints,
  selectNextMilestone,
} from '@/store/selectors';

export function ScoreCard() {
  const child = useStore((s) => s.child);
  const balance = useStore(selectBalance);
  const earned = useStore(selectTotalEarned);
  const today = useStore(selectTodayPoints);
  const next = useStore(selectNextMilestone);

  return (
    <motion.div
      layout
      className="bg-gradient-to-br from-cream-brand to-peach-brand rounded-huge p-6 shadow-soft"
    >
      <div className="flex items-center gap-4 mb-4">
        <Icon type="child" name={child.icon} size={72} animated />
        <div>
          <div className="text-sm text-gray-600">嗨</div>
          <div className="text-2xl font-bold">{child.name}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="今日" value={today} color="text-sky-700" />
        <Stat label="累计" value={earned} color="text-gold-700" />
        <Stat label="余额" value={balance} color="text-emerald-700" />
      </div>
      {next && (
        <ProgressBar
          value={earned}
          max={next.threshold}
          label={`距离「${next.name}」还差 ${next.threshold - earned} 分`}
        />
      )}
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/60 rounded-big p-2 text-center">
      <div className="text-xs text-gray-600">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
