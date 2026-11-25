import type { ReactNode } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { TeamFieldError } from '@/components/teams/TeamFieldError';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface TeamTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  placeholder?: string;
  isRequired?: boolean;
  // Sits beside the label, such as the team code rules' ⓘ.
  labelAddon?: ReactNode;
}

export const TeamTextField = <T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  isRequired = false,
  labelAddon,
}: TeamTextFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <Field data-invalid={fieldState.invalid}>
            <span className="flex items-center gap-1">
              <FieldLabel htmlFor={name}>
                {label}
                {isRequired && <span aria-hidden>{' *'}</span>}
              </FieldLabel>
              {labelAddon}
            </span>
            <Input
              {...field}
              id={name}
              placeholder={placeholder}
              aria-invalid={fieldState.invalid}
              aria-required={isRequired}
            />
            {description !== undefined && <FieldDescription>{description}</FieldDescription>}
            <TeamFieldError error={fieldState.error} />
          </Field>
        );
      }}
    />
  );
};
