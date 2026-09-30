import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import SearchBar from '../components/SearchBar';
import ArchiveCard from '../components/ArchiveCard';
import DigitalAccess from '../components/DigitalAccess';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { CATEGORY_LABEL_KEYS, useT } from '../i18n';
import { useArchive } from '../context/ArchiveContext';
import { CATEGORIES, countByCategory, searchRecords } from '../data';
import type { Category } from '../types';

type Filter = Category | 'All';

const FILTERS: Filter[] = ['All', ...CATEGORIES];

function isCategory(value: string | null): value is Category {
  return Boolean(value) && CATEGORIES.includes(value as Category);
}

export default function Archive() {
  const t = useT();
  const { records } = useArchive();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const rawCategory = params.get('category');
  const category: Filter = isCategory(rawCategory) ? rawCategory : 'All';

  const results = useMemo(
    () => searchRecords(query, category, records),
    [query, category, records],
  );

  const selectCategory = (next: Filter) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'All') nextParams.delete('category');
    else nextParams.set('category', next);
    setParams(nextParams, { replace: true });
  };

  const reset = () => {
    setQuery('');
    selectCategory('All');
  };

  const labelFor = (filter: Filter) =>
    filter === 'All' ? t('cat.all') : t(CATEGORY_LABEL_KEYS[filter]);

  return (
    <div className="vignette min-h-screen">
      <section className="border-b border-gold/20 bg-ink/50">
        <div className="mx-auto max-w-[1500px] px-5 pt-14 pb-12 sm:px-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader
                  as="h1"
                  eyebrow={t('archive.eyebrow', { n: records.length })}
                  title={t('archive.title')}
                  description={t('archive.desc')}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="mt-10 max-w-4xl"
              >
                <SearchBar value={query} onChange={setQuery} />
              </motion.div>

              {/* filters */}
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <span className="mr-1 hidden items-center gap-2 text-[0.64rem] font-semibold tracking-[0.24em] text-muted uppercase sm:flex">
                  <SlidersHorizontal size={14} strokeWidth={1.8} />
                  {t('archive.filter')}
                </span>
                {FILTERS.map((filter) => {
                  const active = filter === category;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => selectCategory(filter)}
                      aria-pressed={active}
                      className={`min-h-[56px] border px-5 text-[0.7rem] font-semibold tracking-[0.18em] uppercase transition-all duration-200 ${
                        active
                          ? 'border-gold bg-gold text-ink'
                          : 'border-gold/25 text-cool hover:border-gold/70 hover:text-parchment'
                      }`}
                    >
                      {labelFor(filter)}
                      <span
                        className={`ml-2.5 text-[0.66rem] ${active ? 'text-ink/70' : 'text-muted'}`}
                      >
                        {countByCategory(filter, records)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* digital access panel (lg+) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              <DigitalAccess compact />
            </motion.div>
          </div>
        </div>
      </section>

      {/* results */}
      <section className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-gold/15 pb-5">
          <h2 className="text-[0.78rem] font-normal tracking-[0.18em] text-cool uppercase">
            <span className="font-display text-[1.6rem] tracking-normal text-gold">
              {results.length}
            </span>{' '}
            {t(results.length === 1 ? 'archive.count.one' : 'archive.count.other', {
              n: results.length,
            })}
            {category !== 'All' && (
              <span className="text-muted">
                {' '}
                {t('archive.results.in')} {labelFor(category)}
              </span>
            )}
          </h2>
          {query && (
            <p className="text-[0.78rem] text-muted">
              {t('archive.results.matching', { q: query })}
            </p>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {results.map((record, index) => (
              <ArchiveCard key={record.id} record={record} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-xl border border-gold/25 bg-ink-2/60 px-8 py-16 text-center"
          >
            <SearchX size={40} strokeWidth={1.2} className="mx-auto text-gold" />
            <h2 className="mt-6 font-display text-[1.9rem] text-parchment">
              {t('archive.empty.title')}
            </h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-cool">
              {t('archive.empty.desc')}
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={reset} variant="primary">
                {t('archive.reset')}
              </Button>
            </div>
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
}
