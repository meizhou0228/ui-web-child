import type { PresetTaskSeed } from '@/types';

/**
 * Preset daily tasks for 6-year-old 大班 (senior kindergarten) children
 * preparing to enter primary school (一年级).
 *
 * Coverage:
 *   学习 (study)  — pinyin, characters, writing, math, reading habits
 *   生活 (life)   — self-care, organization, manners, sleep hygiene
 *   运动 (sport)  — gross motor + coordination
 */
export const PRESET_TASKS: PresetTaskSeed[] = [
  // ───── 学习 📚 — 升小学 readiness ─────
  { categoryId: 'study', name: '拼音练习 10 分钟',     icon: 'abc',            points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '识字卡片 10 个',       icon: 'input-numbers',  points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '数字加减练习',         icon: 'memo',           points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '控笔/写字练习',        icon: 'pencil',         points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '绘本阅读 15 分钟',     icon: 'book-open',      points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '英文跟读 10 分钟',     icon: 'guitar',         points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'study', name: '亲子共读 20 分钟',     icon: 'books',          points: 10, timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'study', name: '听故事 + 复述',        icon: 'sticker',        points: 8,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'study', name: '专注做事 15 分钟',     icon: 'puzzle',         points: 6,  timeSlot: 'daytime', repeatable: 'daily' },

  // ───── 生活 🏠 — 自理 + 礼貌 + 习惯 ─────
  { categoryId: 'life',  name: '7:00 自主起床',        icon: 'sunrise',        points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '自己穿衣叠被',          icon: 'shirt',          points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '刷牙洗脸',              icon: 'toothbrush',     points: 3,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '吃完早餐不挑食',        icon: 'bowl-of-food',   points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '自己整理书包',          icon: 'closed-book',    points: 6,  timeSlot: 'morning', repeatable: 'daily' },
  { categoryId: 'life',  name: '整理玩具/书桌',         icon: 'teddy-bear',     points: 5,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'life',  name: '帮忙做家务',            icon: 'broom',          points: 4,  timeSlot: 'daytime', repeatable: 'daily', dailyLimit: 3 },
  { categoryId: 'life',  name: '主动问好/礼貌用语',     icon: 'sparkles',       points: 3,  timeSlot: 'daytime', repeatable: 'daily', dailyLimit: 5 },
  { categoryId: 'life',  name: '分享/帮助他人',         icon: 'gift',           points: 5,  timeSlot: 'daytime', repeatable: 'daily', dailyLimit: 3 },
  { categoryId: 'life',  name: '不发脾气说出感受',      icon: 'sleeping-face',  points: 5,  timeSlot: 'daytime', repeatable: 'daily', dailyLimit: 3 },
  { categoryId: 'life',  name: '屏幕时间 ≤ 30 分钟',    icon: 'mobile-phone',   points: 5,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'life',  name: '21:00 前洗漱完毕',      icon: 'soap',           points: 3,  timeSlot: 'evening', repeatable: 'daily' },
  { categoryId: 'life',  name: '21:30 入睡',            icon: 'sleeping-face',  points: 5,  timeSlot: 'evening', repeatable: 'daily' },

  // ───── 运动 ⚽ — 体能 + 协调 + 平衡 ─────
  { categoryId: 'sport', name: '跳绳 100-200 下',       icon: 'jumping-rope',   points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'sport', name: '户外活动 ≥ 1 小时',     icon: 'runner',         points: 10, timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'sport', name: '体能小练习',            icon: 'flexed-biceps',  points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'sport', name: '拍球/接球练习',         icon: 'jumping-rope',   points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { categoryId: 'sport', name: '平衡 / 单脚站 30 秒',   icon: 'flexed-biceps',  points: 4,  timeSlot: 'daytime', repeatable: 'daily' },
];

export const PRESET_WEEKLY_TASKS: PresetTaskSeed[] = [
  { categoryId: 'study', name: '本周读完一本绘本',         icon: 'closed-book', points: 30, timeSlot: 'daytime', repeatable: 'once', weeklyLimit: 1 },
  { categoryId: 'study', name: '会写 5 个新汉字',           icon: 'pencil',      points: 25, timeSlot: 'daytime', repeatable: 'once', weeklyLimit: 1 },
  { categoryId: 'sport', name: '周末爬山 / 远足 / 骑车',    icon: 'mountain',    points: 30, timeSlot: 'daytime', repeatable: 'once', weeklyLimit: 1 },
  { categoryId: 'life',  name: '完整一周作息打卡',          icon: 'trophy',      points: 50, timeSlot: 'evening', repeatable: 'once', weeklyLimit: 1 },
  { categoryId: 'life',  name: '本周勇敢解决一件事',        icon: 'crown',       points: 25, timeSlot: 'evening', repeatable: 'once', weeklyLimit: 1 },
];
