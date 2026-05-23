import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { IconPicker } from '@/components/IconPicker';
import { useStore } from '@/store';
import { useToast } from '@/components/ToastProvider';
import { isSoundOn, setSoundOn, play } from '@/utils/sound';

export function ChildSection() {
  const child = useStore((s) => s.child);
  const setName = useStore((s) => s.setChildName);
  const setIcon = useStore((s) => s.setChildIcon);
  const setBd   = useStore((s) => s.setChildBirthday);
  const toast = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [soundOn, setSoundOnLocal] = useState(isSoundOn());

  function toggleSound() {
    const next = !soundOn;
    setSoundOnLocal(next);
    setSoundOn(next);
    if (next) play('ding');
    toast.show('success', next ? '声音已开启' : '声音已关闭');
  }

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
        <p className="text-xs text-gray-500 mt-1">生日当天打开有惊喜哦 🎂</p>
      </div>
      <div>
        <label className="flex items-center justify-between p-3 rounded-big border-2 border-gray-200 cursor-pointer">
          <span className="font-bold">声音效果</span>
          <input
            type="checkbox"
            checked={soundOn}
            onChange={toggleSound}
            className="w-5 h-5"
          />
        </label>
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
