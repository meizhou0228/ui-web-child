import { nanoid } from 'nanoid';
import type { Task, Record, Reward, Redemption, Child } from '@/types';

export const makeChild = (overrides: Partial<Child> = {}): Child => ({
  name: '小宝',
  icon: 'bear',
  ...overrides,
});

export const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: nanoid(),
  categoryId: 'study',
  name: '测试任务',
  icon: 'book-open',
  points: 10,
  repeatable: 'daily',
  timeSlot: 'daytime',
  active: true,
  createdAt: Date.now(),
  ...overrides,
});

export const makeRecord = (overrides: Partial<Record> = {}): Record => {
  const task = makeTask();
  return {
    id: nanoid(),
    taskId: task.id,
    taskSnapshot: { name: task.name, icon: task.icon, categoryId: task.categoryId, points: task.points },
    points: task.points,
    date: '2026-05-23',
    timestamp: Date.now(),
    ...overrides,
  };
};

export const makeReward = (overrides: Partial<Reward> = {}): Reward => ({
  id: nanoid(),
  name: '测试奖励',
  icon: 'gift',
  cost: 50,
  stock: null,
  active: true,
  createdAt: Date.now(),
  ...overrides,
});

export const makeRedemption = (overrides: Partial<Redemption> = {}): Redemption => {
  const reward = makeReward();
  return {
    id: nanoid(),
    rewardId: reward.id,
    rewardSnapshot: { name: reward.name, icon: reward.icon, cost: reward.cost },
    cost: reward.cost,
    timestamp: Date.now(),
    status: 'pending',
    ...overrides,
  };
};
