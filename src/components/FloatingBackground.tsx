import { motion } from 'framer-motion';
import { useMemo } from 'react';

/**
 * Soft floating decoration layer behind page content.
 * Cloud + star sprites drift slowly, rendered in z-0 layer.
 * Pointer-events: none — never blocks taps.
 */

const SPRITES = [
  { emoji: '☁️', size: 48 },
  { emoji: '☁️', size: 36 },
  { emoji: '⭐', size: 28 },
  { emoji: '✨', size: 24 },
  { emoji: '🌈', size: 40 },
  { emoji: '🎈', size: 32 },
  { emoji: '🌸', size: 28 },
  { emoji: '🍀', size: 24 },
  { emoji: '🌟', size: 30 },
] as const;

interface Props {
  count?: number;
}

export function FloatingBackground({ count = 8 }: Props) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const sprite = SPRITES[i % SPRITES.length];
        return {
          ...sprite,
          left: Math.random() * 90 + 2,
          top: Math.random() * 80 + 5,
          delay: Math.random() * 4,
          duration: 8 + Math.random() * 8,
          drift: 20 + Math.random() * 30,
        };
      }),
    [count],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((s, i) => (
        <motion.span
          key={i}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: s.size,
            opacity: 0.55,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.08))',
          }}
          animate={{
            y: [0, -s.drift, 0],
            x: [0, s.drift * 0.4, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        >
          {s.emoji}
        </motion.span>
      ))}
    </div>
  );
}
