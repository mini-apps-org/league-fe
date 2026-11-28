import { screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Input } from '@/components/ui/input';
import { i18next } from '@/i18n';
import type { LookupGroup } from '@/lib/lookups';
import { renderWithProviders } from '@/test/render';

import { LookupSelect } from './LookupSelect';

const GROUPS: LookupGroup[] = [
  {
    id: 'session-fall',
    label: 'Fall 2026',
    options: [
      { value: 'division-8-ball', label: '8-Ball Open' },
      { value: 'division-9-ball', label: '9-Ball Masters' },
    ],
  },
  {
    id: 'session-spring',
    label: 'Spring 2026',
    options: [{ value: 'division-spring', label: 'Spring 8-Ball' }],
  },
];

const FALLBACK_LABEL = i18next.t('teams.filters.divisionId');

const renderLookupSelect = (props: Partial<ComponentProps<typeof LookupSelect>> = {}) => {
  const onValueChange = vi.fn<(value: string) => void>();
  const rendered = renderWithProviders(
    <LookupSelect
      value=""
      groups={GROUPS}
      status="success"
      placeholder={i18next.t('teams.lookup.divisionPlaceholder')}
      emptyLabel={i18next.t('teams.lookup.noDivisions')}
      ariaLabel={i18next.t('teams.lookup.division')}
      fallback={<Input aria-label={FALLBACK_LABEL} />}
      onValueChange={onValueChange}
      {...props}
    />,
  );

  return { ...rendered, onValueChange };
};

const getTrigger = (): HTMLElement => {
  return screen.getByRole('combobox', { name: i18next.t('teams.lookup.division') });
};

describe('LookupSelect', () => {
  it('shows a loading placeholder and stays disabled while the list is pending', () => {
    renderLookupSelect({ status: 'pending', groups: [] });

    expect(getTrigger()).toBeDisabled();
    expect(getTrigger()).toHaveTextContent(i18next.t('common.loading'));
  });

  it('renders the fallback instead of a select when the list fails to load', () => {
    renderLookupSelect({ status: 'error', groups: [] });

    expect(screen.getByRole('textbox', { name: FALLBACK_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows the empty label and stays disabled when there is nothing to pick', () => {
    renderLookupSelect({ groups: [{ id: 'empty', options: [] }] });

    expect(getTrigger()).toBeDisabled();
    expect(getTrigger()).toHaveTextContent(i18next.t('teams.lookup.noDivisions'));
  });

  it('lists the options under their group headings and reports the one picked', async () => {
    const { user, onValueChange } = renderLookupSelect();

    expect(getTrigger()).toHaveTextContent(i18next.t('teams.lookup.divisionPlaceholder'));
    await user.click(getTrigger());

    const fall = screen.getByRole('group', { name: 'Fall 2026' });
    expect(fall).toHaveTextContent('8-Ball Open');
    expect(fall).toHaveTextContent('9-Ball Masters');
    expect(screen.getByRole('group', { name: 'Spring 2026' })).toHaveTextContent('Spring 8-Ball');

    await user.click(screen.getByRole('option', { name: '9-Ball Masters' }));

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('division-9-ball');
  });

  it('shows the chosen option in the trigger', () => {
    renderLookupSelect({ value: 'division-spring' });

    expect(getTrigger()).toHaveTextContent('Spring 8-Ball');
  });

  it('shows the none option for an empty value and reports it back as an empty value', async () => {
    const noneLabel = i18next.t('teams.lookup.allDivisions');
    const { user, onValueChange } = renderLookupSelect({ value: 'division-8-ball', noneLabel });

    await user.click(getTrigger());
    await user.click(screen.getByRole('option', { name: noneLabel }));

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('');
  });

  it('selects the none option when the value is empty', () => {
    const noneLabel = i18next.t('teams.lookup.allDivisions');
    renderLookupSelect({ noneLabel });

    expect(getTrigger()).toHaveTextContent(noneLabel);
  });

  it('stays disabled when the caller disables it, even with options to pick', () => {
    renderLookupSelect({ value: 'division-8-ball', isDisabled: true });

    expect(getTrigger()).toBeDisabled();
    expect(getTrigger()).toHaveTextContent('8-Ball Open');
  });

  // Two sessions can share a name, so a group's label is not a safe React key.
  it('renders two groups that share a label without a duplicate key', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {
      return undefined;
    });
    const { user } = renderLookupSelect({
      groups: [
        { id: 'session-1', label: 'Fall 2026', options: [{ value: 'a', label: '8-Ball Open' }] },
        { id: 'session-2', label: 'Fall 2026', options: [{ value: 'b', label: '9-Ball Open' }] },
      ],
    });

    await user.click(getTrigger());

    const groups = screen.getAllByRole('group', { name: 'Fall 2026' });
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveTextContent('8-Ball Open');
    expect(groups[1]).toHaveTextContent('9-Ball Open');
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('shows the fallback for a value the list does not contain', () => {
    renderLookupSelect({ value: 'division-not-listed' });

    expect(screen.getByRole('textbox', { name: FALLBACK_LABEL })).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  // The list may simply not have arrived yet, so a value is only "not listed" once it has.
  it('keeps the select while the list is pending, even for a value it will not contain', () => {
    renderLookupSelect({ status: 'pending', groups: [], value: 'division-not-listed' });

    expect(getTrigger()).toHaveTextContent(i18next.t('common.loading'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('marks the trigger as required when the field is required', () => {
    renderLookupSelect({ isRequired: true });

    expect(getTrigger()).toBeRequired();
  });

  // A form moves focus to its first invalid field through this ref.
  it('forwards the ref to the trigger, so it can be focused', () => {
    const ref = createRef<HTMLButtonElement>();
    renderLookupSelect({ ref });

    expect(ref.current).toBe(getTrigger());
    ref.current?.focus();
    expect(getTrigger()).toHaveFocus();
  });
});
