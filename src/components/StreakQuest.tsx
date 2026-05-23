import { STREAK_REWARDS } from '@/constants/gamification';

interface Props {
  streak: number;
}

export function StreakQuest({ streak }: Props) {
  return (
    <section className="bg-white rounded-huge p-4 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-gray-500">连续打卡</div>
          <h2 className="text-lg font-bold">坚持小任务</h2>
        </div>
        <div className="text-2xl font-bold text-rose-500">{streak} 天</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {STREAK_REWARDS.map((item) => {
          const done = streak >= item.days;
          return (
            <div
              key={item.days}
              className={`rounded-big p-3 border ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}
            >
              <div className="text-sm font-bold">{item.title}</div>
              <div className="text-xs text-gray-500 mt-1">{item.description}</div>
              <div className={`text-xs mt-2 font-bold ${done ? 'text-emerald-700' : 'text-gray-400'}`}>
                {done ? '已解锁' : `还差 ${item.days - streak} 天`}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
