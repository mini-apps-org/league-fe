import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import MemberPreviewCard from '@/components/auth/MemberPreviewCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useLinkMember, useMemberPreview } from '@/hooks/useMemberLink';
import { useLogout, useMe } from '@/hooks/useMe';
import { messageFor } from '@/lib/errors';
import { isCompleteMemberId, MEMBER_ID_LENGTH, normalizeMemberId } from '@/lib/member-id';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const me = useMe();
  const { mutate: signOut, isPending: isSigningOut } = useLogout();

  const [memberId, setMemberId] = useState('');
  // Fires on blur or once the id looks complete; per-keystroke would request half-typed ids.
  const [lookupId, setLookupId] = useState('');

  const preview = useMemberPreview(lookupId);
  const linkMember = useLinkMember();

  const errorRef = useRef<HTMLParagraphElement>(null);
  const error = preview.error ?? linkMember.error;
  const errorMessage = error === null || error === undefined ? null : messageFor(error);

  // Focus follows the error, so a keyboard user is taken to what went wrong.
  useEffect(() => {
    if (errorMessage !== null) {
      errorRef.current?.focus();
    }
  }, [errorMessage]);

  const isTaken =
    preview.data !== undefined && preview.data.alreadyLinked && !preview.data.linkedToMe;
  const canConfirm = preview.data !== undefined && !isTaken && !linkMember.isPending;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 p-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{t('link.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('link.signedInAs', { email: me.data?.user.email ?? '' })}
        </p>
      </header>

      <div className="space-y-2">
        <label htmlFor="member-id" className="block text-sm font-medium">
          {t('link.memberId')}
        </label>
        <Input
          id="member-id"
          value={memberId}
          inputMode="numeric"
          autoComplete="off"
          maxLength={MEMBER_ID_LENGTH}
          aria-describedby={errorMessage === null ? 'member-id-help' : 'member-id-error'}
          aria-invalid={errorMessage !== null}
          className="h-11 text-lg"
          onChange={(event) => {
            const next = normalizeMemberId(event.target.value);
            setMemberId(next);

            if (isCompleteMemberId(next)) {
              setLookupId(next);
            }
          }}
          onBlur={() => {
            setLookupId(memberId);
          }}
        />

        {errorMessage === null ? (
          <p id="member-id-help" className="text-xs text-muted-foreground">
            {t('link.memberIdHelp')}
          </p>
        ) : (
          <p
            id="member-id-error"
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className="text-sm text-warn"
          >
            {errorMessage}
          </p>
        )}
      </div>

      {preview.isFetching && <Skeleton className="h-20 w-full rounded-card" />}

      {!preview.isFetching && preview.data !== undefined && (
        <MemberPreviewCard preview={preview.data} />
      )}

      <div className="mt-auto space-y-3">
        <Button
          className="h-12 w-full"
          disabled={!canConfirm}
          onClick={() => {
            if (preview.data === undefined) {
              return;
            }

            linkMember.mutate(lookupId, {
              onSuccess: () => {
                void navigate('/', { replace: true });
              },
            });
          }}
        >
          {t('link.confirm')}
        </Button>

        {/* The way out of a wrong Google account. */}
        <Button
          variant="ghost"
          className="h-11 w-full"
          disabled={isSigningOut}
          onClick={() => {
            signOut();
          }}
        >
          {t('link.wrongAccount')}
        </Button>
      </div>
    </main>
  );
}
