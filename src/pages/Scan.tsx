import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, QrCode } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Footer from '../components/Footer';
import { ButtonLink } from '../components/Button';
import ScanQr from '../components/ScanQr';
import { useT } from '../i18n';
import { useToast } from '../context/ToastContext';
import { useTransfer } from '../context/TransferContext';

type ScanState = 'idle' | 'demo';

/** Demo sequence: stage label timings, then navigation to the digitizer. */
const DEMO_STAGES = [0, 900, 1800, 2600];
const DEMO_NAVIGATE_AT = 3400;

const DEMO_STATUS_KEYS = [
  'scan.state.scanning',
  'scan.state.detecting',
  'scan.state.detected',
  'scan.state.opening',
] as const;

export default function Scan() {
  const t = useT();
  const navigate = useNavigate();
  const { show } = useToast();
  const { qrUrl } = useTransfer();

  const [state, setState] = useState<ScanState>('idle');
  const [stage, setStage] = useState(-1);

  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const runDemo = useCallback(() => {
    if (state === 'demo') return;
    clearTimers();
    setState('demo');
    setStage(-1);

    DEMO_STAGES.forEach((at, index) => {
      timersRef.current.push(window.setTimeout(() => setStage(index), at));
    });
    timersRef.current.push(
      window.setTimeout(() => {
        show(t('scan.toast'));
        navigate('/digitize?auto=1');
      }, DEMO_NAVIGATE_AT),
    );
  }, [clearTimers, navigate, show, state, t]);

  const statusText = state === 'idle' ? t('scan.state.idle') : t(DEMO_STATUS_KEYS[Math.max(stage, 0)]);

  return (
    <div className="vignette min-h-screen">
      <section className="border-b border-gold/20 bg-ink/50">
        <div className="mx-auto max-w-3xl px-5 pt-14 pb-12 text-center sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              as="h1"
              eyebrow={t('scan.kicker')}
              title={t('scan.title')}
              description={t('scan.desc')}
              align="center"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        {/* ------------------------------ SCANNER FRAME ------------------------------ */}
        <div className="relative mx-auto aspect-square w-full max-w-[460px] border border-gold/25 bg-ink-2 grain">
          <div className="absolute inset-4 flex flex-col items-center justify-center gap-4 overflow-hidden border border-gold/15 bg-parchment text-center">
            <ScanQr value={qrUrl} size={264} label={t('scan.frame.aria')} className="block" />
            <p className="px-6 text-[0.72rem] tracking-[0.2em] text-ink/70 uppercase">
              {t('scan.frame.aria')}
            </p>
          </div>

          {/* corner brackets */}
          {(
            [
              'top-2 left-2 border-t-2 border-l-2',
              'top-2 right-2 border-t-2 border-r-2',
              'bottom-2 left-2 border-b-2 border-l-2',
              'bottom-2 right-2 border-b-2 border-r-2',
            ] as const
          ).map((position) => (
            <span
              key={position}
              aria-hidden="true"
              className={`pointer-events-none absolute h-12 w-12 border-gold ${position}`}
            />
          ))}

          {state === 'demo' && stage >= 2 && (
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.2, 1] }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 border-2 border-gold bg-gold/10"
            />
          )}
        </div>

        {/* -------------------------------- STATUS --------------------------------- */}
        <div
          className="mt-6 flex min-h-[56px] items-center justify-center border border-gold/25 bg-ink-2/70 px-5 py-3.5 text-center"
          role="status"
          aria-live="polite"
          aria-label={t('scan.status')}
        >
          <p className="text-[0.78rem] font-semibold tracking-[0.18em] text-gold uppercase">
            {statusText}
          </p>
        </div>

        {state === 'demo' && (
          <ol className="mx-auto mt-6 max-w-md space-y-2.5">
            {DEMO_STATUS_KEYS.map((key, index) => {
              const done = stage >= index;
              return (
                <li
                  key={key}
                  className={`flex items-center gap-3 text-[0.82rem] ${
                    done ? 'text-parchment' : 'text-muted'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center border ${
                      done ? 'border-gold bg-gold text-ink' : 'border-gold/30 text-muted'
                    }`}
                    aria-hidden="true"
                  >
                    {done ? <Check size={13} strokeWidth={2.6} /> : index + 1}
                  </span>
                  {t(key)}
                </li>
              );
            })}
          </ol>
        )}

        {/* -------------------------------- ACTIONS -------------------------------- */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {state === 'idle' && (
            <button
              type="button"
              onClick={runDemo}
              className="inline-flex min-h-[56px] items-center justify-center gap-3 bg-gold px-8 text-[0.74rem] font-semibold tracking-[0.24em] text-ink uppercase shadow-[0_18px_40px_-24px_rgba(201,162,75,0.9)] transition-colors duration-200 hover:bg-gold-2 sm:col-span-2"
            >
              <QrCode size={16} strokeWidth={1.8} />
              {t('scan.demo')}
            </button>
          )}
        </div>

        <p className="mt-5 text-center text-[0.78rem] leading-relaxed text-muted">
          {t('scan.demoHint')}
        </p>

        <div className="mt-8 text-center">
          <ButtonLink to="/kiosk" variant="ghost">
            {t('scan.back')}
          </ButtonLink>
        </div>
      </section>

      <Footer />
    </div>
  );
}
