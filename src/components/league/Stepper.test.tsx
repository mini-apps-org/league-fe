import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { i18next } from '@/i18n';
import { renderWithProviders } from '@/test/render';

import { Stepper } from './Stepper';

const LABEL = 'Le Thi Hong';

function increaseButton(): HTMLElement {
  return screen.getByRole('button', { name: i18next.t('result.increase', { field: LABEL }) });
}

function decreaseButton(): HTMLElement {
  return screen.getByRole('button', { name: i18next.t('result.decrease', { field: LABEL }) });
}

describe('Stepper', () => {
  it('disables plus at the race and minus at zero', () => {
    renderWithProviders(<Stepper label={LABEL} value={0} max={0} onChange={vi.fn()} />);

    expect(increaseButton()).toBeDisabled();
    expect(decreaseButton()).toBeDisabled();
  });

  it('steps the value by one in each direction', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <Stepper label={LABEL} value={3} max={4} onChange={onChange} />,
    );

    await user.click(increaseButton());
    await user.click(decreaseButton());

    expect(onChange).toHaveBeenNthCalledWith(1, 4);
    expect(onChange).toHaveBeenNthCalledWith(2, 2);
  });

  it('labels the number input with the player name', () => {
    renderWithProviders(<Stepper label={LABEL} value={3} max={4} onChange={vi.fn()} />);

    expect(screen.getByRole('spinbutton', { name: LABEL })).toHaveValue(3);
  });
});
