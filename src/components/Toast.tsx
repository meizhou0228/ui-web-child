import { AnimatePresence, motion } from 'framer-motion';

export type ToastLevel = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  level: ToastLevel;
  message: string;
}

const COLOR: Record<ToastLevel, string> = {
  success: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  error:   'bg-rose-100   text-rose-900   border-rose-300',
  warning: 'bg-amber-100  text-amber-900  border-amber-300',
  info:    'bg-sky-100    text-sky-900    border-sky-300',
};

const ICON: Record<ToastLevel, string> = {
  success: '🎉', error: '⚠️', warning: '🔔', info: 'ℹ️',
};

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  return (
    <motion.div
      layout
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className={`pointer-events-auto px-5 py-3 rounded-big border-2 shadow-soft flex items-center gap-3 ${COLOR[toast.level]}`}
      onClick={onDismiss}
    >
      <span className="text-2xl">{ICON[toast.level]}</span>
      <span className="font-semibold">{toast.message}</span>
    </motion.div>
  );
}

export function ToastList({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
