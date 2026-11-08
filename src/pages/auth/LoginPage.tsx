import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import { AppMark } from '@/components/auth/AppMark';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { LegalLine } from '@/components/auth/LegalLine';
import { useLoginError } from '@/hooks/useLoginError';
import { useMe } from '@/hooks/useMe';
import { Check } from '@/lib/icons';

const BRAND_POINTS = [
  'auth.brandPointPutUp',
  'auth.brandPointResults',
  'auth.brandPointSubmit',
] as const;

export function LoginPage() {
  const { t } = useTranslation();
  const loginError = useLoginError();
  const me = useMe();

  // No skeleton while the check runs: signed-out is the common case here.
  if (me.isSuccess) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* Desktop only: on a phone this would push the button — the only thing anyone came
          here to tap — below the fold. */}
      <aside className="hidden flex-col justify-between bg-accent p-10 lg:flex">
        <AppMark className="size-14 text-2xl" />

        {/* `accent` text on this background is 3.93:1 — fine for the large headline, under
            4.5:1 for the 16px points. Body copy uses `foreground`; the accent is in the checks. */}
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
        {/* Mobile: centred above the button. Desktop: a 400px card, so the two columns read
            as one composition. */}
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

          <GoogleSignInButton />
          <LegalLine />
        </div>
      </div>
    </main>
  );
}
