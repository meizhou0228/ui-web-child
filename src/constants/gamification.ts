import type { Reward } from '@/types';

export const ADVENTURE_STOPS = [
  { label: '出发', hint: '先完成一个小任务' },
  { label: '晨光站', hint: '生活习惯启动' },
  { label: '专注桥', hint: '学习力正在发光' },
  { label: '勇气门', hint: '坚持快到终点' },
  { label: '小学城堡', hint: '今天准备力满格' },
] as const;

export const STREAK_REWARDS = [
  { days: 3, title: '三天小火苗', description: '连续 3 天，习惯开始发芽。' },
  { days: 7, title: '一周小队长', description: '连续 7 天，作息越来越稳。' },
  { days: 14, title: '半月坚持星', description: '连续 14 天，专注力更强了。' },
  { days: 30, title: '入学准备王', description: '连续 30 天，准备好迎接小学。' },
] as const;

export const REWARD_TIERS = [
  { id: 'small', title: '小惊喜', range: '100 分以内', tone: 'from-emerald-50 to-sky-100' },
  { id: 'medium', title: '周末愿望', range: '100-499 分', tone: 'from-amber-50 to-orange-100' },
  { id: 'large', title: '大心愿', range: '500 分以上', tone: 'from-yellow-50 to-rose-100' },
] as const;

export type RewardTierId = typeof REWARD_TIERS[number]['id'];

export function rewardTierId(cost: number): RewardTierId {
  if (cost >= 500) return 'large';
  if (cost >= 100) return 'medium';
  return 'small';
}

export function groupRewardsByTier(rewards: Reward[]): Record<RewardTierId, Reward[]> {
  return rewards.reduce<Record<RewardTierId, Reward[]>>(
    (groups, reward) => {
      groups[rewardTierId(reward.cost)].push(reward);
      return groups;
    },
    { small: [], medium: [], large: [] },
  );
}
