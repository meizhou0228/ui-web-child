import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dayjs from 'dayjs';
import { Icon } from './Icon';
import { useStore } from '@/store';
import { useToast } from './ToastProvider';

interface Props {
  open: boolean;
  onClose: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function BackfillModal({ open, onClose }: Props) {
  const tasks = useStore((s) => s.tasks);
  const records = useStore((s) => s.records);
  const backfillCheckIn = useStore((s) => s.backfillCheckIn);
  const removeRecord = useStore((s) => s.removeRecord);
  const checkMilestones = useStore((s) => s.checkMilestones);
  const setUnlocked = useStore((s) => s.setRecentlyUnlocked);
  const toast = useToast();

  const days = Array.from({ length: 7 }, (_, i) => dayjs().subtract(i, 'day'));
  const todayStr = dayjs().format('YYYY-MM-DD');
  const [selected, setSelected] = useState(dayjs().subtract(1, 'day').format('YYYY-MM-DD'));

  const activeTasks = tasks.filter((t) => t.active);

  function handleTap(taskId: string, name: string, points: number) {
    const r = backfillCheckIn(taskId, selected);
    if (!r) {
      toast.show('warning', '那天已经完成过啦');
      return;
    }
    toast.show('success', `已补打卡 ${name} +${points}`);
    const m = checkMilestones();
    if (m) setUnlocked(m);
  }

  function handleUndo(recordId: string, name: string) {
    removeRecord(recordId);
    toast.show('info', `已撤销 ${name}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-t-huge p-5 w-full max-w-md max-h-[80vh] overflow-y-auto"
            initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold">补打卡</h3>
              <button onClick={onClose} aria-label="close" className="text-gray-400 text-2xl leading-none px-2">×</button>
            </div>

            <div className="flex gap-2 overflow-x-auto mb-4 pb-1">
              {days.map((d) => {
                const key = d.format('YYYY-MM-DD');
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={`flex flex-col items-center px-3 py-2 rounded-big whitespace-nowrap ${
                      selected === key ? 'bg-sky-brand text-white' : 'bg-gray-100'
                    }`}
                  >
                    <span className="text-xs">{key === todayStr ? '今天' : `周${WEEKDAYS[d.day()]}`}</span>
                    <span className="text-sm font-bold">{d.format('M/D')}</span>
                  </button>
                );
              })}
            </div>

            {activeTasks.length === 0 && (
              <p className="text-center text-gray-500 py-6">还没有任务，去「设置 → 任务」添加吧！</p>
            )}

            <ul className="space-y-2">
              {activeTasks.map((t) => {
                const dayRecords = records.filter((r) => r.taskId === t.id && r.date === selected);
                const count = dayRecords.length;
                const lastBackfilled = dayRecords
                  .filter((r) => r.backfilled)
                  .sort((a, b) => b.timestamp - a.timestamp)[0];
                return (
                  <li key={t.id} className="flex items-center gap-2">
                    <button
                      onClick={() => handleTap(t.id, t.name, t.points)}
                      aria-label={`backfill-${t.id}`}
                      className="flex-1 flex items-center gap-3 p-3 bg-white rounded-big shadow-soft text-left"
                    >
                      <Icon type="task" name={t.icon} size={40} />
                      <div className="flex-1">
                        <div className="font-bold">{t.name}</div>
                        <div className="text-xs text-gray-500">
                          +{t.points} 分{count > 0 ? ` · 已记 ${count} 次` : ''}
                        </div>
                      </div>
                    </button>
                    {lastBackfilled && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUndo(lastBackfilled.id, t.name); }}
                        aria-label={`undo-backfill-${t.id}`}
                        className="shrink-0 px-3 py-2 rounded-big bg-gray-100 text-gray-500 text-sm font-bold"
                      >✕ 撤销</button>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
