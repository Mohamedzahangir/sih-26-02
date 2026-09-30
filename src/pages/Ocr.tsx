import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Check,
  FileScan,
  FileText,
  Gauge,
  Languages,
  LoaderCircle,
  ScanLine,
  Tag,
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Footer from '../components/Footer';
import Button, { ButtonLink } from '../components/Button';
import TranslationPanel from '../components/TranslationPanel';
import { useT } from '../i18n';
import { usePreferences } from '../context/PreferencesContext';
import { useArchive } from '../context/ArchiveContext';
import { useToast } from '../context/ToastContext';
import { OCR_DOCUMENT_ID, buildOcrRecord, ocrDocument } from '../data/ocr';
import { asset } from '../lib/asset';

type Phase = 'idle' | 'processing' | 'done' | 'error';

const STEP_MS = 750;
const STEP_KEYS = [
  'ocr.step.1',
  'ocr.step.2',
  'ocr.step.3',
  'ocr.step.4',
  'ocr.step.5',
] as const;

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

  const [phase, setPhase] = useState<Phase>(
    params.get('state') === 'error' ? 'error' : 'idle',
  );
  const [step, setStep] = useState(-1);
  const [typed, setTyped] = useState('');
  const [added, setAdded] = useState(false);
  const timersRef = useRef<number[]>([]);

  const isAdded = added || sessionIds.includes(OCR_DOCUMENT_ID);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const runOcr = useCallback(() => {
    clearTimers();
    setStep(-1);
    setPhase('processing');
    for (let index = 0; index < STEP_KEYS.length; index += 1) {
      timersRef.current.push(window.setTimeout(() => setStep(index), index * STEP_MS));
    }
    timersRef.current.push(
      window.setTimeout(() => setPhase('done'), STEP_KEYS.length * STEP_MS),
    );
  }, [clearTimers]);

  /* typewriter reveal of the extracted text */
  useEffect(() => {
    if (phase !== 'done') return;
    const full = ocrDocument.text;
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
  }, [phase, reduceMotion]);

  const addToArchive = () => {
    if (isAdded) return;
    addRecord(buildOcrRecord());
    setAdded(true);
    show(t('ocr.toast'));
  };

  const reset = () => {
    clearTimers();
    setStep(-1);
    setTyped('');
    setPhase('idle');
  };

  const progress = phase === 'done' ? 100 : step >= 0 ? Math.round(((step + 1) / STEP_KEYS.length) * 100) : 0;

  const dashedPlate = (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 border border-dashed border-gold/35 bg-ink-2/50 px-8 py-12 text-center">
      <FileScan size={46} strokeWidth={1.1} className="text-gold/60" />
      <p className="max-w-xs text-[0.92rem] leading-relaxed text-cool">{t('ocr.idle')}</p>
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
          {/* ------------------------------ DOCUMENT PREVIEW ------------------------------ */}
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-4">
              <p className="kicker">{t('ocr.preview')}</p>
              <span className="text-[0.62rem] font-semibold tracking-[0.2em] text-muted uppercase">
                {ocrDocument.image.replace('images/', '')}
              </span>
            </div>

            {phase === 'done' ? (
              <figure className="paper paper-edge p-4">
                <img
                  src={asset(ocrDocument.image)}
                  alt={ocrDocument.title}
                  className="sepia aspect-[4/3] w-full object-cover"
                />
                <figcaption className="mt-3 text-[0.7rem] leading-relaxed text-ink/60">
                  {ocrDocument.credit}
                </figcaption>
              </figure>
            ) : phase === 'processing' ? (
              <div className="relative overflow-hidden border border-gold/25 bg-ink-2">
                <img
                  src={asset(ocrDocument.image)}
                  alt=""
                  aria-hidden="true"
                  className="sepia aspect-[4/3] w-full object-cover opacity-70"
                />
                <motion.span
                  aria-hidden="true"
                  initial={{ top: '-10%' }}
                  animate={{ top: ['-10%', '110%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-gold/35 to-transparent"
                />
              </div>
            ) : (
              dashedPlate
            )}
          </div>

          {/* --------------------------------- OCR OUTPUT --------------------------------- */}
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
              {/* --------------------------------- IDLE ---------------------------------- */}
              {phase === 'idle' && (
                <div className="space-y-6">
                  <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 border border-dashed border-gold/25 bg-ink-2/40 px-8 py-12 text-center">
                    <p className="text-[0.92rem] text-cool">{t('ocr.waiting')}</p>
                  </div>
                  <Button onClick={runOcr} className="w-full">
                    <ScanLine size={16} strokeWidth={1.8} />
                    {t('ocr.start')}
                  </Button>
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
                    <Button onClick={runOcr}>{t('ocr.retry')}</Button>
                    <Button variant="outline" onClick={reset}>
                      {t('ocr.useDemo')}
                    </Button>
                  </div>
                </div>
              )}

              {/* ------------------------------ PROCESSING ------------------------------- */}
              {phase === 'processing' && (
                <div className="space-y-6">
                  <p className="text-[0.92rem] text-cool">{t('ocr.processing')}</p>
                  <ol className="space-y-3">
                    {STEP_KEYS.map((key, index) => {
                      const doneStep = step > index;
                      const active = step === index;
                      return (
                        <li
                          key={key}
                          className={`flex items-center gap-3.5 border px-4 py-3 text-[0.88rem] ${
                            active
                              ? 'border-gold/70 bg-gold/10 text-parchment'
                              : doneStep
                                ? 'border-gold/20 bg-ink-2/60 text-parchment/85'
                                : 'border-gold/10 bg-ink-2/30 text-muted'
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center border ${
                              doneStep ? 'border-gold bg-gold text-ink' : 'border-gold/30'
                            }`}
                            aria-hidden="true"
                          >
                            {doneStep ? (
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
                    <div className="h-2 w-full overflow-hidden bg-ink border border-gold/20">
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
                </div>
              )}

              {/* --------------------------------- DONE ---------------------------------- */}
              {phase === 'done' && (
                <div className="space-y-8">
                  {/* extracted text */}
                  <article className="paper paper-edge p-6 sm:p-8">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink/20 pb-3">
                      <p className="text-[0.62rem] font-semibold tracking-[0.26em] text-ink/60 uppercase">
                        {t('ocr.result.extracted')}
                      </p>
                      <span className="border border-oxblood/60 px-2.5 py-1 text-[0.56rem] font-semibold tracking-[0.2em] text-oxblood uppercase">
                        {t('common.sample')}
                      </span>
                    </div>
                    <p className="font-display text-[1.05rem] leading-[1.8] whitespace-pre-line text-ink/85">
                      {typed}
                      {typed.length < ocrDocument.text.length && (
                        <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-ink/70" aria-hidden="true" />
                      )}
                    </p>
                  </article>

                  {/* metadata */}
                  <div>
                    <ResultRow icon={<Languages size={16} strokeWidth={1.7} />} label={t('ocr.result.language')}>
                      {ocrDocument.detectedLanguage}
                    </ResultRow>
                    <ResultRow icon={<Gauge size={16} strokeWidth={1.7} />} label={t('ocr.result.confidence')}>
                      {Math.round(ocrDocument.confidence)}%
                    </ResultRow>
                    <ResultRow icon={<FileText size={16} strokeWidth={1.7} />} label={t('ocr.result.type')}>
                      {ocrDocument.type}
                    </ResultRow>
                    <ResultRow icon={<Calendar size={16} strokeWidth={1.7} />} label={t('ocr.result.date')}>
                      {ocrDocument.year}
                    </ResultRow>
                    <ResultRow icon={<Tag size={16} strokeWidth={1.7} />} label={t('ocr.result.tags')}>
                      <span className="flex flex-wrap gap-2">
                        {ocrDocument.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-gold/25 px-2.5 py-1 text-[0.7rem] tracking-[0.1em] text-cool uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    </ResultRow>
                    <p className="mt-4 text-[0.72rem] leading-relaxed text-muted">
                      {t('ocr.result.sample')}
                    </p>
                  </div>

                  {/* translation */}
                  <div>
                    <p className="kicker mb-4">{t('ocr.result.translated')}</p>
                    <TranslationPanel
                      recordId={OCR_DOCUMENT_ID}
                      originalText={ocrDocument.text}
                      defaultChoice="original"
                    />
                  </div>

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

      <Footer />
    </div>
  );
}
