import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import vi from './vi.json';

export type Locale = 'en' | 'vi';

// en.json is the source of truth for the key namespace. Two keyings a translator needs
// explained: `apiError` by league-be's 5-digit code (named in src/types/errors.ts), and
// `loginError` by the ?error= slug, a separate namespace.

// Keeps en's shape but widens its values, so a missing vi translation fails typecheck. An
// extra key in vi is not caught: excess-property checks skip imported modules.
type Translations<T> = {
  [K in keyof T]: T[K] extends string ? string : Translations<T[K]>;
};

const viChecked: Translations<typeof en> = vi;

const STORAGE_KEY = 'locale';

function storedLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'vi') {
    return stored;
  }

  return 'en';
}

void i18next.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: viChecked } },
  lng: storedLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// <html lang> drives screen-reader pronunciation, so it must follow the active locale.
function syncDocumentLang(locale: Locale): void {
  document.documentElement.lang = locale;
}

syncDocumentLang(storedLocale());

// A display preference, so persisting it is fine. Nothing session-identifying is stored.
export function setLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
  syncDocumentLang(locale);
  void i18next.changeLanguage(locale);
}

export { i18next };
