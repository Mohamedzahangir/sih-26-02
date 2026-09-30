import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, MessageSquareQuote, Mic, Search, Send, X } from 'lucide-react';
import ArchiveCard from '../components/ArchiveCard';
import SectionHeader from '../components/SectionHeader';
import Footer from '../components/Footer';
import Button, { ButtonLink } from '../components/Button';
import { CATEGORY_LABEL_KEYS, useT, type TranslationKey } from '../i18n';
import { usePreferences } from '../context/PreferencesContext';
import { useArchive } from '../context/ArchiveContext';
import { getRecord } from '../data';
import { answerDocument, answerQuery, type AskAnswer } from '../data/ask';
import { asset } from '../lib/asset';

type Phase = 'idle' | 'loading' | 'done';

const LOADING_KEYS: TranslationKey[] = ['ask.loading.1', 'ask.loading.2', 'ask.loading.3'];
const SUGGESTION_KEYS: TranslationKey[] = ['ask.q1', 'ask.q2', 'ask.q3', 'ask.q4', 'ask.q5'];
const CONTEXT_ROWS: { key: TranslationKey; field: keyof AskAnswer['stats'] }[] = [
  { key: 'ask.context.found', field: 'found' },
  { key: 'ask.context.relevant', field: 'relevant' },
  { key: 'ask.context.topics', field: 'topics' },
  { key: 'ask.context.languages', field: 'languages' },
];

export default function Ask() {
  const t = useT();
  const { records } = useArchive();
  const { reduceMotion } = usePreferences();
  const [params, setParams] = useSearchParams();

  const docId = params.get('doc');
  const queryParam = params.get('q');
  const docRecord = getRecord(docId ?? undefined, records);

  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<AskAnswer | null>(null);

  const timers = useRef<number[]>([]);

  function clearTimers() {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }

  function run(query: string, doc?: NonNullable<typeof docRecord>) {
    const clean = query.trim();
    if (!clean) return;
    clearTimers();
    setInput(clean);

    const compute = () => {
      setResult(doc ? answerDocument(doc, records) : answerQuery(clean, records));
      setPhase('done');
    };

    if (reduceMotion) {
      setStage(LOADING_KEYS.length - 1);
      compute();
      return;
    }

    setStage(0);
    setPhase('loading');
    timers.current.push(window.setTimeout(() => setStage(1), 400));
    timers.current.push(window.setTimeout(() => setStage(2), 800));
    timers.current.push(window.setTimeout(compute, 1200));
  }

  /* Run automatically whenever the URL carries a document or a question. */
  useEffect(() => {
    if (docRecord) run(t('ask.doc.question'), docRecord);
    else if (queryParam?.trim()) run(queryParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, queryParam]);

  useEffect(() => clearTimers, []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const clean = input.trim();
    if (!clean) return;
    setParams({ q: clean });
    run(clean);
  }

  function handleSuggestion(key: TranslationKey) {
    const clean = t(key);
    setParams({ q: clean });
    run(clean);
  }

  function handleAskDocument() {
    if (!docRecord) return;
    setParams({ doc: docRecord.id });
    run(t('ask.doc.question'), docRecord);
  }

  function reset() {
    clearTimers();
    setParams({});
    setInput('');
    setResult(null);
    setStage(0);
    setPhase('idle');
  }

  return (
    <div className="vignette min-h-screen">
      <div className="mx-auto max-w-[1500px] px-5 pt-10 sm:px-8">
        <SectionHeader
          as="h1"
          eyebrow={t('ask.kicker')}
          title={t('ask.title')}
          description={t('ask.desc')}
        />
      </div>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 px-5 pt-10 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* -------------------------------- ANSWER COLUMN ------------------------------ */}
        <div className="min-w-0">
          {docRecord && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="hairline bg-ink-2/60 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-5">
                <img
                  src={asset(docRecord.image)}
                  alt=""
                  className="sepia h-20 w-20 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="kicker">{t('ask.doc.label')}</p>
                  <h2 className="mt-2 font-display text-[1.3rem] leading-snug text-parchment">
                    {docRecord.title}
                  </h2>
                  <p className="mt-1.5 text-[0.78rem] tracking-[0.14em] text-muted uppercase">
                    {docRecord.year} · {t(CATEGORY_LABEL_KEYS[docRecord.type])}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" onClick={handleAskDocument}>
                    <MessageSquareQuote size={16} strokeWidth={1.8} />
                    {t('ask.doc.question')}
                  </Button>
                  <ButtonLink to={`/document/${docRecord.id}`} variant="ghost">
                    {t('ask.doc.open')}
                    <FileText size={15} strokeWidth={1.8} />
                  </ButtonLink>
                </div>
              </div>
            </motion.section>
          )}

          {/* -------------------------------- COMPOSER --------------------------------- */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-wrap items-center gap-3 border border-gold/30 bg-ink-2/70 p-3 focus-within:border-gold"
          >
            <label htmlFor="ask-question" className="sr-only">
              {t('ask.placeholder')}
            </label>
            <input
              id="ask-question"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('ask.placeholder')}
              autoComplete="off"
              className="min-h-[56px] min-w-0 flex-1 bg-transparent px-4 text-[1rem] text-parchment placeholder:text-muted focus:outline-none"
            />
            <span className="hidden text-muted sm:block" aria-hidden="true">
              <Mic size={18} strokeWidth={1.7} />
            </span>
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                aria-label={t('ask.clear')}
                className="flex h-11 w-11 items-center justify-center border border-gold/25 text-cool transition-colors hover:border-gold hover:text-gold"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            )}
            <Button type="submit" disabled={!input.trim()}>
              <Send size={16} strokeWidth={1.8} />
              {t('ask.submit')}
            </Button>
          </form>
          <p className="mt-3 flex items-center gap-2 text-[0.74rem] text-muted">
            <Mic size={13} strokeWidth={1.8} aria-hidden="true" />
            {t('ask.mic.note')}
          </p>

          {/* ------------------------------ SUGGESTIONS -------------------------------- */}
          {phase === 'idle' && (
            <section className="mt-10">
              <h2 className="kicker">{t('ask.suggestions.title')}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {SUGGESTION_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSuggestion(key)}
                    className="min-h-[56px] border border-gold/25 bg-ink-2/50 px-5 py-3.5 text-left text-[0.9rem] leading-snug text-parchment/90 transition-colors hover:border-gold hover:text-gold"
                  >
                    <Search
                      size={14}
                      strokeWidth={1.8}
                      className="mr-2.5 inline-block text-gold/70"
                      aria-hidden="true"
                    />
                    {t(key)}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* -------------------------------- LOADING ---------------------------------- */}
          {phase === 'loading' && (
            <div
              role="status"
              aria-live="polite"
              className="hairline mt-8 bg-ink-2/60 p-6 sm:p-8"
            >
              <p className="kicker">{t('ask.answer.label')}</p>
              <ul className="mt-5 space-y-3">
                {LOADING_KEYS.map((key, index) => (
                  <li
                    key={key}
                    className={`flex items-center gap-3 text-[0.95rem] ${
                      index <= stage ? 'text-parchment' : 'text-muted/60'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rotate-45 ${
                        index < stage ? 'bg-gold/60' : index === stage ? 'bg-gold' : 'bg-muted/40'
                      }`}
                      aria-hidden="true"
                    />
                    {index < stage && (
                      <Search size={13} strokeWidth={2} className="text-gold/70" aria-hidden="true" />
                    )}
                    {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* -------------------------------- RESULT ----------------------------------- */}
          {phase === 'done' && result?.unknown && (
            <div className="hairline mt-8 bg-ink-2/60 p-6 sm:p-8">
              <p className="kicker">{t('ask.answer.label')}</p>
              <h2 className="mt-4 font-display text-[1.7rem] text-parchment">
                {t('ask.unknown.title')}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-cool">{t('ask.unknown')}</p>
              <div className="mt-7">
                <Button variant="outline" onClick={reset}>
                  {t('ask.again')}
                </Button>
              </div>
            </div>
          )}

          {phase === 'done' && result && !result.unknown && (
            <motion.article
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8"
            >
              <div className="hairline bg-ink-2/60 p-6 sm:p-8">
                <h2 className="kicker">{t('ask.answer.label')}</h2>
                <p className="mt-4 text-[1.02rem] leading-[1.75] text-parchment/95">
                  {result.answer}
                </p>
                <p className="mt-5 text-[0.8rem] tracking-[0.1em] text-gold/80 uppercase">
                  {t('ask.basis')}
                </p>
                <p className="mt-3 border-t border-gold/15 pt-4 text-[0.74rem] leading-relaxed text-muted">
                  {t('ask.note')}
                </p>
              </div>

              {result.sources.length > 0 && (
                <section className="mt-10">
                  <h2 className="kicker">{t('ask.sources.label')}</h2>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    {result.sources.map((record, index) => (
                      <ArchiveCard key={record.id} record={record} index={index} />
                    ))}
                  </div>
                </section>
              )}

              <div className="mt-8">
                <Button variant="outline" onClick={reset}>
                  {t('ask.again')}
                </Button>
              </div>
            </motion.article>
          )}
        </div>

        {/* -------------------------------- CONTEXT PANEL ------------------------------ */}
        <aside className="min-w-0 lg:sticky lg:top-[100px] lg:self-start">
          <div className="hairline bg-ink-2/60 p-6">
            <h2 className="kicker">{t('ask.context.title')}</h2>
            {phase === 'done' && result ? (
              <dl className="mt-4">
                {CONTEXT_ROWS.map(({ key, field }) => (
                  <div
                    key={key}
                    className="flex items-baseline justify-between gap-4 border-b border-gold/15 py-3.5 last:border-0"
                  >
                    <dt className="text-[0.68rem] tracking-[0.18em] text-muted uppercase">
                      {t(key)}
                    </dt>
                    <dd className="font-display text-[1.4rem] leading-none text-gold">
                      {result.stats[field]}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-[0.9rem] leading-relaxed text-cool">
                {t('ask.context.idle')}
              </p>
            )}
            <p className="mt-5 border-t border-gold/15 pt-4 text-[0.72rem] leading-relaxed text-muted">
              {t('ask.note')}
            </p>
          </div>

          <div className="mt-5 border border-gold/20 bg-ink/40 p-5">
            <p className="flex items-center gap-2.5 text-[0.72rem] tracking-[0.2em] text-gold/80 uppercase">
              <Search size={13} strokeWidth={1.8} aria-hidden="true" />
              {t('common.archive')}
            </p>
            <p className="mt-3 text-[0.86rem] leading-relaxed text-cool">{t('ask.desc')}</p>
            <Link
              to="/archive"
              className="mt-4 inline-flex min-h-[56px] items-center gap-2 text-[0.7rem] font-semibold tracking-[0.22em] text-parchment uppercase transition-colors hover:text-gold"
            >
              {t('nav.archive')}
            </Link>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
