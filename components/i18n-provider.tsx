"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getLanguageMeta,
  getTranslations,
  LANGUAGES,
  type Locale,
  type Translations,
} from "@/lib/i18n";

const STORAGE_KEY = "improtrack_language";
const DEFAULT_LOCALE: Locale = "en";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations, params?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  t: (key) => key as string,
});

function resolveLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      return stored as Locale;
    }
  } catch {
    // localStorage unavailable — fall through
  }

  // Try to match browser language
  const browserLang = navigator.language ?? "";
  const exact = LANGUAGES.find((l) => l.code === browserLang);
  if (exact) return exact.code;

  // Try prefix match (e.g. "en-US" → "en")
  const prefix = browserLang.split("-")[0];
  const prefixMatch = LANGUAGES.find((l) => l.code === prefix);
  if (prefixMatch) return prefixMatch.code;

  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage / browser language on client
  useEffect(() => {
    setLocaleState(resolveLocale());
  }, []);

  // Apply RTL direction and lang attribute on locale change
  useEffect(() => {
    const meta = getLanguageMeta(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const t = useCallback(
    (key: keyof Translations, params?: Record<string, string>): string => {
      const translations = getTranslations(locale);
      let text: string = translations[key] ?? (key as string);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, v);
        }
      }
      return text;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
