import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CirclePlay, Play, Square, X } from 'lucide-react';
import { useT, type TranslationKey } from '../i18n';

interface TourStep {
  path: string;
  labelKey: TranslationKey;
  /** How long autoplay rests on this step (ms). */
  dwell: number;
}

/**
 * DEMO MODE — a guided, URL-driven tour of the product journey.
 * Steps only navigate; nothing inside pages is clicked programmatically.
 */
const STEPS: TourStep[] = [
  { path: '/kiosk', labelKey: 'demo.step.1', dwell: 2600 },
  { path: '/archive', labelKey: 'demo.step.2', dwell: 2600 },
  { path: '/document/ms-001', labelKey: 'demo.step.3', dwell: 2600 },
  { path: '/ask?doc=ms-001', labelKey: 'demo.step.4', dwell: 3400 },
  { path: '/ask?doc=ms-001', labelKey: 'demo.step.5', dwell: 2600 },
  { path: '/digitize', labelKey: 'demo.step.6', dwell: 2600 },
  { path: '/scan', labelKey: 'demo.step.7', dwell: 2600 },
  { path: '/digitize?auto=1', labelKey: 'demo.step.8', dwell: 5200 },
  { path: '/digitize?auto=1&lang=hi', labelKey: 'demo.step.9', dwell: 5200 },
  { path: '/digitize?auto=1&lang=hi', labelKey: 'demo.step.10', dwell: 5200 },
];

export default function DemoTour() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(-1);
  const timerRef = useRef<number | null>(null);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => clearTimer, []);

  function goTo(stepIndex: number, continuePlay: boolean) {
    clearTimer();
    const step = STEPS[stepIndex];
    if (!step) return;
    setIndex(stepIndex);
    navigate(step.path);
    if (!continuePlay) return;
    if (stepIndex + 1 >= STEPS.length) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => goTo(stepIndex + 1, true), step.dwell);
  }

  function start() {
    setPlaying(true);
    goTo(0, true);
  }

  function stop() {
    setPlaying(false);
    clearTimer();
  }

  function pick(stepIndex: number) {
    setPlaying(false);
    goTo(stepIndex, false);
  }

  const currentKey = `${location.pathname}${location.search}`;
  const activeIndex = playing
    ? index
    : STEPS.findIndex((step) => step.path === currentKey);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (open) {
            stop();
            setOpen(false);
          } else {
            setOpen(true);
          }
        }}
        aria-expanded={open}
        aria-label={t('demo.open')}
        className={`flex h-11 items-center gap-2 border px-3 text-[0.62rem] font-semibold tracking-[0.22em] uppercase transition-colors ${
          playing
            ? 'border-gold bg-gold text-ink'
            : 'border-gold/45 text-parchment hover:border-gold hover:text-gold'
        }`}
      >
        <CirclePlay size={15} strokeWidth={1.8} />
        {t('demo.pill')}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 bg-ink/70 backdrop-blur-sm"
              onClick={() => {
                stop();
                setOpen(false);
              }}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-label={t('demo.title')}
              className="hairline absolute right-0 top-[calc(100%+14px)] z-10 w-[320px] max-w-[calc(100vw-40px)] bg-ink/95 p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker">{t('demo.title')}</p>
                  <p className="mt-2 text-[0.84rem] leading-relaxed text-cool">
                    {t('demo.desc')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    stop();
                    setOpen(false);
                  }}
                  aria-label={t('common.close')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center border border-gold/30 text-cool transition-colors hover:border-gold hover:text-gold"
                >
                  <X size={15} strokeWidth={1.8} />
                </button>
              </div>

              <ol className="mt-4 max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">
                {STEPS.map((step, stepIndex) => {
                  const isActive = stepIndex === activeIndex;
                  return (
                    <li key={`${step.path}-${stepIndex}`}>
                      <button
                        type="button"
                        onClick={() => pick(stepIndex)}
                        className={`flex w-full items-center gap-3 border px-3 py-2.5 text-left text-[0.82rem] transition-colors ${
                          isActive
                            ? 'border-gold/70 bg-gold/10 text-parchment'
                            : 'border-transparent text-cool hover:border-gold/40 hover:text-parchment'
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center border text-[0.62rem] font-semibold ${
                            isActive ? 'border-gold text-gold' : 'border-gold/30 text-muted'
                          }`}
                          aria-hidden="true"
                        >
                          {stepIndex + 1}
                        </span>
                        {t(step.labelKey)}
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-4 border-t border-gold/20 pt-4">
                <button
                  type="button"
                  onClick={playing ? stop : start}
                  className={`flex min-h-[52px] w-full items-center justify-center gap-3 text-[0.7rem] font-semibold tracking-[0.24em] uppercase transition-colors ${
                    playing
                      ? 'border border-oxblood/70 bg-oxblood/20 text-parchment hover:bg-oxblood/30'
                      : 'bg-gold text-ink hover:bg-gold-2'
                  }`}
                >
                  {playing ? <Square size={14} strokeWidth={2.2} /> : <Play size={14} strokeWidth={2.2} />}
                  {playing ? t('demo.stop') : t('demo.play')}
                </button>
                <p className="mt-3 text-center text-[0.68rem] tracking-[0.12em] text-muted uppercase">
                  {t('demo.note')}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
