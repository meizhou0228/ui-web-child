import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Copy, Trash2 } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { TaskForm } from '@/components/TaskForm';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';
import type { Task } from '@/types';

export function TasksSection() {
  const tasks = useStore((s) => s.tasks);
  const records = useStore((s) => s.records);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const toggleActive = useStore((s) => s.toggleTaskActive);
  const removeTask = useStore((s) => s.removeTask);
  const restorePreset = useStore((s) => s.restorePresetTasks);
  const toast = useToast();
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  function recordCount(taskId: string) {
    return records.filter((r) => r.taskId === taskId).length;
  }

  return (
    <section className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setEditing('new')}
          className="flex-1 flex items-center justify-center gap-1 py-3 bg-sky-brand text-white rounded-big font-bold shadow-3d"
        ><Plus size={18} /> 新增任务</button>
        <button
          onClick={() => { restorePreset(); toast.show('success', '已补全预设'); }}
          className="px-4 py-3 bg-white rounded-big font-bold shadow-soft"
        >恢复预设</button>
      </div>

      <motion.ul layout className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className={`p-3 bg-white rounded-big shadow-soft flex items-center gap-3 ${!t.active ? 'opacity-50' : ''}`}>
            <Icon type="task" name={t.icon} size={40} />
            <div className="flex-1">
              <div className="font-bold">{t.name}</div>
              <div className="text-xs text-gray-500">+{t.points} · {t.repeatable === 'daily' ? '每日' : '一次性'} · 打过 {recordCount(t.id)} 次</div>
            </div>
            <input type="checkbox" checked={t.active} onChange={() => toggleActive(t.id)} className="w-5 h-5" />
            <button onClick={() => setEditing(t)} aria-label="edit"><Pencil size={18} /></button>
            <button
              onClick={() => addTask({ ...t, name: `${t.name} (副本)` })}
              aria-label="copy"
            ><Copy size={18} /></button>
            <button onClick={() => setDeleting(t)} aria-label="delete" className="text-rose-500"><Trash2 size={18} /></button>
          </li>
        ))}
      </motion.ul>

      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
              className="w-full sm:max-w-md bg-white rounded-t-huge sm:rounded-huge p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold mb-4">{editing === 'new' ? '新增任务' : '编辑任务'}</h3>
              <TaskForm
                initial={editing === 'new' ? undefined : { ...editing }}
                onSave={(data) => {
                  if (editing === 'new') {
                    addTask(data);
                    toast.show('success', '任务已添加');
                  } else {
                    updateTask(editing.id, data);
                    toast.show('success', '已保存');
                  }
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!deleting}
        title="删除任务？"
        body={deleting ? `「${deleting.name}」已打卡 ${recordCount(deleting.id)} 次。删除后历史仍保留。` : ''}
        destructive
        onConfirm={() => { if (deleting) { removeTask(deleting.id); toast.show('info', '已删除'); } setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
