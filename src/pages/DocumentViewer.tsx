import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
  Languages,
  Maximize2,
  MessageSquareQuote,
  Tags,
  Warehouse,
} from 'lucide-react';
import Modal from '../components/Modal';
import DocumentCard from '../components/DocumentCard';
import SectionHeader from '../components/SectionHeader';
import Footer from '../components/Footer';
import Button, { ButtonLink } from '../components/Button';
import DigitalAccess from '../components/DigitalAccess';
import TranslationPanel, { type TranslationChoice } from '../components/TranslationPanel';
import { CATEGORY_LABEL_KEYS, useT } from '../i18n';
import { usePreferences } from '../context/PreferencesContext';
import { useArchive } from '../context/ArchiveContext';
import { getRecord, relatedRecords } from '../data';
import { asset } from '../lib/asset';

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-b border-gold/15 py-4">
      <span className="mt-0.5 text-gold/80" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[0.6rem] font-semibold tracking-[0.26em] text-muted uppercase">
          {label}
        </p>
        <div className="mt-1.5 text-[0.95rem] break-words leading-relaxed text-parchment">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DocumentViewer() {
  const t = useT();
  const { language } = usePreferences();
  const { records } = useArchive();
  const { id } = useParams();
  const record = getRecord(id, records);
  const [fullscreen, setFullscreen] = useState(false);
  const [readText, setReadText] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  if (!record) {
    const identifier = id ?? '';
    const description = t('doc.notfound.desc', { id: identifier });
    const [before = '', after = ''] = identifier ? description.split(identifier) : [description, ''];

    return (
      <div className="vignette mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <p className="kicker">{t('doc.notfound.kicker')}</p>
        <h1 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] text-parchment">
          {t('doc.notfound.title')}
        </h1>
        <p className="mt-4 text-cool">
          {before}
          <span className="text-gold">{identifier}</span>
          {after}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <ButtonLink to="/archive" variant="primary">
            {t('doc.notfound.back')}
          </ButtonLink>
          <ButtonLink to="/kiosk" variant="outline">
            {t('common.home')}
          </ButtonLink>
        </div>
      </div>
    );
  }

  const related = relatedRecords(record.id, 3, records);
  const translationChoice: TranslationChoice = language === 'en' ? 'original' : language;

  return (
    <div className="vignette min-h-screen">
      <div className="mx-auto max-w-[1500px] px-5 pt-8 sm:px-8">
        <Link
          to="/archive"
          className="inline-flex min-h-[56px] items-center gap-2.5 text-[0.68rem] font-semibold tracking-[0.24em] text-cool uppercase transition-colors hover:text-gold"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          {t('doc.back')}
        </Link>
      </div>

      <section className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 px-5 pt-6 pb-16 sm:px-8 lg:grid-cols-[1.08fr_minmax(0,0.92fr)] lg:gap-14">
        {/* ------------------------------- VIEWPLATE ------------------------------ */}
        <motion.figure
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="grain lg:sticky lg:top-[100px] lg:self-start"
        >
          <div className="hairline bg-ink-2 p-3">
            <div className="relative aspect-[4/3] overflow-hidden bg-ink">
              <img
                src={asset(record.image)}
                alt={record.title}
                className="sepia h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                aria-label={t('doc.action.fullscreenImage')}
                className="absolute right-4 bottom-4 flex h-14 w-14 items-center justify-center border border-gold/50 bg-ink/75 text-gold backdrop-blur-sm transition-colors hover:bg-gold hover:text-ink"
              >
                <Maximize2 size={18} strokeWidth={1.7} />
              </button>
            </div>
          </div>
          <figcaption className="mt-4 flex items-start gap-3 text-[0.72rem] leading-relaxed text-muted">
            <span className="mt-1.5 h-px w-8 shrink-0 bg-gold/70" aria-hidden="true" />
            <span>
              {record.credit ?? t('doc.caption.default')}
              <span className="block text-muted/70">
                {t('doc.caption.plate', { code: record.id.toUpperCase() })}
              </span>
            </span>
          </figcaption>
        </motion.figure>

        {/* -------------------------------- RECORD -------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="kicker">{t('doc.kicker')}</p>
          <h1 className="mt-4 font-display text-[clamp(2.1rem,4vw,3.3rem)] leading-[1.05] font-medium text-parchment">
            {record.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="border border-gold/50 px-3 py-1.5 text-[0.66rem] font-semibold tracking-[0.2em] text-gold uppercase">
              {t(CATEGORY_LABEL_KEYS[record.type])}
            </span>
            <span className="border border-gold/25 px-3 py-1.5 text-[0.66rem] font-semibold tracking-[0.2em] text-cool uppercase">
              {record.year}
            </span>
            {record.isSample && (
              <span className="border border-oxblood/70 bg-oxblood/20 px-3 py-1.5 text-[0.62rem] font-semibold tracking-[0.2em] text-parchment uppercase">
                {t('doc.badge.sample')}
              </span>
            )}
          </div>

          <div className="mt-8">
            <MetaRow icon={<Calendar size={16} strokeWidth={1.7} />} label={t('doc.meta.date')}>
              {record.year}
            </MetaRow>
            <MetaRow icon={<FileText size={16} strokeWidth={1.7} />} label={t('doc.meta.type')}>
              {t(CATEGORY_LABEL_KEYS[record.type])}
            </MetaRow>
            <MetaRow icon={<Languages size={16} strokeWidth={1.7} />} label={t('doc.meta.language')}>
              {record.language}
            </MetaRow>
            <MetaRow icon={<Warehouse size={16} strokeWidth={1.7} />} label={t('doc.meta.source')}>
              {record.source}
            </MetaRow>
            <MetaRow icon={<Tags size={16} strokeWidth={1.7} />} label={t('doc.meta.tags')}>
              <span className="flex flex-wrap gap-2">
                {record.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-gold/25 px-2.5 py-1 text-[0.7rem] tracking-[0.1em] text-cool uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            </MetaRow>
          </div>

          <p className="mt-7 text-[0.98rem] leading-relaxed text-cool">{record.description}</p>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            <Button variant="outline" onClick={() => setFullscreen(true)}>
              <Maximize2 size={16} strokeWidth={1.8} />
              {t('doc.action.fullscreen')}
            </Button>
            <Button variant="outline" onClick={() => setReadText(true)}>
              <BookOpen size={16} strokeWidth={1.8} />
              {t('doc.action.read')}
            </Button>
            <Button variant="primary" onClick={() => setAskOpen(true)}>
              <MessageSquareQuote size={16} strokeWidth={1.8} />
              {t('doc.action.ask')}
            </Button>
          </div>

          <div className="mt-6">
            <DigitalAccess recordId={record.id} />
          </div>
        </motion.div>
      </section>

      {/* ------------------------------ DOCUMENT TEXT ----------------------------- */}
      <section className="border-t border-gold/20 bg-ink/40">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <SectionHeader
                eyebrow={t('doc.text.eyebrow')}
                title={t('doc.text.title')}
                description={t('doc.text.desc')}
              />
              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setReadText(true)}>
                  <BookOpen size={16} strokeWidth={1.8} />
                  {t('doc.text.open')}
                </Button>
                <ButtonLink to="/archive" variant="ghost">
                  {t('common.archive')}
                  <ArrowRight size={15} strokeWidth={2} />
                </ButtonLink>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-4 text-[0.72rem] tracking-[0.2em] text-muted uppercase">
                {t('doc.text.extracted', { code: record.id.toUpperCase() })}
              </p>
              <TranslationPanel
                key={record.id}
                recordId={record.id}
                originalText={record.text}
                defaultChoice={translationChoice}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ------------------------------ RELATED ---------------------------------- */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8">
        <SectionHeader
          eyebrow={t('doc.related.eyebrow')}
          title={t('doc.related.title')}
          description={t('doc.related.desc')}
        />
        <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-3">
          {related.map((item, index) => (
            <DocumentCard key={item.id} record={item} index={index} />
          ))}
        </div>
      </section>

      <Footer />

      {/* -------------------------------- MODALS ---------------------------------- */}
      <Modal
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={record.title}
        subtitle={t('doc.modal.fullscreen.subtitle')}
        size="xl"
        closeLabel={t('common.close')}
        backdropLabel={t('common.closeDialog')}
      >
        <img
          src={asset(record.image)}
          alt={record.title}
          className="sepia max-h-[70vh] w-full object-contain"
        />
        <p className="mt-5 text-[0.78rem] leading-relaxed text-muted">
          {record.credit ?? t('doc.caption.default')} · {record.year} · {record.source}
        </p>
      </Modal>

      <Modal
        open={readText}
        onClose={() => setReadText(false)}
        title={record.title}
        subtitle={t('doc.modal.read.subtitle')}
        size="lg"
        tone="paper"
        closeLabel={t('common.close')}
        backdropLabel={t('common.closeDialog')}
      >
        <p className="mb-4 text-[0.66rem] font-semibold tracking-[0.24em] text-oxblood uppercase">
          {t('doc.modal.read.warning')}
        </p>
        <p className="font-display text-[1.2rem] leading-[1.8] whitespace-pre-line text-ink/85">
          {record.text}
        </p>
      </Modal>

      <Modal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        title={t('doc.ask.title')}
        subtitle={t('doc.ask.subtitle')}
        size="md"
        closeLabel={t('common.close')}
        backdropLabel={t('common.closeDialog')}
      >
        <p className="text-[0.95rem] leading-relaxed text-cool">{t('doc.ask.desc')}</p>
        <ul className="mt-6 space-y-3">
          {(['doc.ask.q1', 'doc.ask.q2', 'doc.ask.q3'] as const).map((key) => (
            <li
              key={key}
              className="flex items-start gap-3 border border-gold/25 bg-ink/50 px-4 py-3.5 text-[0.9rem] text-parchment/90"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
              {t(key)}
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-gold/20 pt-5 text-[0.72rem] leading-relaxed text-muted">
          {t('doc.ask.note')}
        </p>
      </Modal>
    </div>
  );
}
