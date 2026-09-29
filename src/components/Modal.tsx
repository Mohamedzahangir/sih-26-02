import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  tone?: 'dark' | 'paper';
}

const SIZES = { md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' } as const;

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  tone = 'dark',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <motion.button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 h-full w-full cursor-zoom-out bg-ink/85 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full ${SIZES[size]} max-h-[90vh] overflow-hidden ${
              tone === 'paper' ? 'paper paper-edge' : 'bg-ink-2 hairline'
            }`}
          >
            <div
              className={`flex items-start justify-between gap-6 border-b px-6 py-5 sm:px-8 ${
                tone === 'paper' ? 'border-ink/15' : 'border-gold/25'
              }`}
            >
              <div>
                <p className={`kicker ${tone === 'paper' ? 'text-ink/60' : ''}`}>
                  {subtitle ?? 'Archive'}
                </p>
                <h3
                  className={`mt-2 font-display text-[clamp(1.5rem,2.6vw,2.1rem)] leading-tight ${
                    tone === 'paper' ? 'text-ink' : 'text-parchment'
                  }`}
                >
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`mt-1 flex h-14 w-14 shrink-0 items-center justify-center border transition-colors ${
                  tone === 'paper'
                    ? 'border-ink/20 text-ink hover:bg-ink/10'
                    : 'border-gold/30 text-cool hover:border-gold hover:text-gold'
                }`}
              >
                <X size={20} strokeWidth={1.6} />
              </button>
            </div>
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
