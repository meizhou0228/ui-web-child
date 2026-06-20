import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/Icon';
import { ConfirmModal } from '@/components/ConfirmModal';
import { BackfillModal } from '@/components/BackfillModal';
import { useStore } from '@/store';
import { formatHM } from '@/utils/date';
import type { CategoryId } from '@/types';

type Range = 'today' | 'week' | 'month' | 'all';
type Filter = 'all' | CategoryId;

export function HistoryPage() {
  const records = useStore((s) => s.records);
  const removeRecord = useStore((s) => s.removeRecord);
  const [range, setRange] = useState<Range>('week');
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [backfillOpen, setBackfillOpen] = useState(false);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = {
      today: now - 86400_000,
      week: now - 7 * 86400_000,
      month: now - 30 * 86400_000,
      all: 0,
    }[range];
    return records
      .filter((r) => r.timestamp >= cutoff)
      .filter((r) => filter === 'all' || r.taskSnapshot.categoryId === filter)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [records, range, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof records>();
    for (const r of filtered) {
      const list = map.get(r.date) ?? [];
      list.push(r);
      map.set(r.date, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">积分明细</h1>
        <button
          onClick={() => setBackfillOpen(true)}
          className="px-3 py-1.5 rounded-big bg-sky-brand text-white text-sm font-bold shadow-3d"
        >＋ 补打卡</button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(['today', 'week', 'month', 'all'] as Range[]).map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              range === r ? 'bg-sky-brand text-white' : 'bg-gray-100'
            }`}
          >{ {today: '今日', week: '本周', month: '本月', all: '全部'}[r] }</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(['all', 'study', 'life', 'sport'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === f ? 'bg-grape-brand text-white' : 'bg-gray-100'
            }`}
          >{ {all:'全部', study:'学习', life:'生活', sport:'运动'}[f] }</button>
        ))}
      </div>

      {grouped.size === 0 && <p className="text-center text-gray-500 py-10">还没有打卡记录</p>}

      {[...grouped.entries()].map(([date, list]) => {
        const sum = list.reduce((acc, r) => acc + r.points, 0);
        return (
          <section key={date}>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>📅 {date}</span>
              <span className="font-bold text-emerald-600">+{sum} 分</span>
            </div>
            <motion.ul layout className="space-y-2">
              {list.map((r) => (
                <li key={r.id}
                  onContextMenu={(e) => { e.preventDefault(); setConfirmDel(r.id); }}
                  className="flex items-center gap-3 p-3 bg-white rounded-big shadow-soft"
                >
                  <Icon type="task" name={r.taskSnapshot.icon} size={40} />
                  <div className="flex-1">
                    <div className="font-bold">{r.taskSnapshot.name}</div>
                    <div className="text-xs text-gray-500">{formatHM(r.timestamp)}</div>
                  </div>
                  <div className="text-emerald-600 font-bold">+{r.points}</div>
                </li>
              ))}
            </motion.ul>
          </section>
        );
      })}

      <ConfirmModal
        open={!!confirmDel}
        title="删除这条记录？"
        body="此操作无法撤销。"
        destructive
        onConfirm={() => { if (confirmDel) removeRecord(confirmDel); setConfirmDel(null); }}
        onCancel={() => setConfirmDel(null)}
      />

      <BackfillModal open={backfillOpen} onClose={() => setBackfillOpen(false)} />
    </div>
  );
}
