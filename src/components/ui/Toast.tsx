'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'px-4 py-3 rounded-lg text-sm font-medium shadow-lg border animate-in slide-in-from-right-5 duration-300',
              t.type === 'success' && 'bg-[#162016] border-[#00a651] text-[#00c960]',
              t.type === 'error' && 'bg-[#1a0d0d] border-red-800 text-red-400',
              t.type === 'info' && 'bg-[#162016] border-[#1e2e1e] text-[#d4edda]',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
