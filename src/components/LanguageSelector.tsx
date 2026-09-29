import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { LANGUAGES, usePreferences } from '../context/PreferencesContext';

export default function LanguageSelector() {
  const { language, setLanguage } = usePreferences();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((item) => item.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapper}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className="flex h-14 items-center gap-2.5 border border-gold/35 px-4 text-[0.7rem] font-semibold tracking-[0.2em] text-parchment uppercase transition-colors hover:border-gold hover:text-gold"
      >
        <Globe size={17} strokeWidth={1.7} />
        {current.code}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 z-50 mt-2 w-60 border border-gold/30 bg-ink-2/95 p-1.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-md"
          >
            {LANGUAGES.map((item) => {
              const active = item.code === language;
              return (
                <li key={item.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setLanguage(item.code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors ${
                      active ? 'bg-gold/12 text-gold' : 'text-parchment hover:bg-gold/10'
                    }`}
                  >
                    <span>
                      <span className="block text-[0.92rem]">{item.native}</span>
                      <span className="block text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                        {item.label}
                      </span>
                    </span>
                    {active && <Check size={17} strokeWidth={2} />}
                  </button>
                </li>
              );
            })}
            <li className="mt-1 border-t border-gold/20 px-4 pt-3 pb-2 text-[0.64rem] leading-relaxed text-muted">
              Interface translation is scheduled for Phase 2. English content is shown in
              this phase.
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
