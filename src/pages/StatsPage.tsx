import { useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { useStore } from '@/store';
import {
  selectTotalEarned, selectStreak, selectTodayPoints,
} from '@/store/selectors';
import type { CategoryId } from '@/types';

const CATEGORY_COLOR: Record<CategoryId, string> = {
  study: '#7DD3FC',
  life:  '#FCD34D',
  sport: '#A7F3D0',
};

export function StatsPage() {
  const records = useStore((s) => s.records);
  const unlockedCount = useStore((s) => s.unlockedMilestones.length);
  const streak = useStore(selectStreak);
  const earned = useStore(selectTotalEarned);
  const today = useStore(selectTodayPoints);

  const last7Days = useMemo(() => {
    const arr: { date: string; label: string; points: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day');
      const key = d.format('YYYY-MM-DD');
      const points = records.filter((r) => r.date === key).reduce((s, r) => s + r.points, 0);
      arr.push({ date: key, label: d.format('M/D'), points });
    }
    return arr;
  }, [records]);

  const thisWeekByCategory = useMemo(() => {
    const start = dayjs().startOf('isoWeek').valueOf();
    const totals: Record<CategoryId, number> = { study: 0, life: 0, sport: 0 };
    for (const r of records) {
      if (r.timestamp >= start) totals[r.taskSnapshot.categoryId] += r.points;
    }
    return [
      { name: '学习', value: totals.study, color: CATEGORY_COLOR.study },
      { name: '生活', value: totals.life,  color: CATEGORY_COLOR.life },
      { name: '运动', value: totals.sport, color: CATEGORY_COLOR.sport },
    ].filter((x) => x.value > 0);
  }, [records]);

  const last30Cumulative = useMemo(() => {
    const arr: { date: string; total: number }[] = [];
    let cum = 0;
    const start = dayjs().subtract(29, 'day');
    for (let i = 0; i < 30; i++) {
      const d = start.add(i, 'day');
      const key = d.format('YYYY-MM-DD');
      cum += records.filter((r) => r.date === key).reduce((s, r) => s + r.points, 0);
      arr.push({ date: d.format('M/D'), total: cum });
    }
    return arr;
  }, [records]);

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-2xl font-bold">数据看看看</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card label="连续打卡" value={`${streak} 天 🔥`} />
        <Card label="徽章数"   value={`${unlockedCount} 🏅`} />
        <Card label="本周得分" value={`${last7Days.reduce((s, d) => s + d.points, 0)}`} />
        <Card label="累计 / 今日" value={`${earned} / ${today}`} />
      </div>

      <Section title="近 7 天每日得分">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7Days}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="points" fill="#7DD3FC" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="本周分类占比">
        {thisWeekByCategory.length === 0 ? <p className="text-gray-500 text-center py-10">本周还没打卡</p> : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={thisWeekByCategory} dataKey="value" nameKey="name" outerRadius={80} label>
                {thisWeekByCategory.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Section>

      <Section title="近 30 天累计趋势">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={last30Cumulative}>
            <XAxis dataKey="date" interval={4} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#C4B5FD" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-big p-3 shadow-soft">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-huge p-4 shadow-soft">
      <h2 className="font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}
