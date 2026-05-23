import { motion } from 'framer-motion';
import { Icon } from './Icon';
import { withinUndoWindow, formatHM } from '@/utils/date';
import type { Task, Record as PointRecord } from '@/types';

interface Props {
  task: Task;
  todayRecord?: PointRecord;
  onCheckIn: () => void;
  onUndo: () => void;
}

export function TaskItem({ task, todayRecord, onCheckIn, onUndo }: Props) {
  const done = !!todayRecord;
  const canUndo = done && withinUndoWindow(todayRecord!.timestamp);

  return (
    <motion.div
      layout
      whileHover={!done ? { y: -2, rotateX: 4 } : undefined}
      whileTap={!done ? { scale: 0.97 } : undefined}
      className={`p-4 rounded-big bg-white shadow-soft flex items-center gap-4 cursor-pointer ${done ? 'opacity-70' : ''}`}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
      onClick={!done ? onCheckIn : undefined}
      data-testid={`task-${task.id}`}
    >
      <Icon type="task" name={task.icon} size={56} animated={!done} />
      <div className="flex-1">
        <div className="font-bold text-lg">{task.name}</div>
        <div className="text-sm text-gray-500">+{task.points} 分</div>
        {done && (
          <div className="text-xs text-emerald-600 mt-1">
            已完成 ✅ {formatHM(todayRecord!.timestamp)}
          </div>
        )}
      </div>
      {!done && (
        <button
          className="px-4 py-2 rounded-big bg-sky-brand text-white font-bold shadow-3d"
          aria-label="check in"
        >打卡</button>
      )}
      {done && canUndo && (
        <button
          onClick={(e) => { e.stopPropagation(); onUndo(); }}
          className="text-xs text-gray-500 underline"
          aria-label="undo"
        >撤销</button>
      )}
    </motion.div>
  );
}
