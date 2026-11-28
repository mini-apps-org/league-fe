import type { Control, FieldPathByValue, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { DivisionSelect } from '@/components/teams/DivisionSelect';
import { TeamFieldError } from '@/components/teams/TeamFieldError';
import { VenueSelect } from '@/components/teams/VenueSelect';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface TeamLookupFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPathByValue<T, string>;
  lookup: 'division' | 'venue';
  label: string;
  description?: string;
  // Adds an option that clears the field, such as "No venue" on an optional venue.
  noneLabel?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

// A Teams form field that picks a division or a venue by name. Until league-be lists them,
// a failed lookup falls back to typing the ID, which the form's schema still validates.
export const TeamLookupField = <T extends FieldValues>({
  control,
  name,
  lookup,
  label,
  description,
  noneLabel,
  isRequired = false,
  isDisabled = false,
}: TeamLookupFieldProps<T>) => {
  const { t } = useTranslation();
  const Picker = lookup === 'division' ? DivisionSelect : VenueSelect;
  const fallbackPlaceholder =
    lookup === 'division' ? t('teams.filters.divisionId') : t('teams.filters.venueId');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={name}>
              {label}
              {isRequired && <span aria-hidden>{' *'}</span>}
            </FieldLabel>
            <Picker
              id={name}
              ref={field.ref}
              value={field.value}
              noneLabel={noneLabel}
              isRequired={isRequired}
              isDisabled={isDisabled}
              isInvalid={fieldState.invalid}
              fallback={
                <Input
                  {...field}
                  id={name}
                  disabled={isDisabled}
                  placeholder={fallbackPlaceholder}
                  aria-invalid={fieldState.invalid}
                  aria-required={isRequired}
                />
              }
              onValueChange={field.onChange}
            />
            {description !== undefined && <FieldDescription>{description}</FieldDescription>}
            <TeamFieldError error={fieldState.error} />
          </Field>
        );
      }}
    />
  );
};
