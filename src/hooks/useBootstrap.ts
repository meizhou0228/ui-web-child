import { useEffect } from 'react';
import { useStore } from '@/store';

export function useBootstrap() {
  useEffect(() => {
    const s = useStore.getState();
    if (s.tasks.length === 0) s.restorePresetTasks();
    if (s.rewards.length === 0) s.restorePresetRewards();
    if (s.milestones.length === 0) s.initPresetMilestones();
  }, []);
}
