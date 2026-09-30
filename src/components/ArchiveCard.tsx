import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkle } from 'lucide-react';
import type { ArchiveRecord } from '../types';
import { asset } from '../lib/asset';
import { CATEGORY_LABEL_KEYS, useT } from '../i18n';
import { useArchive } from '../context/ArchiveContext';

interface ArchiveCardProps {
  record: ArchiveRecord;
  index?: number;
}

export default function ArchiveCard({ record, index = 0 }: ArchiveCardProps) {
  const t = useT();
  const { sessionIds } = useArchive();
  const isSessionRecord = sessionIds.includes(record.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.55,
        delay: Math.min(index, 7) * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group h-full"
    >
      <Link
        to={`/document/${record.id}`}
        className="relative flex h-full flex-col bg-ink-2/70 hairline transition-colors duration-300 group-hover:border-gold/60"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={asset(record.image)}
            alt={record.title}
            loading="lazy"
            className="sepia h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <span className="border border-gold/50 bg-ink/75 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.2em] text-gold backdrop-blur-sm">
                {record.year}
              </span>
              <span className="flex flex-col items-end gap-2">
                {isSessionRecord && (
                  <span className="flex items-center gap-1.5 border border-gold bg-gold/90 px-2 py-1 text-[0.56rem] font-semibold tracking-[0.18em] text-ink uppercase">
                    <Sparkle size={11} strokeWidth={2} />
                    {t('archive.newBadge')}
                  </span>
                )}
                {record.isSample && (
                  <span className="border border-parchment/25 bg-ink/70 px-2 py-1 text-[0.58rem] font-semibold tracking-[0.18em] text-parchment/70 backdrop-blur-sm">
                    {t('common.sample')}
                  </span>
                )}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 flex items-center gap-3 p-4">
              <span className="h-px w-6 bg-gold" aria-hidden="true" />
              <span className="text-[0.64rem] font-semibold tracking-[0.26em] text-gold uppercase">
                {t(CATEGORY_LABEL_KEYS[record.type])}
              </span>
            </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-display text-[1.45rem] leading-snug font-medium text-parchment transition-colors duration-200 group-hover:text-gold-2">
            {record.title}
          </h3>
          <p className="mt-3 flex-1 text-[0.9rem] leading-relaxed text-cool line-clamp-3">
            {record.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {record.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="border border-gold/20 px-2.5 py-1 text-[0.64rem] tracking-[0.14em] text-muted uppercase"
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto flex items-center gap-1.5 text-[0.66rem] tracking-[0.2em] text-gold/80 uppercase">
              {t('common.open')}
              <ArrowUpRight
                size={15}
                strokeWidth={1.8}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </div>
        </div>
        <span className="pointer-events-none absolute inset-0 ring-1 ring-transparent ring-inset transition duration-300 group-hover:ring-gold/30" />
      </Link>
    </motion.article>
  );
}
