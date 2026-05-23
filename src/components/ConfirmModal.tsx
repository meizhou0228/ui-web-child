import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open, title, body, confirmText = '确定', cancelText = '取消',
  destructive = false, onConfirm, onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-white rounded-huge p-6 shadow-soft max-w-sm w-full"
            initial={{ scale: 0.85 }} animate={{ scale: 1 }} exit={{ scale: 0.85 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            {body && <div className="text-gray-700 mb-5">{body}</div>}
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-3 rounded-big bg-gray-100 font-bold">
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 rounded-big text-white font-bold shadow-3d ${
                  destructive ? 'bg-rose-500' : 'bg-sky-brand'
                }`}
              >{confirmText}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
