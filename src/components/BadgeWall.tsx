import { Icon } from './Icon';
import type { Milestone, UnlockedMilestone } from '@/types';

interface Props {
  milestones: Milestone[];
  unlocked: UnlockedMilestone[];
  totalEarned: number;
}

export function BadgeWall({ milestones, unlocked, totalEarned }: Props) {
  const unlockedIds = new Set(unlocked.map((item) => item.milestoneId));

  return (
    <section className="bg-white rounded-huge p-4 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-gray-500">成长收藏册</div>
          <h2 className="font-bold">徽章墙</h2>
        </div>
        <div className="text-xs text-gray-500">{unlockedIds.size}/{milestones.length}</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {milestones.map((milestone) => {
          const done = unlockedIds.has(milestone.id);
          const progress = Math.min(100, Math.round((totalEarned / milestone.threshold) * 100));
          return (
            <div
              key={milestone.id}
              className={`rounded-big p-3 text-center border ${done ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}
            >
              <div className={`${done ? '' : 'grayscale opacity-45'}`}>
                <Icon type="milestone" name={milestone.icon} size={54} animated={done} />
              </div>
              <div className="text-xs font-bold mt-1">{milestone.name}</div>
              <div className="text-[11px] text-gray-500 mt-1 leading-tight">
                {done ? '已收集' : `${progress}%`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
