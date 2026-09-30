import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LanguageCode } from '../context/PreferencesContext';
import { LANGUAGE_NAME_KEYS, useT } from '../i18n';
import { getTranslation } from '../data/translations';

export type TranslationChoice = LanguageCode | 'original';

/** ORIGINAL · ENGLISH · हिन्दी · தமிழ் · मरாठी */
const OPTIONS: TranslationChoice[] = ['original', 'en', 'hi', 'ta', 'mr'];

interface TranslationPanelProps {
  /** Archive record id (or OCR document id) that owns the stored translation. */
  recordId: string;
  /** The source-language text shown under ORIGINAL. */
  originalText: string;
  /** Chip selected on first render. Defaults to the original text. */
  defaultChoice?: TranslationChoice;
}

export default function TranslationPanel({
  recordId,
  originalText,
  defaultChoice = 'original',
}: TranslationPanelProps) {
  const t = useT();
  const [choice, setChoice] = useState<TranslationChoice>(defaultChoice);

  const translated = choice === 'original' ? undefined : getTranslation(recordId, choice);
  const available = choice === 'original' || Boolean(translated);
  const body = choice === 'original' ? originalText : (translated ?? originalText);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('lang.select')}>
        {OPTIONS.map((option) => {
          const active = option === choice;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setChoice(option)}
              className={`min-h-[56px] border px-5 text-[0.72rem] font-semibold tracking-[0.16em] uppercase transition-all duration-200 ${
                active
                  ? 'border-gold bg-gold text-ink'
                  : 'border-gold/25 text-cool hover:border-gold/70 hover:text-parchment'
              }`}
            >
              {option === 'original' ? t('lang.original') : t(LANGUAGE_NAME_KEYS[option])}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="mt-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={choice}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="paper paper-edge p-6 sm:p-8"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-ink/20 pb-4">
              <p className="text-[0.62rem] font-semibold tracking-[0.26em] text-ink/60 uppercase">
                {choice === 'original' ? t('doc.text.originalLabel') : t('doc.text.translatedLabel')}
              </p>
              <span className="border border-oxblood/60 px-2.5 py-1 text-[0.58rem] font-semibold tracking-[0.2em] text-oxblood uppercase">
                {choice === 'original' ? t('common.sample') : t('doc.text.mockBadge')}
              </span>
            </div>

            {!available && (
              <p className="mb-4 border-l-2 border-oxblood/70 pl-3 text-[0.8rem] leading-relaxed text-oxblood">
                {t('doc.text.unavailable')}
              </p>
            )}

            <p className="font-display text-[1.1rem] leading-[1.8] whitespace-pre-line text-ink/85">
              {body}
            </p>

            {choice !== 'original' && (
              <p className="mt-6 border-t border-ink/15 pt-4 text-[0.72rem] leading-relaxed text-ink/55">
                {t('doc.text.mockNote')}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
