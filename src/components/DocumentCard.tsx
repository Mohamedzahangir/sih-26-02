import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { ArchiveRecord } from '../types';
import { asset } from '../lib/asset';
import { CATEGORY_LABEL_KEYS, useT } from '../i18n';

interface DocumentCardProps {
  record: ArchiveRecord;
  index?: number;
}

export default function DocumentCard({ record, index = 0 }: DocumentCardProps) {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/document/${record.id}`}
        className="group flex min-w-0 items-stretch gap-4 bg-ink-2/60 hairline p-3 transition-colors duration-300 hover:border-gold/60"
      >
        <div className="relative h-[86px] w-[110px] shrink-0 overflow-hidden">
          <img
            src={asset(record.image)}
            alt={record.title}
            loading="lazy"
            className="sepia h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 ring-1 ring-inset ring-gold/20" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
          <span className="truncate text-[0.62rem] font-semibold tracking-[0.22em] text-gold uppercase">
            {t(CATEGORY_LABEL_KEYS[record.type])} · {record.year}
          </span>
          <h3 className="mt-1.5 truncate font-display text-[1.12rem] leading-snug text-parchment transition-colors group-hover:text-gold-2">
            {record.title}
          </h3>
          <p className="mt-1 truncate text-[0.78rem] text-muted">{record.source}</p>
        </div>
      </Link>
    </motion.div>
  );
}
