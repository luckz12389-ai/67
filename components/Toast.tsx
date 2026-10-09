'use client';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

type ToastItem = { id: number; kind: 'ok' | 'err'; text: string };
const Ctx = createContext<(kind: 'ok' | 'err', text: string) => void>(() => {});

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((kind: 'ok' | 'err', text: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, kind, text }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 4000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((i) => (
          <div key={i.id} className={`toast ${i.kind}`}>
            {i.kind === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{i.text}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
