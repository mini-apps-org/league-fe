import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthAPI } from '@/api/authAPI';
import { GoogleMark } from '@/components/auth/GoogleMark';
import { LoaderCircle } from '@/lib/icons';

// An <a>, never a <button>: XHR cannot follow league-be's cross-origin 302 to Google, and
// the user must see Google's origin in the address bar. The pending state is cosmetic — the
// page is already leaving — so it must not preventDefault.
export function GoogleSignInButton() {
  const { t } = useTranslation();
  const [isLeaving, setIsLeaving] = useState(false);

  return (
    <a
      href={AuthAPI.getGoogleSignInURL()}
      onClick={() => {
        setIsLeaving(true);
      }}
      aria-disabled={isLeaving}
      className="flex h-14 w-full items-center justify-center gap-3 rounded-[14px] border border-input-line bg-card text-base font-medium text-foreground"
    >
      {isLeaving ? (
        <LoaderCircle className="size-5 animate-spin" aria-hidden />
      ) : (
        <GoogleMark className="size-5" />
      )}
      {isLeaving ? t('auth.signingIn') : t('auth.continueWithGoogle')}
    </a>
  );
}
