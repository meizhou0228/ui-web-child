import type { Milestone } from '@/types';

export const PRESET_MILESTONES: Milestone[] = [
  { id: 'm-100',  threshold: 100,  name: '习惯新星',    icon: 'rising-star',   description: '累计 100 分，你是新的小星星！' },
  { id: 'm-300',  threshold: 300,  name: '坚持小达人',  icon: 'shooting-star', description: '累计 300 分，坚持就是胜利！' },
  { id: 'm-500',  threshold: 500,  name: '五百精英',    icon: 'medal',         description: '累计 500 分，越来越棒了！' },
  { id: 'm-1000', threshold: 1000, name: '千分大师',    icon: 'trophy',        description: '累计 1000 分，了不起！' },
  { id: 'm-2000', threshold: 2000, name: '两千传奇',    icon: 'crown',         description: '累计 2000 分，习惯小王者！' },
  { id: 'm-5000', threshold: 5000, name: '五千王者',    icon: 'diamond',       description: '累计 5000 分，自律之光！' },
];
