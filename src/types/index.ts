export type CategoryId = 'study' | 'life' | 'sport';
export type TimeSlot = 'morning' | 'daytime' | 'evening';
export type RepeatType = 'daily' | 'once';
export type RedemptionStatus = 'pending' | 'fulfilled' | 'cancelled';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  accentColor: string;
}

export interface Task {
  id: string;
  categoryId: CategoryId;
  name: string;
  icon: string;
  points: number;
  repeatable: RepeatType;
  timeSlot: TimeSlot;
  weeklyLimit?: number;
  active: boolean;
  createdAt: number;
}

export interface TaskSnapshot {
  name: string;
  icon: string;
  categoryId: CategoryId;
  points: number;
}

export interface Record {
  id: string;
  taskId: string;
  taskSnapshot: TaskSnapshot;
  points: number;
  date: string;        // YYYY-MM-DD local
  timestamp: number;
  note?: string;
}

export interface Reward {
  id: string;
  name: string;
  icon: string;
  cost: number;
  stock: number | null;
  active: boolean;
  createdAt: number;
}

export interface RewardSnapshot {
  name: string;
  icon: string;
  cost: number;
}

export interface Redemption {
  id: string;
  rewardId: string;
  rewardSnapshot: RewardSnapshot;
  cost: number;
  timestamp: number;
  status: RedemptionStatus;
}

export interface Milestone {
  id: string;
  threshold: number;
  name: string;
  icon: string;
  model3d?: string;
  description: string;
}

export interface UnlockedMilestone {
  milestoneId: string;
  unlockedAt: number;
}

export interface Child {
  name: string;
  icon: string;
  birthday?: string;
}

export interface PresetTaskSeed {
  categoryId: CategoryId;
  name: string;
  icon: string;
  points: number;
  repeatable: RepeatType;
  timeSlot: TimeSlot;
  weeklyLimit?: number;
}

export interface PresetRewardSeed {
  name: string;
  icon: string;
  cost: number;
}
