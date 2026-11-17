import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { i18next } from '@/i18n';
import { ApiRequestError } from '@/lib/errors';
import { renderWithProviders } from '@/test/render';
import { ERROR_CODE } from '@/types/errors';

import { ErrorBanner } from './ErrorBanner';

const ERROR = new ApiRequestError(404, ERROR_CODE.MEMBER_NOT_FOUND, 'raw backend text');

describe('ErrorBanner', () => {
  it('shows the localised message, never the backend text', () => {
    renderWithProviders(<ErrorBanner error={ERROR} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      i18next.t(`apiError.${ERROR_CODE.MEMBER_NOT_FOUND}`),
    );
    expect(screen.queryByText('raw backend text')).not.toBeInTheDocument();
  });

  it('offers Retry only when there is something to retry', async () => {
    const onRetry = vi.fn();
    const { user, unmount } = renderWithProviders(<ErrorBanner error={ERROR} onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: i18next.t('common.retry') }));
    expect(onRetry).toHaveBeenCalledOnce();

    unmount();
    renderWithProviders(<ErrorBanner error={ERROR} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
