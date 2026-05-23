import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useStore } from '@/store';
import { celebrateMilestone } from '@/utils/celebrate';

/**
 * Shows a celebratory banner on the child's birthday.
 * Compares today (MM-DD) to child.birthday (YYYY-MM-DD).
 * Triggers a confetti burst on first render of the day.
 */
export function BirthdayBanner() {
  const child = useStore((s) => s.child);
  const [dismissed, setDismissed] = useState(false);

  const isBirthday =
    !!child.birthday &&
    dayjs(child.birthday).format('MM-DD') === dayjs().format('MM-DD');

  useEffect(() => {
    if (isBirthday && !dismissed) {
      const t = setTimeout(() => celebrateMilestone(), 250);
      return () => clearTimeout(t);
    }
  }, [isBirthday, dismissed]);

  if (!isBirthday || dismissed) return null;

  const age = child.birthday ? dayjs().diff(dayjs(child.birthday), 'year') : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        className="bg-gradient-to-r from-pink-200 via-yellow-100 to-pink-200 rounded-huge p-4 shadow-soft text-center relative overflow-hidden"
      >
        <div className="text-4xl mb-1">🎂🎉🎁</div>
        <div className="text-lg font-bold text-rose-700">
          祝 {child.name} {age ? `${age} 岁` : ''} 生日快乐！
        </div>
        <div className="text-sm text-rose-600/80 mt-1">今天打卡奖励 +50% 心意 💝</div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-3 text-rose-400/70 text-sm"
          aria-label="dismiss-birthday"
        >×</button>
      </motion.div>
    </AnimatePresence>
  );
}
