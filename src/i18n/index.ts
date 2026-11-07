import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import vi from './vi.json';

export type Locale = 'en' | 'vi';

// en.json is the source of truth for the key namespace; vi.json is checked against it below.
//
// Notes that cannot live in JSON:
// - `apiError` is keyed by league-be's 5-digit error code. `src/types/errors.ts` maps each
//   code to its constant name — a translator needs that to know what 40101 is.
// - `loginError` is keyed by the ?error= slug on the redirect back to /login, which is a
//   different namespace from the API codes: a failed navigation carries no JSON body.

// Widens en's value types while keeping its shape, so every key present in en must exist in
// vi. A missing translation fails `pnpm typecheck`. (An *extra* key in vi is not caught:
// excess-property checking only applies to fresh object literals, not imported modules.)
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

// <html lang> drives screen-reader pronunciation and hyphenation, so it has to follow the
// active locale rather than staying at the value index.html shipped with.
function syncDocumentLang(locale: Locale): void {
  document.documentElement.lang = locale;
}

syncDocumentLang(storedLocale());

// Language is a display preference, not auth state, so persisting it is fine. Nothing that
// identifies a session is ever written to localStorage.
export function setLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
  syncDocumentLang(locale);
  void i18next.changeLanguage(locale);
}

export { i18next };
