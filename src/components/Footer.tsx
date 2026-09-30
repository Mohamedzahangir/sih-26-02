import { Link } from 'react-router-dom';
import { Archive, Clock, FileScan, Home, QrCode } from 'lucide-react';
import { useT } from '../i18n';

export default function Footer() {
  const t = useT();

  return (
    <footer className="hairline-t bg-ink/60">
      <div className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1.4fr]">
          <div>
            <p className="font-display text-[1.5rem] leading-tight tracking-[0.14em] text-parchment">
              {t('footer.brand.1')}
              <br />
              {t('footer.brand.2')}
            </p>
            <p className="mt-3 text-[0.6rem] font-semibold tracking-[0.34em] text-gold/80 uppercase">
              {t('footer.tagline')}
            </p>
            <p className="mt-5 max-w-sm text-[0.82rem] leading-relaxed text-muted">
              {t('footer.about')}
            </p>
          </div>

          <nav aria-label={t('footer.navigate')} className="flex flex-col gap-3">
            <p className="kicker mb-1">{t('footer.navigate')}</p>
            <Link
              to="/kiosk"
              className="flex items-center gap-2.5 text-[0.86rem] text-cool transition-colors hover:text-gold"
            >
              <Home size={15} /> {t('nav.home')}
            </Link>
            <Link
              to="/archive"
              className="flex items-center gap-2.5 text-[0.86rem] text-cool transition-colors hover:text-gold"
            >
              <Archive size={15} /> {t('nav.archive')}
            </Link>
            <Link
              to="/timeline"
              className="flex items-center gap-2.5 text-[0.86rem] text-cool transition-colors hover:text-gold"
            >
              <Clock size={15} /> {t('nav.timeline')}
            </Link>
            <Link
              to="/scan"
              className="flex items-center gap-2.5 text-[0.86rem] text-cool transition-colors hover:text-gold"
            >
              <QrCode size={15} /> {t('footer.scan')}
            </Link>
            <Link
              to="/ocr"
              className="flex items-center gap-2.5 text-[0.86rem] text-cool transition-colors hover:text-gold"
            >
              <FileScan size={15} /> {t('footer.ocr')}
            </Link>
          </nav>

          <div>
            <p className="kicker mb-3">{t('footer.credits')}</p>
            <p className="text-[0.76rem] leading-relaxed text-muted">
              {t('footer.credits.body')}
            </p>
            <p className="mt-3 text-[0.76rem] leading-relaxed text-muted">
              {t('footer.disclaimer.body')}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gold/15 pt-6 text-[0.7rem] tracking-[0.14em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>{t('footer.phase')}</span>
          <span>{t('footer.meta')}</span>
        </div>
      </div>
    </footer>
  );
}
