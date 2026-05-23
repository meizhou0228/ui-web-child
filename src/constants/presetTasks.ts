import type { PresetTaskSeed } from '@/types';

export const PRESET_TASKS: PresetTaskSeed[] = [
  { categoryId: 'study', name: '朗读 15 分钟',       icon: 'book-open',     points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '数学小练习 10 分钟',  icon: 'input-numbers', points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '控笔/写字练习',      icon: 'pencil',        points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '亲子共读 20 分钟',   icon: 'books',         points: 10, timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'study', name: '英文分级阅读',       icon: 'abc',           points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '专注完成作业',       icon: 'memo',          points: 10, timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'life',  name: '7:00 自主起床',      icon: 'sunrise',       points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '自己穿衣叠被',       icon: 'shirt',         points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '刷牙洗脸',           icon: 'toothbrush',    points: 3,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '吃完早餐不挑食',     icon: 'bowl-of-food',  points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '整理玩具/书桌',      icon: 'teddy-bear',    points: 5,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'life',  name: '帮忙做一项家务',     icon: 'broom',         points: 6,  timeSlot: 'daytime', repeatable: 'daily', dailyLimit: 3 },
  { categoryId: 'life',  name: '屏幕时间 ≤ 30 分钟', icon: 'mobile-phone',  points: 5,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'life',  name: '21:00 前洗漱完毕',   icon: 'soap',          points: 3,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'life',  name: '21:30 入睡',         icon: 'sleeping-face', points: 5,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'sport', name: '跳绳 100-200 下',    icon: 'jumping-rope',  points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'sport', name: '户外活动 ≥ 1 小时',  icon: 'runner',        points: 10, timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'sport', name: '体能小练习',         icon: 'flexed-biceps', points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
];

export const PRESET_WEEKLY_TASKS: PresetTaskSeed[] = [
  { categoryId: 'study', name: '本周读完一本绘本', icon: 'closed-book', points: 30, timeSlot: 'daytime', repeatable: 'once', weeklyLimit: 1 },
  { categoryId: 'sport', name: '周末爬山/远足',     icon: 'mountain',    points: 30, timeSlot: 'daytime', repeatable: 'once', weeklyLimit: 1 },
  { categoryId: 'life',  name: '完整一周作息打卡', icon: 'trophy',      points: 50, timeSlot: 'evening', repeatable: 'once', weeklyLimit: 1 },
];
