import { i18next } from '@/i18n';

// Intl needs a BCP 47 tag; i18next carries 'en' | 'vi', which are already valid.
function activeLocale(): string {
  return i18next.language;
}

// "Tue 10 Nov, 19:30" — the fixture card's meta line. The backend sends RFC 3339, so the
// Date is constructed from a string Date can actually parse.
export function formatFixtureDateTime(isoDateTime: string): string {
  const parsed = new Date(isoDateTime);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(activeLocale(), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

export function formatDate(isoDateTime: string): string {
  const parsed = new Date(isoDateTime);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(activeLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

// "3/5" — matches won over matches played.
export function formatRecord(won: number, played: number): string {
  return `${won}/${played}`;
}
