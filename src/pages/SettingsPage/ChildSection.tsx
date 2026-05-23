import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { IconPicker } from '@/components/IconPicker';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';

export function ChildSection() {
  const child = useStore((s) => s.child);
  const setName = useStore((s) => s.setChildName);
  const setIcon = useStore((s) => s.setChildIcon);
  const setBd   = useStore((s) => s.setChildBirthday);
  const toast = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <section className="space-y-4 bg-white rounded-huge p-4 shadow-soft">
      <div>
        <label className="block text-sm font-bold mb-1">名字</label>
        <input
          type="text"
          value={child.name}
          maxLength={12}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => toast.show('success', '已保存')}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200 focus:border-sky-brand focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">头像</label>
        <button onClick={() => setPickerOpen(true)} className="flex items-center gap-3 p-3 rounded-big border-2 border-gray-200">
          <Icon type="child" name={child.icon} size={64} />
          <span className="text-gray-600">点击更换</span>
        </button>
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">生日</label>
        <input
          type="date"
          value={child.birthday ?? ''}
          onChange={(e) => setBd(e.target.value)}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200"
        />
      </div>
      <IconPicker
        open={pickerOpen}
        type="child"
        value={child.icon}
        onPick={(name) => { setIcon(name); toast.show('success', '头像已更换'); }}
        onClose={() => setPickerOpen(false)}
      />
    </section>
  );
}
