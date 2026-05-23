import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { ICON_CATALOG, type IconType } from '@/constants/iconCatalog';

interface IconPickerProps {
  open: boolean;
  type: IconType;
  value?: string;
  onPick: (name: string) => void;
  onClose: () => void;
}

export function IconPicker({ open, type, value, onPick, onClose }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const items = (ICON_CATALOG[type] as readonly string[]).filter((n) => n.includes(search));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full sm:max-w-md bg-white rounded-t-huge sm:rounded-huge p-6 shadow-soft"
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-3">选个图标</h3>
            <input
              type="text"
              placeholder="搜索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-big border-2 border-gray-200 mb-4 focus:outline-none focus:border-sky-brand"
            />
            <div className="grid grid-cols-6 gap-3 max-h-80 overflow-y-auto">
              {items.map((n) => (
                <button
                  key={n}
                  onClick={() => { onPick(n); onClose(); }}
                  className={`p-2 rounded-big ${value === n ? 'bg-sky-100 ring-2 ring-sky-brand' : 'hover:bg-gray-100'}`}
                >
                  <Icon type={type} name={n} size={48} />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
