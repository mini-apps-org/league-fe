import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { i18next } from '@/i18n';
import { renderWithProviders } from '@/test/render';
import type { TeamMatchStatus } from '@/types/league';

import { StatusBadge } from './StatusBadge';

const STATUSES: readonly TeamMatchStatus[] = ['scheduled', 'in_progress', 'submitted'];

describe('StatusBadge', () => {
  it.each(STATUSES)('labels the %s status', (status) => {
    renderWithProviders(<StatusBadge status={status} />);

    expect(screen.getByText(i18next.t(`matchStatus.${status}`))).toBeInTheDocument();
  });
});
