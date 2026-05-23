import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { nanoid } from 'nanoid';
import { ToastList, type ToastData, type ToastLevel } from './Toast';

interface ToastApi {
  show: (level: ToastLevel, message: string, durationMs?: number) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const dismiss = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);
  const show = useCallback((level: ToastLevel, message: string, durationMs = 3000) => {
    const id = nanoid();
    setToasts((cur) => [...cur, { id, level, message }]);
    setTimeout(() => dismiss(id), durationMs);
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
