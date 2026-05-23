import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { selectStreak } from '@/store/selectors';
import { currentStreakTier } from '@/constants/encouragements';

/** Persistent floating mascot in the bottom-left corner. Speaks streak status. */
export function MascotCorner() {
  const streak = useStore(selectStreak);
  const child = useStore((s) => s.child);
  const tier = currentStreakTier(streak);

  return (
    <motion.div
      className="fixed bottom-20 left-3 z-30 pointer-events-none select-none"
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 180, delay: 0.4 }}
    >
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-end gap-1"
      >
        <img
          src={`/assets/icons/child/${child.icon}.png`}
          alt={child.icon}
          width={56}
          height={56}
          style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.18))' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/icons/child/_fallback.png'; }}
        />
        {tier && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-full px-2 py-1 shadow-soft text-xs font-bold flex items-center gap-1"
          >
            <span>{tier.emoji}</span>
            <span>{streak}</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
