/**
 * Encouraging Chinese phrases shown after a successful check-in.
 * Rotated randomly. Kid-friendly, 6 岁 readable.
 */
export const ENCOURAGEMENTS: string[] = [
  '太棒啦！',
  '你真厉害！',
  '再接再厉！',
  '哇，做得好！',
  '坚持就是胜利！',
  '你是最棒的！',
  '小宇宙爆发！',
  '加油加油！',
  '超级棒哦！',
  '继续加油！',
  '小星星 +1 ⭐',
  '你真聪明！',
  '太厉害了！',
  '继续保持！',
  '完美完成！',
  '你是小英雄！',
  '真有耐心！',
  '宝贝真乖！',
];

/** Streak-tier messages for connecting daily check-ins. */
export const STREAK_TIERS: { days: number; emoji: string; label: string }[] = [
  { days: 3,  emoji: '🔥',  label: '3 天连击！' },
  { days: 7,  emoji: '⚡',  label: '一周不间断！' },
  { days: 14, emoji: '💫', label: '两周达人！' },
  { days: 21, emoji: '🌟', label: '21 天习惯养成！' },
  { days: 30, emoji: '👑', label: '一月之王！' },
  { days: 66, emoji: '💎', label: '66 天自动化！' },
  { days: 100, emoji: '🏆', label: '百日传奇！' },
];

export function pickEncouragement(): string {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

export function currentStreakTier(streak: number): typeof STREAK_TIERS[number] | null {
  return [...STREAK_TIERS].reverse().find((t) => streak >= t.days) ?? null;
}
