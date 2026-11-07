import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';

import AppMark from '@/components/auth/AppMark';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import LegalLine from '@/components/auth/LegalLine';
import { Check } from '@/lib/icons';
import { useLoginError } from '@/hooks/useLoginError';
import { useMe } from '@/hooks/useMe';
import { DEFAULT_NEXT_PATH, validateNextPath } from '@/lib/next-path';

const BRAND_POINTS = [
  'auth.brandPointPutUp',
  'auth.brandPointResults',
  'auth.brandPointSubmit',
] as const;

// Two ways a destination can arrive: router state, when RequireAuth bounced the user here,
// and a `?next=` query, when the link was shared or typed. Both are untrusted and go through
// the same validation.
function attemptedPathFrom(state: unknown, queryNext: string | null): string | undefined {
  const fromState =
    typeof state === 'object' && state !== null && 'from' in state
      ? (state as { from?: unknown }).from
      : null;

  const candidate = typeof fromState === 'string' ? fromState : queryNext;

  return validateNextPath(candidate) ?? undefined;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const loginError = useLoginError();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const me = useMe();

  const nextPath = attemptedPathFrom(location.state, searchParams.get('next'));

  // Already signed in: nothing to do here. Sent to the landing route rather than straight to
  // `nextPath`, so the link gate and the stored-path redirect both still get their say.
  //
  // The form renders while the session check is in flight, because signed-out is the
  // overwhelmingly common case for this screen and a skeleton would punish it.
  if (me.isSuccess) {
    return <Navigate to={DEFAULT_NEXT_PATH} replace />;
  }

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* Brand panel: desktop only. On a phone the same content would push the button below
          the fold, and the button is the only thing anyone came here to tap. */}
      <aside className="hidden flex-col justify-between bg-accent p-10 lg:flex">
        <AppMark className="size-14 text-2xl" />

        {/* On accentSoft, `accent` as text is 3.93:1 in light mode — fine for the 30px
            headline as large text, but under 4.5:1 for the 16px points. So the body copy
            uses `foreground` (13.1:1) and the accent is carried by the check marks. */}
        <div className="space-y-6">
          <h2 className="max-w-md text-3xl font-bold text-foreground">{t('auth.brandHeadline')}</h2>

          <ul className="space-y-3">
            {BRAND_POINTS.map((key) => {
              return (
                <li key={key} className="flex items-start gap-3 text-foreground">
                  <Check className="mt-0.5 size-5 shrink-0 text-accent-foreground" aria-hidden />
                  <span>{t(key)}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="tabular text-sm text-muted-foreground">{t('auth.brandSeason')}</p>
      </aside>

      <div className="flex min-h-dvh flex-col justify-between p-6 lg:min-h-0 lg:justify-center">
        {/* Mobile: mark and name centred in the space above the button. Desktop: a 400px
            card, so the two columns read as one composition rather than two pages. */}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center lg:mx-auto lg:w-100 lg:flex-none lg:items-stretch lg:gap-2 lg:text-left">
          <AppMark className="lg:hidden" />

          <h1 className="text-3xl font-bold lg:text-2xl">
            <span className="lg:hidden">{t('app.name')}</span>
            <span className="hidden lg:inline">{t('auth.title')}</span>
          </h1>

          <p className="text-[15px] text-muted-foreground">{t('auth.tagline')}</p>
        </div>

        <div className="mx-auto w-full space-y-3 lg:w-100 lg:pt-8">
          {loginError !== null && (
            <p
              role="alert"
              className="rounded-lg border border-warn bg-[color-mix(in_oklab,var(--warn)_12%,var(--card))] px-3 py-2 text-sm"
            >
              {loginError.message}
            </p>
          )}

          <GoogleSignInButton nextPath={nextPath} />
          <LegalLine />
        </div>
      </div>
    </main>
  );
}
