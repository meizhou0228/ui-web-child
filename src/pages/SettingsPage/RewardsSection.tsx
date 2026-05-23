import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Copy, Trash2 } from 'lucide-react';
import { Icon } from '@/components/Icon';
import { RewardForm } from '@/components/RewardForm';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';
import type { Reward } from '@/types';

export function RewardsSection() {
  const rewards = useStore((s) => s.rewards);
  const addReward = useStore((s) => s.addReward);
  const updateReward = useStore((s) => s.updateReward);
  const toggleActive = useStore((s) => s.toggleRewardActive);
  const removeReward = useStore((s) => s.removeReward);
  const restorePreset = useStore((s) => s.restorePresetRewards);
  const redemptions = useStore((s) => s.redemptions);
  const toast = useToast();
  const [editing, setEditing] = useState<Reward | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Reward | null>(null);

  function redeemCount(rewardId: string) {
    return redemptions.filter((r) => r.rewardId === rewardId).length;
  }

  return (
    <section className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => setEditing('new')}
          className="flex-1 flex items-center justify-center gap-1 py-3 bg-sky-brand text-white rounded-big font-bold shadow-3d"
        ><Plus size={18} /> 新增奖励</button>
        <button onClick={() => { restorePreset(); toast.show('success', '已补全预设'); }}
          className="px-4 py-3 bg-white rounded-big font-bold shadow-soft"
        >恢复预设</button>
      </div>

      <motion.ul layout className="space-y-2">
        {rewards.map((r) => (
          <li key={r.id} className={`p-3 bg-white rounded-big shadow-soft flex items-center gap-3 ${!r.active ? 'opacity-50' : ''}`}>
            <Icon type="reward" name={r.icon} size={40} />
            <div className="flex-1">
              <div className="font-bold">{r.name}</div>
              <div className="text-xs text-gray-500">{r.cost} 分 · 被兑过 {redeemCount(r.id)} 次</div>
            </div>
            <input type="checkbox" checked={r.active} onChange={() => toggleActive(r.id)} className="w-5 h-5" />
            <button onClick={() => setEditing(r)} aria-label="edit"><Pencil size={18} /></button>
            <button onClick={() => addReward({ ...r, name: `${r.name} (副本)` })} aria-label="copy"><Copy size={18} /></button>
            <button onClick={() => setDeleting(r)} aria-label="delete" className="text-rose-500"><Trash2 size={18} /></button>
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
              <h3 className="text-xl font-bold mb-4">{editing === 'new' ? '新增奖励' : '编辑奖励'}</h3>
              <RewardForm
                initial={editing === 'new' ? undefined : { ...editing }}
                onSave={(data) => {
                  if (editing === 'new') {
                    addReward(data);
                    toast.show('success', '奖励已添加');
                  } else {
                    updateReward(editing.id, data);
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
        title="删除奖励？"
        body={deleting ? `「${deleting.name}」已被兑换 ${redeemCount(deleting.id)} 次。历史保留。` : ''}
        destructive
        onConfirm={() => { if (deleting) { removeReward(deleting.id); toast.show('info', '已删除'); } setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </section>
  );
}
