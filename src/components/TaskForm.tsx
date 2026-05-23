import { useState } from 'react';
import { Icon } from './Icon';
import { IconPicker } from './IconPicker';
import { PRESET_CATEGORIES } from '@/constants/categories';
import type { Task, CategoryId, RepeatType, TimeSlot } from '@/types';

type FormData = Omit<Task, 'id' | 'createdAt'>;

interface Props {
  initial?: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

const TIME_SLOTS: { id: TimeSlot; label: string }[] = [
  { id: 'morning', label: '早晨' },
  { id: 'daytime', label: '白天' },
  { id: 'evening', label: '晚间' },
];

export function TaskForm({ initial, onSave, onCancel }: Props) {
  const [data, setData] = useState<FormData>(initial ?? {
    categoryId: 'study',
    name: '',
    icon: 'book-open',
    points: 5,
    repeatable: 'daily',
    timeSlot: 'daytime',
    active: true,
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const valid = data.name.trim().length >= 1 && data.points >= 1 && data.points <= 100;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1">任务名</label>
        <input
          type="text"
          value={data.name}
          maxLength={20}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200 focus:border-sky-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">分类</label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setData({ ...data, categoryId: c.id as CategoryId })}
              className={`p-3 rounded-big border-2 ${
                data.categoryId === c.id ? 'border-sky-brand bg-sky-50' : 'border-gray-200'
              }`}
            >{c.name}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">图标</label>
        <button onClick={() => setPickerOpen(true)} className="flex items-center gap-3 p-3 rounded-big border-2 border-gray-200">
          <Icon type="task" name={data.icon} size={48} />
          <span className="text-gray-600">点击更换</span>
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">分数</label>
        <input
          type="number"
          min={1}
          max={100}
          value={data.points}
          onChange={(e) => setData({ ...data, points: Number(e.target.value) || 1 })}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200 focus:border-sky-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">重复</label>
        <div className="grid grid-cols-2 gap-2">
          {(['daily', 'once'] as RepeatType[]).map((r) => (
            <button
              key={r}
              onClick={() => setData({ ...data, repeatable: r })}
              className={`py-2 rounded-big border-2 ${
                data.repeatable === r ? 'border-sky-brand bg-sky-50' : 'border-gray-200'
              }`}
            >{r === 'daily' ? '每日' : '一次性'}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">时段</label>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((t) => (
            <button
              key={t.id}
              onClick={() => setData({ ...data, timeSlot: t.id })}
              className={`py-2 rounded-big border-2 ${
                data.timeSlot === t.id ? 'border-sky-brand bg-sky-50' : 'border-gray-200'
              }`}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {data.repeatable === 'daily' && (
        <div>
          <label className="block text-sm font-bold mb-1">每日可打卡次数</label>
          <input
            type="number"
            min={1}
            max={20}
            value={data.dailyLimit ?? 1}
            onChange={(e) => setData({ ...data, dailyLimit: Number(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-big border-2 border-gray-200"
          />
          <p className="text-xs text-gray-500 mt-1">设为 1 表示每天 1 次；多于 1 次允许重复加分（例如帮做家务）</p>
        </div>
      )}

      {data.repeatable === 'once' && (
        <div>
          <label className="block text-sm font-bold mb-1">每周可打卡次数</label>
          <input
            type="number"
            min={1}
            max={7}
            value={data.weeklyLimit ?? 1}
            onChange={(e) => setData({ ...data, weeklyLimit: Number(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-big border-2 border-gray-200"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-big bg-gray-100 font-bold">取消</button>
        <button
          disabled={!valid}
          onClick={() => onSave(data)}
          className={`flex-1 py-3 rounded-big text-white font-bold shadow-3d ${
            valid ? 'bg-sky-brand' : 'bg-gray-300'
          }`}
        >保存</button>
      </div>

      <IconPicker
        open={pickerOpen}
        type="task"
        value={data.icon}
        onPick={(name) => setData({ ...data, icon: name })}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
