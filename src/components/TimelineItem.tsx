import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import type { TimelineEvent } from '../types';
import { getRecord } from '../data';
import { asset } from '../lib/asset';
import { useT } from '../i18n';

interface TimelineItemProps {
  event: TimelineEvent;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function TimelineItem({ event, index, isOpen, onToggle }: TimelineItemProps) {
  const related = getRecord(event.recordId);
  const fromLeft = index % 2 === 0;
  const t = useT();

  return (
    <motion.li
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-10"
    >
      {/* year — desktop side column */}
      <div
        className={`hidden lg:flex ${
          fromLeft ? 'col-start-1 justify-end pr-2 text-right' : 'col-start-3 justify-start pl-2'
        } row-start-1 items-start`}
      >
        <span className="font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-none text-gold/85">
          {event.year}
        </span>
      </div>

      {/* rail node */}
      <div className="relative flex flex-col items-center lg:col-start-2 lg:row-start-1">
        <span
          className={`z-10 mt-2 h-4 w-4 rotate-45 border transition-all duration-300 ${
            isOpen
              ? 'border-gold bg-gold shadow-[0_0_0_6px_rgba(201,162,75,0.16)]'
              : 'border-gold/70 bg-ink'
          }`}
          aria-hidden="true"
        />
        <span className="w-px flex-1 bg-gradient-to-b from-gold/50 via-gold/25 to-gold/10" />
      </div>

      {/* entry card */}
      <div         className={`min-w-0 pb-12 lg:row-start-1 ${fromLeft ? 'lg:col-start-3' : 'lg:col-start-1'}`}>
        <div className="w-full bg-ink-2/70 hairline transition-colors duration-300 hover:border-gold/50 sm:w-[min(100%,640px)]">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            className="group w-full cursor-pointer p-5 text-left transition-colors duration-300 hover:bg-gold/[0.04] focus-visible:bg-gold/[0.04] sm:p-7"
          >
            <span className="flex items-start justify-between gap-5">
              <span className="block">
                <span className="block font-display text-[1.7rem] leading-none text-gold lg:hidden">
                  {event.year}
                </span>
                <span className="mt-2 block font-display text-[clamp(1.4rem,2.4vw,2rem)] font-medium leading-tight text-parchment lg:mt-0">
                  {event.title}
                </span>
                <span className="mt-3 block max-w-xl text-[0.92rem] leading-relaxed text-cool">
                  {event.description}
                </span>
              </span>
              <span
                className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center border text-gold transition-colors duration-300 group-hover:border-gold/70 ${
                  isOpen ? 'border-gold/70' : 'border-gold/40'
                }`}
              >
                {isOpen ? <Minus size={18} /> : <Plus size={18} />}
              </span>
            </span>
          </button>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-6 sm:px-7 sm:pb-7">
                  <div className="border-t border-gold/25 pt-5">
                    <p className="max-w-xl text-[0.95rem] leading-relaxed text-parchment/85">
                      {event.detail}
                    </p>

                    {related && (
                      <Link
                        to={`/document/${related.id}`}
                        className="group mt-6 flex items-center gap-4 border border-gold/25 p-3 transition-colors hover:border-gold/70"
                      >
                        <span className="relative h-[74px] w-[104px] shrink-0 overflow-hidden">
                          <img
                            src={asset(related.image)}
                            alt={related.title}
                            loading="lazy"
                            className="sepia h-full w-full object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.6rem] font-semibold tracking-[0.24em] text-gold uppercase">
                            {t('timeline.related')}
                          </span>
                          <span className="mt-1 block truncate font-display text-[1.1rem] text-parchment">
                            {related.title}
                          </span>
                        </span>
                        <ArrowRight
                          size={20}
                          className="mr-2 shrink-0 text-gold transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
}
