import { motion } from 'framer-motion';
import { ADVENTURE_STOPS } from '@/constants/gamification';

interface Props {
  progress: number;
  completed: number;
  total: number;
}

export function AdventureMap({ progress, completed, total }: Props) {
  const activeIndex = Math.min(
    ADVENTURE_STOPS.length - 1,
    Math.floor(progress * ADVENTURE_STOPS.length),
  );

  return (
    <section className="bg-white rounded-huge p-4 shadow-soft overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-500">今日成长地图</div>
          <h2 className="text-lg font-bold">去小学城堡的路</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-sky-600">{Math.round(progress * 100)}%</div>
          <div className="text-xs text-gray-500">{completed}/{total} 已完成</div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-5 right-5 top-1/2 h-2 -translate-y-1/2 rounded-full bg-sky-100" />
        <motion.div
          className="absolute left-5 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-400 to-mint"
          initial={false}
          animate={{ width: `${Math.max(progress * 100, 8)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
        <div className="relative z-10 grid grid-cols-5 gap-1">
          {ADVENTURE_STOPS.map((stop, index) => {
            const active = index <= activeIndex;
            return (
              <div key={stop.label} className="flex flex-col items-center text-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full border-4 flex items-center justify-center text-lg shadow-soft ${
                    active ? 'bg-gold border-white' : 'bg-gray-100 border-white'
                  }`}
                >
                  {active ? '⭐' : '•'}
                </div>
                <div className="min-h-[3.5rem]">
                  <div className="text-xs font-bold">{stop.label}</div>
                  <div className="text-[11px] text-gray-500 leading-tight">{stop.hint}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
