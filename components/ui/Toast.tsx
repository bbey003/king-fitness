'use client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

interface Ctx {
  push: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string): void => {
    const id = Math.random().toString(36).slice(2);
    setToasts((curr) => [...curr, { id, kind, message }]);
    setTimeout(() => {
      setToasts((curr) => curr.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-glow border backdrop-blur-md text-sm font-medium ${
              t.kind === 'success'
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                : t.kind === 'error'
                ? 'bg-red-500/15 border-red-400/40 text-red-200'
                : 'bg-brand-500/15 border-brand-400/40 text-brand-100'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { push: (_k, _m): void => undefined };
  }
  return ctx;
}

export function useToastEffect(message: string | null, kind: ToastKind = 'info'): void {
  const { push } = useToast();
  useEffect(() => {
    if (message) push(kind, message);
  }, [message, kind, push]);
}
