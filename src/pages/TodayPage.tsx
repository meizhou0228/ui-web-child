import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScoreCard } from '@/components/ScoreCard';
import { TaskItem } from '@/components/TaskItem';
import { useStore } from '@/store';
import { selectTodayCountsByTask, selectTodayLastRecordByTask } from '@/store/selectors';
import { isoWeekKey } from '@/utils/date';
import { useDayChange } from '@/hooks/useDayChange';
import { useToast } from '@/components/ToastProvider';
import type { TimeSlot, Task } from '@/types';

const SLOTS: { id: TimeSlot; label: string; emoji: string }[] = [
  { id: 'morning', label: '早晨', emoji: '🌅' },
  { id: 'daytime', label: '白天', emoji: '☀️' },
  { id: 'evening', label: '晚间', emoji: '🌙' },
];

function taskLimit(t: Task): number {
  if (t.repeatable === 'daily') return t.dailyLimit ?? 1;
  return t.weeklyLimit ?? 1;
}

export function TodayPage() {
  useDayChange();
  const tasks = useStore((s) => s.tasks);
  const records = useStore((s) => s.records);
  const todayCounts = useStore(selectTodayCountsByTask);
  const todayLasts = useStore(selectTodayLastRecordByTask);
  const checkIn = useStore((s) => s.checkIn);
  const undo = useStore((s) => s.undoRecord);
  const checkMilestones = useStore((s) => s.checkMilestones);
  const setUnlocked = useStore((s) => s.setRecentlyUnlocked);
  const toast = useToast();

  const grouped = useMemo(() => {
    const map: Record<TimeSlot, Task[]> = { morning: [], daytime: [], evening: [] };
    for (const t of tasks) {
      if (!t.active) continue;
      map[t.timeSlot].push(t);
    }
    return map;
  }, [tasks]);

  // For once-tasks, count uses current ISO week instead of today.
  const weekCountsByTask = useMemo(() => {
    const week = isoWeekKey();
    const m = new Map<string, number>();
    for (const r of records) {
      if (isoWeekKey(r.timestamp) !== week) continue;
      m.set(r.taskId, (m.get(r.taskId) ?? 0) + 1);
    }
    return m;
  }, [records]);

  function resolveCount(t: Task): number {
    return t.repeatable === 'daily' ? (todayCounts.get(t.id) ?? 0) : (weekCountsByTask.get(t.id) ?? 0);
  }

  function handleCheckIn(t: Task) {
    const r = checkIn(t.id);
    if (!r) {
      const limit = taskLimit(t);
      toast.show('warning', limit > 1 ? `今日已满 ${limit} 次` : '今天已经完成过啦');
      return;
    }
    toast.show('success', `${t.name} +${t.points} 分！`);
    const m = checkMilestones();
    if (m) setUnlocked(m);
  }

  function handleUndo(recordId: string) {
    if (undo(recordId)) toast.show('info', '撤销成功');
    else toast.show('warning', '已超过撤销时间');
  }

  return (
    <div className="p-4 space-y-4">
      <ScoreCard />
      {SLOTS.map(({ id, label, emoji }) => (
        grouped[id].length > 0 && (
          <section key={id}>
            <h2 className="text-lg font-bold mb-2">{emoji} {label}</h2>
            <motion.div layout className="space-y-3">
              {grouped[id].map((t) => {
                const count = resolveCount(t);
                const last = todayLasts.get(t.id);
                return (
                  <TaskItem
                    key={t.id}
                    task={t}
                    count={count}
                    limit={taskLimit(t)}
                    lastRecord={last}
                    onCheckIn={() => handleCheckIn(t)}
                    onUndo={() => last && handleUndo(last.id)}
                  />
                );
              })}
            </motion.div>
          </section>
        )
      ))}
    </div>
  );
}
