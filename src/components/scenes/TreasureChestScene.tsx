import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Icon } from '@/components/Icon';

interface Props {
  open: boolean;
  rewardName: string;
  rewardIcon: string;
  onClose: () => void;
}

export function TreasureChestScene({ open, rewardName, rewardIcon, onClose }: Props) {
  const [giftAnim, setGiftAnim] = useState<unknown | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, 3000);
    return () => clearTimeout(id);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || giftAnim) return;
    fetch('/assets/lottie/gift-open.json')
      .then((r) => (r.ok ? r.json() : null))
      .then(setGiftAnim)
      .catch(() => setGiftAnim(null));
  }, [open, giftAnim]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.4, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gold-brand to-peach-brand rounded-huge p-8 text-center shadow-soft relative overflow-hidden"
          >
            {giftAnim ? (
              <div style={{ width: 200, height: 200, margin: '0 auto' }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Lottie animationData={giftAnim as any} loop autoplay />
              </div>
            ) : (
              <div className="text-7xl mb-2">🎁</div>
            )}
            <Icon type="reward" name={rewardIcon} size={120} animated />
            <h2 className="text-2xl font-bold mt-3">兑换成功！</h2>
            <p className="text-gray-700">{rewardName}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
