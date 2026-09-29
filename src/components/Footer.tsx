import { Link } from 'react-router-dom';
import { Archive, Clock, Home } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="hairline-t bg-ink/60">
      <div className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1.4fr]">
          <div>
            <p className="font-display text-[1.5rem] leading-tight tracking-[0.14em] text-parchment">
              AMBEDKAR
              <br />
              HERITAGE HUB
            </p>
            <p className="mt-3 text-[0.6rem] font-semibold tracking-[0.34em] text-gold/80 uppercase">
              Digital Heritage Archive
            </p>
            <p className="mt-5 max-w-sm text-[0.82rem] leading-relaxed text-muted">
              An interactive public touchscreen kiosk connecting physical heritage exhibits
              with a searchable digital archive.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <p className="kicker mb-1">Navigate</p>
            <Link to="/kiosk" className="flex items-center gap-2.5 text-[0.86rem] text-cool transition-colors hover:text-gold">
              <Home size={15} /> Home
            </Link>
            <Link to="/archive" className="flex items-center gap-2.5 text-[0.86rem] text-cool transition-colors hover:text-gold">
              <Archive size={15} /> Explore Archive
            </Link>
            <Link to="/timeline" className="flex items-center gap-2.5 text-[0.86rem] text-cool transition-colors hover:text-gold">
              <Clock size={15} /> Timeline
            </Link>
          </nav>

          <div>
            <p className="kicker mb-3">Image credits &amp; disclaimer</p>
            <p className="text-[0.76rem] leading-relaxed text-muted">
              Archival photographs are drawn from the public domain, GODL India and
              CC BY-SA licensed media on Wikimedia Commons. Handwriting specimens are
              illustrative public-domain images used to demonstrate manuscript records.
            </p>
            <p className="mt-3 text-[0.76rem] leading-relaxed text-muted">
              Prototype build — records marked <span className="text-gold">SAMPLE</span>{' '}
              contain demonstration metadata and placeholder text. Content must be verified
              against authoritative archival sources before publication.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gold/15 pt-6 text-[0.7rem] tracking-[0.14em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>SIH 2026 · Prototype Phase 1</span>
          <span>Frontend demonstration · No backend · Local mock data</span>
        </div>
      </div>
    </footer>
  );
}
