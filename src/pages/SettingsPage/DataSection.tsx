import { useRef, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';
import { buildExport, parseImport, downloadJson } from '@/utils/exportImport';

export function DataSection() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmText, setConfirmText] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  function handleExport() {
    const state = useStore.getState();
    const payload = buildExport(state);
    downloadJson(`ui-web-child-backup-${new Date().toISOString().slice(0, 10)}.json`, payload);
    toast.show('success', '已导出');
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      try {
        const payload = parseImport(txt);
        useStore.setState((s) => ({
          ...s,
          child: payload.child,
          tasks: payload.tasks,
          records: payload.records,
          rewards: payload.rewards,
          redemptions: payload.redemptions,
          milestones: payload.milestones,
          unlockedMilestones: payload.unlockedMilestones,
        }));
        toast.show('success', '导入成功');
      } catch (err) {
        toast.show('error', '文件格式不对');
        console.error(err);
      }
    });
    e.target.value = '';
  }

  function handleClear() {
    if (confirmText !== '确认清空') {
      toast.show('error', '请输入"确认清空"');
      return;
    }
    localStorage.removeItem('ui-web-child:v1');
    location.reload();
  }

  return (
    <section className="space-y-3">
      <button onClick={handleExport}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-big font-bold shadow-3d"
      ><Download size={18} /> 导出数据 (JSON)</button>

      <label className="w-full flex items-center justify-center gap-2 py-3 bg-sky-brand text-white rounded-big font-bold shadow-3d cursor-pointer">
        <Upload size={18} /> 导入数据
        <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
      </label>

      <button onClick={() => setConfirmClear(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-big font-bold shadow-3d"
      ><Trash2 size={18} /> 清空全部数据</button>

      <ConfirmModal
        open={confirmClear}
        title="确定清空全部数据？"
        body={
          <div>
            <p className="mb-2 text-rose-600">此操作无法撤销！</p>
            <p className="mb-2">请输入「确认清空」继续：</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded border-2 border-gray-300"
            />
          </div>
        }
        destructive
        confirmText="清空"
        onConfirm={handleClear}
        onCancel={() => { setConfirmClear(false); setConfirmText(''); }}
      />
    </section>
  );
}
