import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import ArchiveCard from '../components/ArchiveCard';
import Footer from '../components/Footer';
import { ButtonLink } from '../components/Button';
import { COLLECTION_TILES, archiveRecords, getFeatured } from '../data';
import { asset } from '../lib/asset';

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
};

export default function KioskHome() {
  const featured = getFeatured();

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
              Digital Heritage Archive
            </motion.p>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.8rem,6.2vw,5.4rem)] leading-[0.98] font-medium text-parchment"
            >
              Explore the Legacy
              <br />
              {' '}
              <span className="text-gold">of Dr. B. R. Ambedkar</span>
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
              Discover manuscripts, writings, speeches and historical records through an
              immersive digital archive.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <ButtonLink to="/archive" variant="primary">
                Explore the Archive
                <ArrowRight size={17} strokeWidth={2} />
              </ButtonLink>
              <ButtonLink to="/timeline" variant="outline">
                <Clock size={17} strokeWidth={1.8} />
                View Timeline
              </ButtonLink>
            </motion.div>

            <motion.dl
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-gold/20 pt-6"
            >
              {[
                { term: 'Records', value: String(archiveRecords.length) },
                { term: 'Collections', value: '05' },
                { term: 'Timeline entries', value: '10' },
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

      {/* ------------------------------ COLLECTION ------------------------------ */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Browse by collection"
          title="Explore the Collection"
          description="Four standing collections form the core of the archive. Select a collection to open the Digital Archive with that filter applied."
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
                    {tile.label}
                  </span>
                  <span className="mt-3 text-[0.8rem] leading-snug text-cool">{tile.blurb}</span>
                  <span className="mt-4 flex items-center gap-2 text-[0.64rem] font-semibold tracking-[0.24em] text-gold uppercase">
                    Open collection
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------- FEATURED ------------------------------- */}
      <section className="border-t border-gold/20 bg-ink/40">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              eyebrow="Selected from the holdings"
              title="Featured Archive"
              description="Three records chosen to open the collection."
            />
            <ButtonLink to="/archive" variant="outline">
              View all records
              <ArrowRight size={16} strokeWidth={2} />
            </ButtonLink>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((record, index) => (
              <ArchiveCard key={record.id} record={record} index={index} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
