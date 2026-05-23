import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ScoreCard } from '@/components/ScoreCard';
import { TaskItem } from '@/components/TaskItem';
import { BirthdayBanner } from '@/components/BirthdayBanner';
import { FloatingBackground } from '@/components/FloatingBackground';
import { MascotCorner } from '@/components/MascotCorner';
import { AdventureMap } from '@/components/AdventureMap';
import { TodayEncouragement } from '@/components/TodayEncouragement';
import { useStore } from '@/store';
import { selectTodayCountsByTask, selectTodayLastRecordByTask } from '@/store/selectors';
import { isoWeekKey } from '@/utils/date';
import { useDayChange } from '@/hooks/useDayChange';
import { useToast } from '@/components/ToastProvider';
import { celebrateCheckIn, celebrateMilestone } from '@/utils/celebrate';
import { play } from '@/utils/sound';
import { pickEncouragement } from '@/constants/encouragements';
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

  const weekCountsByTask = useMemo(() => {
    const week = isoWeekKey();
    const m = new Map<string, number>();
    for (const r of records) {
      if (isoWeekKey(r.timestamp) !== week) continue;
      m.set(r.taskId, (m.get(r.taskId) ?? 0) + 1);
    }
    return m;
  }, [records]);

  const activeTasks = useMemo(() => tasks.filter((t) => t.active), [tasks]);
  const completedToday = useMemo(
    () => activeTasks.filter((t) => resolveCount(t) >= taskLimit(t)).length,
    [activeTasks, todayCounts, weekCountsByTask],
  );
  const adventureProgress = activeTasks.length > 0 ? completedToday / activeTasks.length : 0;

  function resolveCount(t: Task): number {
    return t.repeatable === 'daily' ? (todayCounts.get(t.id) ?? 0) : (weekCountsByTask.get(t.id) ?? 0);
  }

  function handleCheckIn(t: Task, e?: React.MouseEvent) {
    const r = checkIn(t.id);
    if (!r) {
      const limit = taskLimit(t);
      toast.show('warning', limit > 1 ? `今日已满 ${limit} 次` : '今天已经完成过啦');
      return;
    }
    // Celebrate with confetti at click position (or center)
    const origin = e
      ? { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
      : undefined;
    celebrateCheckIn(origin);
    play('ding');
    toast.show('success', `${pickEncouragement()} ${t.name} +${t.points}`);

    const m = checkMilestones();
    if (m) {
      setUnlocked(m);
      celebrateMilestone();
      play('milestone');
    }
  }

  function handleUndo(recordId: string) {
    if (undo(recordId)) toast.show('info', '撤销成功');
    else toast.show('warning', '已超过撤销时间');
  }

  return (
    <div className="relative p-4 space-y-4 min-h-[80vh]">
      <FloatingBackground count={9} />
      <div className="relative z-10 space-y-4">
        <BirthdayBanner />
        <ScoreCard />
        {activeTasks.length > 0 && (
          <>
            <AdventureMap
              progress={adventureProgress}
              completed={completedToday}
              total={activeTasks.length}
            />
            <TodayEncouragement progress={adventureProgress} />
          </>
        )}
        {SLOTS.map(({ id, label, emoji }) => (
          grouped[id].length > 0 && (
            <section key={id}>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <span>{emoji}</span>
                <span>{label}</span>
                <span className="text-xs text-gray-400 font-normal">
                  {grouped[id].filter((t) => resolveCount(t) >= taskLimit(t)).length}/{grouped[id].length}
                </span>
              </h2>
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
                      onCheckIn={(e) => handleCheckIn(t, e)}
                      onUndo={() => last && handleUndo(last.id)}
                    />
                  );
                })}
              </motion.div>
            </section>
          )
        ))}
        {activeTasks.length === 0 && (
          <div className="bg-white rounded-huge p-8 text-center shadow-soft">
            <div className="text-5xl mb-2">📝</div>
            <p className="text-gray-600">还没有任务，去「设置 → 任务」添加吧！</p>
          </div>
        )}
      </div>
      <MascotCorner />
    </div>
  );
}
