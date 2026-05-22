import { describe, it, expect } from 'vitest';
import { findUnlockable, findNext } from '../milestones';
import { PRESET_MILESTONES } from '@/constants/presetMilestones';

describe('milestone utils', () => {
  it('findUnlockable returns lowest unlocked threshold', () => {
    const m = findUnlockable(PRESET_MILESTONES, 150, []);
    expect(m?.id).toBe('m-100');
  });

  it('findUnlockable skips already unlocked', () => {
    const m = findUnlockable(PRESET_MILESTONES, 350, [
      { milestoneId: 'm-100', unlockedAt: 0 },
    ]);
    expect(m?.id).toBe('m-300');
  });

  it('findUnlockable returns null when none cross threshold', () => {
    const m = findUnlockable(PRESET_MILESTONES, 50, []);
    expect(m).toBeNull();
  });

  it('findNext returns smallest threshold above earned', () => {
    const m = findNext(PRESET_MILESTONES, 350, [
      { milestoneId: 'm-100', unlockedAt: 0 },
      { milestoneId: 'm-300', unlockedAt: 0 },
    ]);
    expect(m?.id).toBe('m-500');
  });
});
