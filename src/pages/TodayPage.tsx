import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScoreCard } from '@/components/ScoreCard';
import { TaskItem } from '@/components/TaskItem';
import { useStore } from '@/store';
import { selectTodayCheckedTaskIds } from '@/store/selectors';
import { useDayChange } from '@/hooks/useDayChange';
import { useToast } from '@/components/ToastProvider';
import type { TimeSlot, Task } from '@/types';

const SLOTS: { id: TimeSlot; label: string; emoji: string }[] = [
  { id: 'morning', label: '早晨', emoji: '🌅' },
  { id: 'daytime', label: '白天', emoji: '☀️' },
  { id: 'evening', label: '晚间', emoji: '🌙' },
];

export function TodayPage() {
  useDayChange();
  const tasks = useStore((s) => s.tasks);
  const records = useStore((s) => s.records);
  const checkedIds = useStore(selectTodayCheckedTaskIds);
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

  function handleCheckIn(taskId: string, taskName: string, points: number) {
    const r = checkIn(taskId);
    if (!r) {
      toast.show('warning', '今天已经完成过啦');
      return;
    }
    toast.show('success', `${taskName} +${points} 分！`);
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
                const isChecked = checkedIds.has(t.id);
                const todayRec = isChecked ? records.find((r) => r.taskId === t.id && r.date === records.find((rr) => rr.taskId === t.id)?.date) : undefined;
                return (
                  <TaskItem
                    key={t.id}
                    task={t}
                    todayRecord={todayRec}
                    onCheckIn={() => handleCheckIn(t.id, t.name, t.points)}
                    onUndo={() => todayRec && handleUndo(todayRec.id)}
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
