import { useState } from 'react';
import { Icon } from './Icon';
import { IconPicker } from './IconPicker';
import type { Reward } from '@/types';

type FormData = Omit<Reward, 'id' | 'createdAt'>;

interface Props {
  initial?: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

export function RewardForm({ initial, onSave, onCancel }: Props) {
  const [data, setData] = useState<FormData>(initial ?? {
    name: '',
    icon: 'gift',
    cost: 50,
    stock: null,
    active: true,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const valid = data.name.trim().length >= 1 && data.cost >= 1;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1">奖励名</label>
        <input
          type="text"
          value={data.name}
          maxLength={20}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200 focus:border-sky-brand focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">图标</label>
        <button onClick={() => setPickerOpen(true)} className="flex items-center gap-3 p-3 rounded-big border-2 border-gray-200">
          <Icon type="reward" name={data.icon} size={48} />
          <span className="text-gray-600">点击更换</span>
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">兑换分数</label>
        <input
          type="number"
          min={1}
          max={9999}
          value={data.cost}
          onChange={(e) => setData({ ...data, cost: Number(e.target.value) || 1 })}
          className="w-full px-4 py-2 rounded-big border-2 border-gray-200"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-bold mb-1">
          <input
            type="checkbox"
            checked={data.stock === null}
            onChange={(e) => setData({ ...data, stock: e.target.checked ? null : 1 })}
          />
          无限量
        </label>
        {data.stock !== null && (
          <input
            type="number"
            min={1}
            value={data.stock}
            onChange={(e) => setData({ ...data, stock: Number(e.target.value) || 1 })}
            className="w-full px-4 py-2 rounded-big border-2 border-gray-200 mt-2"
          />
        )}
      </div>

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
        type="reward"
        value={data.icon}
        onPick={(name) => setData({ ...data, icon: name })}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
