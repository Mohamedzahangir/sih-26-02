import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileScan, QrCode, Sparkles } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import ArchiveCard from '../components/ArchiveCard';
import ScanQr from '../components/ScanQr';
import Footer from '../components/Footer';
import { ButtonLink } from '../components/Button';
import { COLLECTION_TILES, getFeatured } from '../data';
import { asset } from '../lib/asset';
import { CATEGORY_LABEL_KEYS, useT, type TranslationKey } from '../i18n';
import { useArchive } from '../context/ArchiveContext';
import { useTransfer } from '../context/TransferContext';

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
};

const TILE_BLURB_KEYS: Record<string, TranslationKey> = {
  Manuscripts: 'tile.manuscripts.blurb',
  Writings: 'tile.writings.blurb',
  Speeches: 'tile.speeches.blurb',
  Photographs: 'tile.photographs.blurb',
};

export default function KioskHome() {
  const t = useT();
  const { records } = useArchive();
  const { qrUrl } = useTransfer();
  const featured = getFeatured(records);

  const quickCards: {
    to: string;
    icon: React.ReactNode;
    labelKey: TranslationKey;
    titleKey: TranslationKey;
    descKey: TranslationKey;
    ctaKey: TranslationKey;
  }[] = [
    {
      to: '/scan',
      icon: <QrCode size={26} strokeWidth={1.5} />,
      labelKey: 'home.quick.scan.label',
      titleKey: 'home.quick.scan.title',
      descKey: 'home.quick.scan.desc',
      ctaKey: 'home.quick.scan.cta',
    },
    {
      to: '/digitize',
      icon: <FileScan size={26} strokeWidth={1.5} />,
      labelKey: 'home.quick.ocr.label',
      titleKey: 'home.quick.ocr.title',
      descKey: 'home.quick.ocr.desc',
      ctaKey: 'home.quick.ocr.cta',
    },
  ];

  return (
    <div className="vignette">
      {/* ---------------------------------- HERO --------------------------------- */}
      <section className="relative overflow-hidden border-b border-gold/20">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(70% 55% at 78% 18%, rgba(201,162,75,0.14), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="kicker mb-6"
            >
              {t('home.kicker')}
            </motion.p>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.4rem,6.2vw,5.4rem)] leading-[0.98] font-medium text-parchment"
            >
              {t('home.title.1')}
              <br />
              {' '}
              <span className="text-gold">{t('home.title.2')}</span>
            </motion.h1>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 h-px w-36 bg-gold/60"
            />

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-cool"
            >
              {t('home.desc')}
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <ButtonLink to="/archive" variant="primary">
                {t('home.cta.archive')}
                <ArrowRight size={17} strokeWidth={2} />
              </ButtonLink>
              <ButtonLink to="/ask" variant="outline">
                <Sparkles size={17} strokeWidth={1.8} />
                {t('home.cta.ask')}
              </ButtonLink>
              <ButtonLink to="/digitize" variant="outline">
                <FileScan size={17} strokeWidth={1.8} />
                {t('home.cta.digitize')}
              </ButtonLink>
            </motion.div>

            <motion.dl
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-gold/20 pt-6"
            >
              {[
                { term: t('home.stats.records'), value: String(records.length) },
                { term: t('home.stats.collections'), value: '05' },
                { term: t('home.stats.timeline'), value: '10' },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="text-[0.6rem] font-semibold tracking-[0.24em] text-muted uppercase">
                    {item.term}
                  </dt>
                  <dd className="mt-1.5 font-display text-[2.1rem] leading-none text-gold">
                    {item.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* archival image plate */}
          <motion.figure
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="grain relative"
          >
            <div className="hairline relative overflow-hidden bg-ink-2 p-2.5">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={asset('images/ambedkar-1950.jpg')}
                  alt="Archival photograph of Dr. B. R. Ambedkar at his desk, c. 1950"
                  className="sepia h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              </div>
            </div>
            <figcaption className="mt-4 flex items-start gap-3 text-[0.72rem] leading-relaxed text-muted">
              <span className="mt-1.5 h-px w-8 shrink-0 bg-gold/70" aria-hidden="true" />
              <span>
                At his desk, c. 1950 — archival photograph.
                <span className="block text-muted/70">
                  Public domain, Wikimedia Commons.
                </span>
              </span>
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* -------------------------------- QR BAND -------------------------------- */}
      <section className="border-b border-gold/20 bg-ink/60">
        <div className="mx-auto grid max-w-[1500px] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:py-16">
          <div>
            <p className="kicker">{t('home.qr.eyebrow')}</p>
            <h2 className="mt-4 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight text-parchment">
              {t('home.qr.title')}
            </h2>
            <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-cool">
              {t('home.qr.desc')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink to="/digitize" variant="primary">
                {t('home.qr.cta')}
                <ArrowRight size={17} strokeWidth={2} />
              </ButtonLink>
              <ButtonLink to="/scan" variant="outline">
                <QrCode size={17} strokeWidth={1.8} />
                {t('footer.scan')}
              </ButtonLink>
            </div>
          </div>

          <div className="mx-auto border border-gold/40 bg-ink-2 p-5 transition-colors duration-300 lg:mx-0">
            <ScanQr
              value={qrUrl}
              size={196}
              label={t('home.qr.title')}
              className="mx-auto block"
            />
            <span className="mt-4 block text-center text-[0.62rem] font-semibold tracking-[0.22em] text-gold/80 uppercase">
              {t('home.qr.note')}
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------- FEATURED ------------------------------- */}
      <section className="border-b border-gold/20 bg-ink/40">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              eyebrow={t('home.featured.eyebrow')}
              title={t('home.featured.title')}
              description={t('home.featured.desc')}
            />
            <ButtonLink to="/archive" variant="outline">
              {t('home.featured.viewAll')}
              <ArrowRight size={16} strokeWidth={2} />
            </ButtonLink>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((record, index) => (
              <ArchiveCard key={record.id} record={record} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ COLLECTION ------------------------------ */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:py-24">
        <SectionHeader
          eyebrow={t('home.collections.eyebrow')}
          title={t('home.collections.title')}
          description={t('home.collections.desc')}
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {COLLECTION_TILES.map((tile, index) => (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/archive?category=${encodeURIComponent(tile.category)}`}
                className="group relative block h-[320px] w-full overflow-hidden text-left"
              >
                <img
                  src={asset(tile.image)}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="sepia absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 transition-opacity duration-500 group-hover:from-ink group-hover:via-ink/70" />
                <span className="hairline pointer-events-none absolute inset-0 transition-colors duration-300 group-hover:border-gold/70" />
                <span className="relative flex h-full flex-col justify-end p-6">
                  <span className="mb-3 h-px w-10 bg-gold" />
                  <span className="font-display text-[1.7rem] leading-none tracking-[0.1em] text-parchment transition-colors group-hover:text-gold-2">
                    {t(CATEGORY_LABEL_KEYS[tile.category])}
                  </span>
                  <span className="mt-3 text-[0.8rem] leading-snug text-cool">
                    {t(TILE_BLURB_KEYS[tile.category])}
                  </span>
                  <span className="mt-4 flex items-center gap-2 text-[0.64rem] font-semibold tracking-[0.24em] text-gold uppercase">
                    {t('tile.open')}
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------- HERITAGE ACCESS ---------------------------- */}
      <section className="border-t border-gold/20 bg-ink/40">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeader
            eyebrow={t('home.quick.eyebrow')}
            title={t('home.quick.title')}
            description={t('home.quick.desc')}
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {quickCards.map((card, index) => (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={card.to}
                  className="group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden bg-ink-2/70 hairline p-7 transition-colors duration-300 hover:border-gold/70"
                >
                  <span
                    className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      backgroundImage:
                        'radial-gradient(120% 100% at 8% 0%, rgba(201,162,75,0.16), transparent 65%)',
                    }}
                    aria-hidden="true"
                  />
                  <span className="relative flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center border border-gold/50 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-ink">
                      {card.icon}
                    </span>
                    <span className="text-[0.62rem] font-semibold tracking-[0.26em] text-gold/80 uppercase">
                      {t(card.labelKey)}
                    </span>
                  </span>
                  <span className="relative mt-8 block">
                    <span className="block font-display text-[clamp(1.7rem,3vw,2.3rem)] leading-none text-parchment transition-colors duration-300 group-hover:text-gold-2">
                      {t(card.titleKey)}
                    </span>
                    <span className="mt-3 block text-[0.9rem] leading-relaxed text-cool">
                      {t(card.descKey)}
                    </span>
                    <span className="mt-5 flex items-center gap-2 text-[0.66rem] font-semibold tracking-[0.24em] text-gold uppercase">
                      {t(card.ctaKey)}
                      <ArrowRight
                        size={15}
                        strokeWidth={2}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
