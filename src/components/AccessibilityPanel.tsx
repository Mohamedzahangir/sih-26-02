import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Accessibility, Check, Eye, Type, Zap } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

function ToggleRow({
  icon,
  label,
  hint,
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-gold/10"
    >
      <span className="text-gold">{icon}</span>
      <span className="flex-1">
        <span className="block text-[0.86rem] text-parchment">{label}</span>
        <span className="block text-[0.66rem] leading-snug text-muted">{hint}</span>
      </span>
      <span
        className={`flex h-6 w-11 shrink-0 items-center border transition-colors ${
          active ? 'border-gold bg-gold/25' : 'border-gold/30 bg-ink'
        }`}
      >
        <span
          className={`h-5 w-5 transition-transform duration-200 ${
            active ? 'translate-x-5 bg-gold' : 'translate-x-0.5 bg-muted'
          }`}
        />
      </span>
      {active && <Check size={15} className="text-gold" />}
    </button>
  );
}

export default function AccessibilityPanel() {
  const { largeText, toggleLargeText, highContrast, toggleHighContrast, reduceMotion, toggleReduceMotion } =
    usePreferences();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={wrapper}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Accessibility options"
        className={`flex h-14 w-14 items-center justify-center border transition-colors ${
          open ? 'border-gold text-gold' : 'border-gold/35 text-parchment hover:border-gold hover:text-gold'
        }`}
      >
        <Accessibility size={19} strokeWidth={1.7} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 z-50 mt-2 w-[19rem] border border-gold/30 bg-ink-2/95 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-md"
          >
            <p className="kicker border-b border-gold/20 px-4 py-3.5">Accessibility</p>
            <ToggleRow
              icon={<Type size={18} strokeWidth={1.7} />}
              label="Larger text"
              hint="Increases interface scale for distance viewing"
              active={largeText}
              onToggle={toggleLargeText}
            />
            <ToggleRow
              icon={<Eye size={18} strokeWidth={1.7} />}
              label="High contrast"
              hint="Stronger text and border contrast"
              active={highContrast}
              onToggle={toggleHighContrast}
            />
            <ToggleRow
              icon={<Zap size={18} strokeWidth={1.7} />}
              label="Reduce motion"
              hint="Turns off transitions and animations"
              active={reduceMotion}
              onToggle={toggleReduceMotion}
            />
            <p className="border-t border-gold/20 px-4 py-3 text-[0.64rem] leading-relaxed text-muted">
              Preferences are stored on this kiosk terminal only.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
