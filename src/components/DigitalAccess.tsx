import QrGlyph from './QrGlyph';
import { ButtonLink } from './Button';
import { exhibitCode } from '../data';
import { useT } from '../i18n';

interface DigitalAccessProps {
  /** Record whose exhibit code is shown. Omit for the generic archive panel. */
  recordId?: string;
  /** Smaller layout for sidebars. */
  compact?: boolean;
}

export default function DigitalAccess({ recordId, compact = false }: DigitalAccessProps) {
  const t = useT();
  const code = recordId ? exhibitCode(recordId) : undefined;
  const seed = code ?? 'ambedkar-heritage-hub-archive';
  const glyph = compact ? 86 : 124;

  return (
    <section
      aria-label={t('doc.digital.title')}
      className="hairline bg-ink-2/70 p-5 transition-colors duration-300 sm:p-6"
    >
      <div className="flex items-start gap-5">
        <span className="border border-gold/30 bg-parchment p-1.5">
          <QrGlyph seed={seed} size={glyph} label={t('doc.digital.note')} />
        </span>
        <div className="min-w-0">
          <p className="kicker">{t('doc.digital.title')}</p>
          <p className="mt-3 text-[0.95rem] leading-snug text-parchment">
            {t('doc.digital.desc')}
          </p>
          {code && (
            <p className="mt-3 text-[0.7rem] leading-relaxed text-muted">
              {t('doc.digital.code')}{' '}
              <span className="font-semibold tracking-[0.18em] text-gold">{code}</span>
            </p>
          )}
          <p className="mt-3 text-[0.56rem] font-semibold tracking-[0.22em] text-muted uppercase">
            {t('doc.digital.note')}
          </p>
        </div>
      </div>
      <ButtonLink to="/scan" variant="outline" className="mt-5 w-full">
        {t('doc.digital.cta')}
      </ButtonLink>
    </section>
  );
}
