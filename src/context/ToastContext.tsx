import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ToastValue {
  /** Show a transient confirmation. Returns nothing; messages queue if repeated. */
  show: (message: string) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

interface ToastItem {
  id: number;
  message: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string) => {
    const id = nextId.current++;
    setItems((current) => [...current.slice(-1), { id, message }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 4600);
  }, []);

  const value = useMemo<ToastValue>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex flex-col items-center gap-3 px-5"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="glass hairline flex max-w-[min(92vw,540px)] items-center gap-4 px-5 py-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-gold bg-gold/15 text-gold">
                <Check size={18} strokeWidth={2.2} />
              </span>
              <p className="text-[0.88rem] leading-snug text-parchment">{item.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
