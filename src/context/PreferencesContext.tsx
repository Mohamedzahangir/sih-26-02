import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'mr';

export const LANGUAGES: { code: LanguageCode; label: string; native: string; short: string }[] = [
  { code: 'en', label: 'English', native: 'English', short: 'EN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', short: 'HI' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', short: 'TA' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', short: 'MR' },
];

interface PreferencesValue {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  largeText: boolean;
  toggleLargeText: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
}

const PreferencesContext = createContext<PreferencesValue | null>(null);

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function readLanguage(): LanguageCode {
  const stored = readStored<string | LanguageCode>('ahh.language', 'en');
  const normalised = String(stored).toLowerCase();
  return normalised === 'hi' || normalised === 'ta' || normalised === 'mr'
    ? normalised
    : 'en';
}

function writeStored(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — preferences stay in memory */
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => readLanguage());
  const [largeText, setLargeText] = useState<boolean>(() => readStored('ahh.largeText', false));
  const [highContrast, setHighContrast] = useState<boolean>(() =>
    readStored('ahh.highContrast', false),
  );
  const [reduceMotion, setReduceMotion] = useState<boolean>(() =>
    readStored('ahh.reduceMotion', false),
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('fs-lg', largeText);
    root.classList.toggle('hc', highContrast);
    root.classList.toggle('reduce-motion', reduceMotion);
  }, [largeText, highContrast, reduceMotion]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    writeStored('ahh.language', code);
  }, []);

  const value = useMemo<PreferencesValue>(
    () => ({
      language,
      setLanguage,
      largeText,
      toggleLargeText: () => {
        setLargeText((prev) => {
          writeStored('ahh.largeText', !prev);
          return !prev;
        });
      },
      highContrast,
      toggleHighContrast: () => {
        setHighContrast((prev) => {
          writeStored('ahh.highContrast', !prev);
          return !prev;
        });
      },
      reduceMotion,
      toggleReduceMotion: () => {
        setReduceMotion((prev) => {
          writeStored('ahh.reduceMotion', !prev);
          return !prev;
        });
      },
    }),
    [language, setLanguage, largeText, highContrast, reduceMotion],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }
  return context;
}
