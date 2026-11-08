import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENDPOINTS } from '@/api/endpoints';
import { i18next } from '@/i18n';
import { apiError, apiUrl, envelope, UNLINKED_USER } from '@/test/handlers';
import { renderRoutes } from '@/test/render';
import { server } from '@/test/server';
import { ERROR_CODE } from '@/types/errors';
import type { MemberPreview } from '@/types/league';

import { OnboardingPage } from './OnboardingPage';

const PREVIEW: MemberPreview = {
  playerId: 'player-9',
  displayName: 'Minh Pham',
  skillLevel: 5,
  teamId: 'team-1',
  teamNumber: '101',
  teamName: 'Corner Pocket',
  isCaptain: false,
  alreadyLinked: false,
  linkedToMe: false,
};

function servePreview(preview: MemberPreview): void {
  server.use(
    http.get(apiUrl(ENDPOINTS.MEMBERS_PREVIEW), () => {
      return envelope(preview);
    }),
  );
}

function renderOnboarding() {
  server.use(
    http.get(apiUrl(ENDPOINTS.ME), () => {
      return envelope({ user: UNLINKED_USER });
    }),
  );

  return renderRoutes(
    [
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/', element: <p>home screen</p> },
    ],
    { route: '/onboarding' },
  );
}

function memberIdInput(): HTMLElement {
  return screen.getByLabelText(i18next.t('link.memberId'));
}

function confirmButton(): HTMLElement {
  return screen.getByRole('button', { name: i18next.t('link.confirm') });
}

describe('OnboardingPage', () => {
  it('looks the member up once a full id is typed, and links on confirm', async () => {
    servePreview(PREVIEW);
    let linkedId: unknown = null;
    server.use(
      http.post(apiUrl(ENDPOINTS.ME_LINK), async ({ request }) => {
        linkedId = ((await request.json()) as { memberId: string }).memberId;

        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { user } = renderOnboarding();

    await user.type(memberIdInput(), '9500 7620');

    expect(await screen.findByText(PREVIEW.displayName)).toBeInTheDocument();

    await user.click(confirmButton());

    expect(await screen.findByText('home screen')).toBeInTheDocument();
    expect(linkedId).toBe('95007620');
  });

  it('keeps confirm disabled when the member belongs to another account', async () => {
    servePreview({ ...PREVIEW, alreadyLinked: true, linkedToMe: false });

    const { user } = renderOnboarding();

    await user.type(memberIdInput(), '95007620');
    await screen.findByText(PREVIEW.displayName);

    expect(confirmButton()).toBeDisabled();
  });

  it('shows the localised error for an unknown member id and moves focus to it', async () => {
    server.use(
      http.get(apiUrl(ENDPOINTS.MEMBERS_PREVIEW), () => {
        return apiError(400, ERROR_CODE.MEMBER_NOT_FOUND);
      }),
    );

    const { user } = renderOnboarding();

    await user.type(memberIdInput(), '95007620');

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent(i18next.t(`apiError.${ERROR_CODE.MEMBER_NOT_FOUND}`));
    await waitFor(() => {
      expect(alert).toHaveFocus();
    });
    expect(confirmButton()).toBeDisabled();
  });
});
