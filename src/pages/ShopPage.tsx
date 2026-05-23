import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShopCard } from '@/components/ShopCard';
import { ConfirmModal } from '@/components/ConfirmModal';
import { TreasureChestScene } from '@/components/scenes/TreasureChestScene';
import { Icon } from '@/components/Icon';
import { useStore } from '@/store';
import { selectBalance } from '@/store/selectors';
import { useToast } from '@/components/ToastProvider';
import { formatHM, formatDateZh } from '@/utils/date';
import { celebrateRedemption } from '@/utils/celebrate';

export function ShopPage() {
  const balance = useStore(selectBalance);
  const rewards = useStore((s) => s.rewards.filter((r) => r.active));
  const redemptions = useStore((s) => s.redemptions);
  const redeem = useStore((s) => s.redeem);
  const fulfill = useStore((s) => s.fulfillRedemption);
  const cancel = useStore((s) => s.cancelRedemption);
  const toast = useToast();
  const [tab, setTab] = useState<'shop' | 'records'>('shop');
  const [pendingRedeem, setPendingRedeem] = useState<string | null>(null);
  const [chest, setChest] = useState<{ name: string; icon: string } | null>(null);

  function handleRedeem(rewardId: string) {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;
    const ok = redeem(rewardId);
    if (!ok) {
      toast.show('error', '积分不够呢');
      return;
    }
    setChest({ name: reward.name, icon: reward.icon });
    celebrateRedemption();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-br from-grape-brand to-sky-brand rounded-huge p-5 text-white shadow-soft">
        <div className="text-sm opacity-90">可用积分</div>
        <div className="text-4xl font-bold">{balance}</div>
      </div>

      <div className="flex gap-2">
        {(['shop', 'records'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-big font-bold ${
              tab === t ? 'bg-sky-brand text-white' : 'bg-white shadow-soft'
            }`}
          >{t === 'shop' ? '可兑换' : '兑换记录'}</button>
        ))}
      </div>

      {tab === 'shop' && (
        <motion.div layout className="grid grid-cols-2 gap-3">
          {rewards.map((r) => (
            <ShopCard
              key={r.id}
              reward={r}
              balance={balance}
              onRedeem={() => setPendingRedeem(r.id)}
            />
          ))}
        </motion.div>
      )}

      {tab === 'records' && (
        <ul className="space-y-2">
          {[...redemptions].sort((a, b) => b.timestamp - a.timestamp).map((r) => (
            <li key={r.id} className="p-3 bg-white rounded-big shadow-soft flex items-center gap-3">
              <Icon type="reward" name={r.rewardSnapshot.icon} size={44} />
              <div className="flex-1">
                <div className="font-bold">{r.rewardSnapshot.name}</div>
                <div className="text-xs text-gray-500">
                  {formatDateZh(new Date(r.timestamp).toISOString().slice(0, 10))} {formatHM(r.timestamp)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-rose-500 font-bold">-{r.cost}</div>
                <StatusBadge status={r.status} />
                {r.status === 'pending' && (
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => { fulfill(r.id); toast.show('success', '已发放'); }}
                      className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">发放</button>
                    <button onClick={() => { cancel(r.id); toast.show('info', '已取消'); }}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">取消</button>
                  </div>
                )}
              </div>
            </li>
          ))}
          {redemptions.length === 0 && <p className="text-center text-gray-500 py-10">还没有兑换</p>}
        </ul>
      )}

      <ConfirmModal
        open={!!pendingRedeem}
        title="确定兑换吗？"
        body="兑换后会扣除相应积分。"
        onConfirm={() => { if (pendingRedeem) handleRedeem(pendingRedeem); setPendingRedeem(null); }}
        onCancel={() => setPendingRedeem(null)}
      />

      <TreasureChestScene
        open={!!chest}
        rewardName={chest?.name ?? ''}
        rewardIcon={chest?.icon ?? 'gift'}
        onClose={() => setChest(null)}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'fulfilled' | 'cancelled' }) {
  const cfg = {
    pending:   { txt: '待发放', cls: 'bg-amber-100 text-amber-700' },
    fulfilled: { txt: '已发放', cls: 'bg-emerald-100 text-emerald-700' },
    cancelled: { txt: '已取消', cls: 'bg-gray-100 text-gray-500' },
  }[status];
  return <span className={`text-xs px-2 py-0.5 rounded ${cfg.cls}`}>{cfg.txt}</span>;
}
