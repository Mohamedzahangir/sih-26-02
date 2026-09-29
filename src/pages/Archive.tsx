import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import SearchBar from '../components/SearchBar';
import ArchiveCard from '../components/ArchiveCard';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { CATEGORIES, archiveRecords, countByCategory, searchRecords } from '../data';
import type { Category } from '../types';

type Filter = Category | 'All';

const FILTERS: Filter[] = ['All', ...CATEGORIES];

function isCategory(value: string | null): value is Category {
  return Boolean(value) && CATEGORIES.includes(value as Category);
}

export default function Archive() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const rawCategory = params.get('category');
  const category: Filter = isCategory(rawCategory) ? rawCategory : 'All';

  const results = useMemo(() => searchRecords(query, category), [query, category]);

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

  return (
    <div className="vignette min-h-screen">
      <section className="border-b border-gold/20 bg-ink/50">
        <div className="mx-auto max-w-[1500px] px-5 pt-14 pb-12 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              eyebrow={`Collection · ${archiveRecords.length} records`}
              title="Digital Archive"
              description="Explore documents, manuscripts and historical records."
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
              Filter
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
                  {filter}
                  <span
                    className={`ml-2.5 text-[0.66rem] ${active ? 'text-ink/70' : 'text-muted'}`}
                  >
                    {countByCategory(filter)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* results */}
      <section className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 border-b border-gold/15 pb-5">
          <p className="text-[0.78rem] tracking-[0.18em] text-cool uppercase">
            <span className="font-display text-[1.6rem] tracking-normal text-gold">
              {results.length}
            </span>{' '}
            {results.length === 1 ? 'record' : 'records'}
            {category !== 'All' && <span className="text-muted"> in {category}</span>}
          </p>
          {query && (
            <p className="text-[0.78rem] text-muted">
              Matching “<span className="text-parchment">{query}</span>”
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
            <h3 className="mt-6 font-display text-[1.9rem] text-parchment">No records found</h3>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-cool">
              Nothing in the archive matches this search. Try a different term, or reset the
              filters to browse the full collection.
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={reset} variant="primary">
                Reset search &amp; filters
              </Button>
            </div>
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
}
