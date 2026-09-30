import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import TimelineItem from '../components/TimelineItem';
import Footer from '../components/Footer';
import { ButtonLink } from '../components/Button';
import { useT } from '../i18n';
import { timelineEvents } from '../data';

export default function Timeline() {
  const t = useT();
  const [openId, setOpenId] = useState<string | null>(timelineEvents[0]?.id ?? null);

  return (
    <div className="vignette min-h-screen">
      <section className="border-b border-gold/20 bg-ink/50">
        <div className="mx-auto max-w-[1500px] px-5 pt-14 pb-14 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              as="h1"
              eyebrow={t('timeline.eyebrow', { n: timelineEvents.length })}
              title={t('timeline.title')}
              description={t('timeline.desc')}
              align="center"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap justify-center gap-3"
          >
            <ButtonLink to="/archive" variant="outline">
              {t('timeline.cta.archive')}
              <ArrowRight size={15} strokeWidth={2} />
            </ButtonLink>
            <ButtonLink to="/kiosk" variant="ghost">
              {t('timeline.cta.home')}
            </ButtonLink>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8">
        <ol className="relative">
          {timelineEvents.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              index={index}
              isOpen={openId === event.id}
              onToggle={() => setOpenId((current) => (current === event.id ? null : event.id))}
            />
          ))}
        </ol>

        <div className="mt-4 flex flex-col items-center gap-4">
          <span className="h-16 w-px bg-gradient-to-b from-gold/40 to-transparent" aria-hidden="true" />
          <p className="text-center text-[0.7rem] tracking-[0.26em] text-muted uppercase">
            {t('timeline.end', {
              year: timelineEvents[timelineEvents.length - 1]?.year ?? '',
            })}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
