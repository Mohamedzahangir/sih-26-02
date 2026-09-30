import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  FileText,
  Gauge,
  Image as ImageIcon,
  Languages,
  LoaderCircle,
  ScanLine,
  Smartphone,
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Footer from '../components/Footer';
import Button, { ButtonLink } from '../components/Button';
import ScanQr from '../components/ScanQr';
import TranslationPanel, { type TranslationChoice } from '../components/TranslationPanel';
import { useT } from '../i18n';
import { usePreferences } from '../context/PreferencesContext';
import { useArchive } from '../context/ArchiveContext';
import { useToast } from '../context/ToastContext';
import { useTransfer } from '../context/TransferContext';
import { OCR_DOCUMENT_ID, buildOcrRecord, matchesSampleText } from '../data/ocr';
import { asset } from '../lib/asset';
import { overallProgress, streamOcr } from '../lib/ocr';

type Phase = 'wait' | 'processing' | 'done' | 'error';

interface RunRequest {
  name: string;
  blob: Blob;
  url: string;
}

interface RunResult extends RunRequest {
  text: string;
  confidence: number;
  matched: boolean;
}

const STEP_KEYS = [
  'ocr.step.1',
  'ocr.step.2',
  'ocr.step.3',
  'ocr.step.4',
  'ocr.step.5',
] as const;

/** Monotonic pipeline value at which each checklist row completes. */
const STEP_THRESHOLD = [0.15, 0.3, 0.5, 0.75, 1];

function ResultRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-b border-gold/15 py-3.5">
      <span className="mt-0.5 text-gold/80" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[0.6rem] font-semibold tracking-[0.26em] text-muted uppercase">
          {label}
        </p>
        <div className="mt-1.5 text-[0.92rem] break-words text-parchment">{children}</div>
      </div>
    </div>
  );
}

export default function Ocr() {
  const t = useT();
  const [params] = useSearchParams();
  const { reduceMotion } = usePreferences();
  const { addRecord, sessionIds } = useArchive();
  const { show } = useToast();
  const { status: transferStatus, qrUrl, takePending, subscribePhoto } = useTransfer();

  const autoRun = params.get('auto') === '1';
  const langParam = params.get('lang');
  const translationChoice: TranslationChoice =
    langParam === 'hi' || langParam === 'ta' || langParam === 'mr' ? langParam : 'original';

  const [phase, setPhase] = useState<Phase>(
    params.get('state') === 'error' ? 'error' : 'wait',
  );
  const [run, setRun] = useState<RunRequest | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [overall, setOverall] = useState(0);
  const [typed, setTyped] = useState('');
  const [added, setAdded] = useState(false);
  const autoStartedRef = useRef(false);

  const startRun = useCallback((request: RunRequest) => {
    setResult(null);
    setTyped('');
    setAdded(false);
    setOverall(0);
    setRun(request);
  }, []);

  /* ------------------------------ the OCR job ------------------------------ */
  useEffect(() => {
    if (!run) return;
    const controller = new AbortController();
    setPhase('processing');
    setOverall(0);
    void (async () => {
      try {
        await streamOcr(
          run.blob,
          (event) => {
            if (controller.signal.aborted) return;
            if (event.type === 'progress') {
              setOverall((current) =>
                Math.max(current, overallProgress(event.status, event.progress)),
              );
            } else if (event.type === 'done') {
              setOverall(1);
              setResult({
                ...run,
                text: event.text,
                confidence: event.confidence,
                matched: matchesSampleText(event.text),
              });
              setPhase('done');
            } else {
              setPhase('error');
            }
          },
          controller.signal,
        );
      } catch {
        if (!controller.signal.aborted) setPhase('error');
      }
    })();
    return () => controller.abort();
  }, [run]);

  /* ---------------------- incoming photos (phone side) --------------------- */
  const phaseRef = useRef<Phase>(phase);
  phaseRef.current = phase;
  useEffect(() => {
    if (phase === 'processing') return;
    return subscribePhoto((photo) => {
      if (phaseRef.current === 'processing') return false;
      startRun(photo);
      return true;
    });
  }, [phase, subscribePhoto, startRun]);

  /* photo that arrived before the digitizer was open */
  useEffect(() => {
    if (phase !== 'wait') return;
    const pending = takePending();
    if (pending) startRun(pending);
  }, [phase, takePending, startRun]);

  /* ------------------------------- demo mode ------------------------------- */
  const simulateRef = useRef<() => void>(() => undefined);
  simulateRef.current = () => {
    void (async () => {
      try {
        const response = await fetch(asset('images/ocr-sample.png'));
        const blob = await response.blob();
        startRun({ name: 'ocr-sample.png', blob, url: URL.createObjectURL(blob) });
      } catch {
        setPhase('error');
      }
    })();
  };
  const simulate = useCallback(() => simulateRef.current(), []);

  /* demo mode: ?auto=1 runs the pipeline as soon as the digitizer opens */
  useEffect(() => {
    if (!autoRun) return;
    if (params.get('state') === 'error') return;
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    simulate();
    return () => {
      /* StrictMode remounts: allow the pipeline to start again cleanly */
      autoStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  /* typewriter reveal of the extracted text */
  useEffect(() => {
    if (phase !== 'done' || !result) return;
    const full = result.text;
    if (reduceMotion) {
      setTyped(full);
      return;
    }
    setTyped('');
    const chunk = Math.max(6, Math.ceil(full.length / 130));
    let cursor = 0;
    const timer = window.setInterval(() => {
      cursor = Math.min(full.length, cursor + chunk);
      setTyped(full.slice(0, cursor));
      if (cursor >= full.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [phase, result, reduceMotion]);

  const record = result
    ? buildOcrRecord({
        text: result.text,
        confidence: result.confidence,
        fileName: result.name,
        matched: result.matched,
        image: result.url,
      })
    : null;
  const isAdded =
    added || (result?.matched === true && sessionIds.includes(OCR_DOCUMENT_ID));

  const addToArchive = () => {
    if (isAdded || !record) return;
    addRecord(record);
    setAdded(true);
    show(t('ocr.toast'));
  };

  const reset = () => {
    setRun(null);
    setResult(null);
    setTyped('');
    setAdded(false);
    setOverall(0);
    setPhase('wait');
  };

  const progress = Math.round(overall * 100);
  const stepDone = STEP_THRESHOLD.map((threshold) => overall >= threshold);
  const activeStep = stepDone.findIndex((done) => !done);

  const transferText =
    transferStatus === 'online'
      ? t('ocr.waiting')
      : transferStatus === 'starting'
        ? t('ocr.connecting')
        : t('ocr.connect.offline');

  const words = result ? result.text.split(/\s+/).filter(Boolean).length : 0;
  const chars = result ? result.text.length : 0;

  /* ------------------------------ transfer QR ------------------------------ */
  const qrPanel = (
    <div className="border border-gold/25 bg-ink-2/60 px-6 py-8 text-center">
      <div className="flex items-center justify-center gap-3">
        <Smartphone size={17} strokeWidth={1.7} className="text-gold" />
        <p className="kicker">{t('ocr.transfer')}</p>
      </div>
      <div className="mt-6 inline-block border border-gold/40 bg-parchment p-3">
        <ScanQr value={qrUrl} size={216} label={t('ocr.qr.caption')} className="block" />
      </div>
      <p className="mt-5 font-display text-[1.15rem] text-parchment">{t('ocr.qr.caption')}</p>
      <p className="mx-auto mt-3 max-w-sm text-[0.84rem] leading-relaxed text-cool">
        {t('ocr.qr.hint')}
      </p>
      <div
        className="mt-6 flex min-h-[52px] items-center justify-center border border-gold/25 bg-ink px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <span
          className={`text-[0.74rem] font-semibold tracking-[0.2em] uppercase ${
            transferStatus === 'online'
              ? 'text-gold'
              : transferStatus === 'offline'
                ? 'text-oxblood'
                : 'text-cool'
          }`}
        >
          {transferText}
        </span>
      </div>
    </div>
  );

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
              eyebrow={t('ocr.kicker')}
              title={t('ocr.title')}
              description={t('ocr.desc')}
              align="center"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_minmax(0,1.1fr)]">
          {/* ------------------------------ LEFT: PHOTO ------------------------------ */}
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-4">
              <p className="kicker">{t('ocr.transfer')}</p>
              {phase === 'done' && result && (
                <span className="max-w-[60%] truncate text-[0.62rem] font-semibold tracking-[0.2em] text-muted uppercase">
                  {result.name}
                </span>
              )}
            </div>

            {phase === 'done' && result ? (
              <figure className="paper paper-edge p-4">
                <img
                  src={result.url}
                  alt={result.name}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="mt-3 text-[0.7rem] leading-relaxed text-ink/60">
                  {result.name}
                </figcaption>
              </figure>
            ) : (
              qrPanel
            )}
          </div>

          {/* ----------------------------- RIGHT: OUTPUT ----------------------------- */}
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-4">
              <p className="kicker">
                {phase === 'done' ? t('ocr.done') : t('ocr.output')}
              </p>
              {phase === 'done' && (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="flex h-9 w-9 items-center justify-center border border-gold bg-gold/15 text-gold"
                >
                  <Check size={18} strokeWidth={2.4} />
                </motion.span>
              )}
            </div>

            <div role="status" aria-live="polite">
              {/* --------------------------------- WAIT ---------------------------------- */}
              {phase === 'wait' && (
                <div className="space-y-6">
                  <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 border border-dashed border-gold/25 bg-ink-2/40 px-8 py-12 text-center">
                    <ScanLine size={42} strokeWidth={1.1} className="text-gold/60" />
                    <p className="max-w-sm text-[0.92rem] leading-relaxed text-cool">
                      {t('ocr.idle')}
                    </p>
                  </div>
                  <Button onClick={simulate} className="w-full">
                    <ScanLine size={16} strokeWidth={1.8} />
                    {t('ocr.simulate')}
                  </Button>
                  <p className="text-[0.72rem] leading-relaxed text-muted">{t('ocr.engine')}</p>
                </div>
              )}

              {/* -------------------------------- ERROR ---------------------------------- */}
              {phase === 'error' && (
                <div className="border border-oxblood/60 bg-oxblood/10 px-6 py-8 sm:px-8">
                  <p className="text-[0.66rem] font-semibold tracking-[0.24em] text-oxblood uppercase">
                    {t('ocr.error.title')}
                  </p>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-cool">
                    {t('ocr.error.desc')}
                  </p>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <Button onClick={() => setPhase('wait')}>{t('ocr.retry')}</Button>
                    <Button variant="outline" onClick={simulate}>
                      {t('ocr.useDemo')}
                    </Button>
                  </div>
                </div>
              )}

              {/* --------------------------------- DONE ---------------------------------- */}
              {phase === 'done' && result && (
                <div className="space-y-8">
                  {/* extracted text */}
                  <article className="paper paper-edge p-6 sm:p-8">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink/20 pb-3">
                      <p className="text-[0.62rem] font-semibold tracking-[0.26em] text-ink/60 uppercase">
                        {t('ocr.result.extracted')}
                      </p>
                    </div>
                    <p className="font-display text-[1.05rem] leading-[1.8] whitespace-pre-line text-ink/85">
                      {typed}
                      {typed.length < result.text.length && (
                        <span
                          className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-ink/70"
                          aria-hidden="true"
                        />
                      )}
                    </p>
                  </article>

                  {/* metadata */}
                  <div>
                    <ResultRow icon={<Languages size={16} strokeWidth={1.7} />} label={t('ocr.result.language')}>
                      English
                    </ResultRow>
                    <ResultRow icon={<Gauge size={16} strokeWidth={1.7} />} label={t('ocr.result.confidence')}>
                      {Math.round(result.confidence)}%
                    </ResultRow>
                    <ResultRow icon={<ImageIcon size={16} strokeWidth={1.7} />} label={t('ocr.result.file')}>
                      {result.name}
                    </ResultRow>
                    <ResultRow icon={<FileText size={16} strokeWidth={1.7} />} label={t('ocr.result.words')}>
                      {words} · {chars}
                    </ResultRow>
                    <p className="mt-4 text-[0.72rem] leading-relaxed text-muted">
                      {t('ocr.result.sample')}
                    </p>
                  </div>

                  {/* translation — only when the extraction matches the bundled sample */}
                  {result.matched && (
                    <div>
                      <p className="kicker mb-4">{t('ocr.result.translated')}</p>
                      <TranslationPanel
                        key={translationChoice}
                        recordId={OCR_DOCUMENT_ID}
                        originalText={result.text}
                        defaultChoice={translationChoice}
                      />
                    </div>
                  )}

                  {/* actions */}
                  <div className="space-y-4 border-t border-gold/20 pt-7">
                    <Button
                      onClick={addToArchive}
                      disabled={isAdded}
                      className={isAdded ? 'w-full opacity-70' : 'w-full'}
                    >
                      {isAdded ? <Check size={16} strokeWidth={2.4} /> : null}
                      {isAdded ? t('ocr.added') : t('ocr.add')}
                    </Button>

                    {isAdded && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <ButtonLink to="/archive" variant="outline">
                          {t('ocr.viewInArchive')}
                          <ArrowRight size={15} strokeWidth={2} />
                        </ButtonLink>
                        <Button variant="ghost" onClick={reset}>
                          {t('ocr.again')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------- FULL-SCREEN PROCESSING ------------------------- */}
      {phase === 'processing' && run && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          role="status"
          aria-live="polite"
          className="grain fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-ink px-5 py-10"
        >
          <div className="w-full max-w-3xl">
            <p className="kicker text-center">{t('ocr.kicker')}</p>
            <h2 className="mt-3 text-center font-display text-[clamp(1.6rem,3vw,2.4rem)] text-parchment">
              {t('ocr.processing')}
            </h2>

            <div className="mt-8 grid items-start gap-6 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="relative overflow-hidden border border-gold/25 bg-ink-2">
                <img
                  src={run.url}
                  alt={run.name}
                  className="aspect-[4/3] w-full object-cover opacity-75"
                />
                <motion.span
                  aria-hidden="true"
                  initial={{ top: '-10%' }}
                  animate={{ top: ['-10%', '110%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-gold/35 to-transparent"
                />
              </div>

              <div className="space-y-5">
                <ol className="space-y-3">
                  {STEP_KEYS.map((key, index) => {
                    const done = stepDone[index];
                    const active = activeStep === index;
                    return (
                      <li
                        key={key}
                        className={`flex items-center gap-3.5 border px-4 py-3 text-[0.88rem] ${
                          active
                            ? 'border-gold/70 bg-gold/10 text-parchment'
                            : done
                              ? 'border-gold/20 bg-ink-2/60 text-parchment/85'
                              : 'border-gold/10 bg-ink-2/30 text-muted'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center border ${
                            done ? 'border-gold bg-gold text-ink' : 'border-gold/30'
                          }`}
                          aria-hidden="true"
                        >
                          {done ? (
                            <Check size={14} strokeWidth={2.6} />
                          ) : active ? (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <LoaderCircle size={14} strokeWidth={2} />
                            </motion.span>
                          ) : (
                            <span className="text-[0.66rem] font-semibold">{index + 1}</span>
                          )}
                        </span>
                        {t(key)}
                      </li>
                    );
                  })}
                </ol>

                <div>
                  <div className="h-2 w-full overflow-hidden border border-gold/20 bg-ink">
                    <motion.div
                      className="h-full bg-gold"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="mt-2 text-right text-[0.7rem] tracking-[0.2em] text-muted uppercase">
                    {progress}%
                  </p>
                </div>

                <p className="text-[0.72rem] leading-relaxed text-muted">{t('ocr.engine')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
