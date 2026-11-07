import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import GoogleMark from '@/components/auth/GoogleMark';
import { AuthAPI } from '@/api/authAPI';
import { LoaderCircle } from '@/lib/icons';
import { rememberNextPath } from '@/lib/next-path';

// An <a>, never a <button onClick>: sign-in is a full-page navigation to league-be's 302, and
// XHR cannot follow a cross-origin redirect to Google — the user also has to see Google's own
// origin in the address bar.
//
// The pending state is therefore cosmetic: the page is already leaving, so it exists only to
// stop a second tap looking unresponsive. It must not preventDefault.
export default function GoogleSignInButton({ nextPath }: { nextPath?: string }) {
  const { t } = useTranslation();
  const [isLeaving, setIsLeaving] = useState(false);

  return (
    <a
      href={AuthAPI.getGoogleSignInURL()}
      onClick={() => {
        // Stored here, in the handler, because the navigation that follows destroys the SPA
        // and takes any React state with it.
        rememberNextPath(nextPath);
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
