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

/**
 * User-defined or preset habit/check-in item.
 */
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

/**
 * Frozen copy of a Task at event time; protects history from later edits.
 */
export interface TaskSnapshot {
  name: string;
  icon: string;
  categoryId: CategoryId;
  points: number;
}

/**
 * Point-record entry. Each successful checkIn appends one.
 * Note: named `Record` deliberately — downstream files that need
 * the TS global utility type import this as `Record as PointRecord`.
 */
export interface Record {
  id: string;
  taskId: string;
  taskSnapshot: TaskSnapshot;
  points: number;
  date: string;        // YYYY-MM-DD local
  timestamp: number;
  note?: string;
}

/**
 * Item the child can spend points on.
 */
export interface Reward {
  id: string;
  name: string;
  icon: string;
  cost: number;
  stock: number | null;
  active: boolean;
  createdAt: number;
}

/**
 * Frozen copy of a Reward at event time; protects history from later edits.
 */
export interface RewardSnapshot {
  name: string;
  icon: string;
  cost: number;
}

/**
 * Audit log entry for a redemption transaction. Snapshots reward at redemption time.
 */
export interface Redemption {
  id: string;
  rewardId: string;
  rewardSnapshot: RewardSnapshot;
  cost: number;
  timestamp: number;
  status: RedemptionStatus;
}

/**
 * Threshold badge unlocked at lifetime-earned milestones.
 */
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
