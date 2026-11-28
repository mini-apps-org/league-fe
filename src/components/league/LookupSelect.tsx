import type { ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LookupGroup } from '@/lib/lookups';

// Radix keeps '' for "nothing picked", so the "All divisions" / "No venue" option needs a
// value of its own; it maps back to '' on the way out.
const NONE_VALUE = '__none__';

export interface LookupSelectProps {
  id?: string;
  // On the trigger, so a form can move focus to the field when it fails validation.
  ref?: Ref<HTMLButtonElement>;
  value: string;
  // Adds an option that clears the choice, such as "All divisions" in a filter.
  noneLabel?: string;
  ariaLabel?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  // Shown instead when the list can't be loaded, or doesn't contain the current value, such as
  // an input that takes the raw ID: the user is never shown a select that hides or misstates
  // what is set.
  fallback: ReactNode;
  onValueChange: (value: string) => void;
}

interface LookupSelectBaseProps extends LookupSelectProps {
  groups: LookupGroup[];
  status: 'pending' | 'error' | 'success';
  placeholder: string;
  emptyLabel: string;
}

export const LookupSelect = ({
  id,
  ref,
  value,
  groups,
  status,
  placeholder,
  emptyLabel,
  noneLabel,
  ariaLabel,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  fallback,
  onValueChange,
}: LookupSelectBaseProps) => {
  const { t } = useTranslation();
  const hasOptions = groups.some((group) => group.options.length > 0);
  const isValueListed = groups.some((group) => {
    return group.options.some((option) => option.value === value);
  });

  // A value the list doesn't have, such as a venue it leaves out or a stale ID in the URL,
  // would show as empty in the select, so the fallback shows the raw value instead.
  if (status === 'error' || (status === 'success' && value !== '' && !isValueListed)) {
    return fallback;
  }

  const getPlaceholder = (): string => {
    if (status === 'pending') {
      return t('common.loading');
    }

    return hasOptions ? placeholder : emptyLabel;
  };

  // Radix shows the placeholder only for an empty value. While loading no option matches the
  // value yet, so passing it through would leave the trigger blank instead of saying so.
  const getSelectValue = (): string => {
    if (status === 'pending') {
      return '';
    }

    return value === '' && noneLabel !== undefined ? NONE_VALUE : value;
  };

  return (
    <Select
      value={getSelectValue()}
      disabled={isDisabled || !hasOptions}
      onValueChange={(next) => {
        onValueChange(next === NONE_VALUE ? '' : next);
      }}
    >
      <SelectTrigger
        ref={ref}
        id={id}
        className="w-full"
        aria-label={ariaLabel}
        aria-required={isRequired}
        aria-invalid={isInvalid}
      >
        <SelectValue placeholder={getPlaceholder()} />
      </SelectTrigger>
      <SelectContent>
        {noneLabel !== undefined && <SelectItem value={NONE_VALUE}>{noneLabel}</SelectItem>}
        {groups.map((group) => (
          <SelectGroup key={group.id}>
            {group.label !== undefined && <SelectLabel>{group.label}</SelectLabel>}
            {group.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};
