import type { Milestone, UnlockedMilestone } from '@/types';

export function findUnlockable(
  milestones: Milestone[],
  totalEarned: number,
  alreadyUnlocked: UnlockedMilestone[],
): Milestone | null {
  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.milestoneId));
  const candidates = milestones
    .filter((m) => !unlockedIds.has(m.id) && totalEarned >= m.threshold)
    .sort((a, b) => a.threshold - b.threshold);
  return candidates[0] ?? null;
}

export function findNext(
  milestones: Milestone[],
  totalEarned: number,
  alreadyUnlocked: UnlockedMilestone[],
): Milestone | null {
  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.milestoneId));
  return [...milestones]
    .filter((m) => !unlockedIds.has(m.id) && m.threshold > totalEarned)
    .sort((a, b) => a.threshold - b.threshold)[0] ?? null;
}
