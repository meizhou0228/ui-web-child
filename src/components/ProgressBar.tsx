import { motion } from 'framer-motion';

interface Props {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: Props) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="w-full">
      {label && <div className="text-sm text-gray-600 mb-1">{label}</div>}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden relative">
        <motion.div
          className="h-full bg-gradient-to-r from-sky-brand to-grape-brand"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <div className="text-xs text-right text-gray-500 mt-0.5">{value} / {max}</div>
    </div>
  );
}
