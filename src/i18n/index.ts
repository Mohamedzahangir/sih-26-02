import { useCallback } from 'react';
import { en, type TranslationKey } from './en';
import { hi } from './hi';
import { ta } from './ta';
import { mr } from './mr';
import { usePreferences, type LanguageCode } from '../context/PreferencesContext';
import type { Category } from '../types';

export type { TranslationKey, LanguageCode };

export type Vars = Record<string, string | number>;

const DICTIONARY: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = {
  en,
  hi,
  ta,
  mr,
};

/** Resolve a key for a language, falling back to English, then to the key itself. */
export function translate(language: LanguageCode, key: TranslationKey, vars?: Vars): string {
  const template = (language !== 'en' ? DICTIONARY[language][key] : undefined) ?? en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** Hook: returns a stable translator bound to the current interface language. */
export function useT() {
  const { language } = usePreferences();
  return useCallback(
    (key: TranslationKey, vars?: Vars) => translate(language, key, vars),
    [language],
  );
}

export type CategoryKey =
  | 'manuscripts'
  | 'writings'
  | 'speeches'
  | 'photographs'
  | 'historical-documents';

export function categoryKey(category: Category | string): CategoryKey {
  switch (category) {
    case 'Manuscripts':
      return 'manuscripts';
    case 'Writings':
      return 'writings';
    case 'Speeches':
      return 'speeches';
    case 'Photographs':
      return 'photographs';
    default:
      return 'historical-documents';
  }
}

export const CATEGORY_LABEL_KEYS: Record<Category, TranslationKey> = {
  Manuscripts: 'cat.manuscripts',
  Writings: 'cat.writings',
  Speeches: 'cat.speeches',
  Photographs: 'cat.photographs',
  'Historical Documents': 'cat.historical-documents',
};

/** Language names always shown in their own script. */
export const LANGUAGE_NAME_KEYS: Record<LanguageCode, TranslationKey> = {
  en: 'lang.en',
  hi: 'lang.hi',
  ta: 'lang.ta',
  mr: 'lang.mr',
};
