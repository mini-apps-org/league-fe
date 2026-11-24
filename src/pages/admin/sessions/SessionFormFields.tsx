import { useId } from 'react';
import { Controller, type FieldError as FormFieldError, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Info } from '@/lib/icons';
import { SESSION_STATUSES, SESSION_TYPES } from '@/lib/session-filters';
import {
  isSessionFormError,
  type SessionFormOutput,
  type SessionFormValues,
} from '@/lib/session-form';

type TextFieldName = 'name' | 'seasonYear' | 'startsOn' | 'endsOn';

interface TextFieldConfig {
  name: TextFieldName;
  label: string;
  type?: 'text' | 'date';
  placeholder?: string;
  hint?: string;
}

interface SessionFormFieldsProps {
  // The other session that is active now, if any: turning this one on deactivates it.
  otherActiveSessionName?: string;
}

export const SessionFormFields = ({ otherActiveSessionName }: SessionFormFieldsProps) => {
  const { t } = useTranslation();
  const id = useId();
  const form = useFormContext<SessionFormValues, unknown, SessionFormOutput>();

  const fieldId = (name: keyof SessionFormValues): string => {
    return `${id}-${name}`;
  };

  const required = (
    <span aria-hidden className="text-destructive">
      *
    </span>
  );

  const renderError = (error: FormFieldError | undefined) => {
    const message = error?.message;
    if (!isSessionFormError(message)) {
      return null;
    }

    return (
      <FieldError className="flex items-center gap-1.5">
        <Info className="size-3.5 shrink-0" aria-hidden />
        {t(`admin.sessions.form.errors.${message}`)}
      </FieldError>
    );
  };

  const renderTextField = ({ name, label, type = 'text', placeholder, hint }: TextFieldConfig) => {
    return (
      <Controller
        name={name}
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={fieldId(name)}>
                {label} {required}
              </FieldLabel>
              <Input
                {...field}
                id={fieldId(name)}
                type={type}
                placeholder={placeholder}
                inputMode={name === 'seasonYear' ? 'numeric' : undefined}
                className={type === 'date' || name === 'seasonYear' ? 'tabular' : undefined}
                aria-invalid={fieldState.invalid}
                aria-required
              />
              {!fieldState.invalid && hint !== undefined && (
                <FieldDescription>{hint}</FieldDescription>
              )}
              {renderError(fieldState.error)}
            </Field>
          );
        }}
      />
    );
  };

  return (
    <FieldGroup>
      {renderTextField({
        name: 'name',
        label: t('admin.sessions.form.name'),
        placeholder: t('admin.sessions.form.namePlaceholder'),
        hint: t('admin.sessions.form.nameHint'),
      })}

      <Controller
        name="sessionType"
        control={form.control}
        render={({ field, fieldState }) => {
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldTitle id={fieldId('sessionType')}>
                {t('admin.sessions.form.type')} {required}
              </FieldTitle>
              <ToggleGroup
                type="single"
                variant="outline"
                className="w-full"
                aria-labelledby={fieldId('sessionType')}
                value={field.value ?? ''}
                onValueChange={(value) => {
                  const sessionType = SESSION_TYPES.find((type) => type === value);
                  if (sessionType) {
                    field.onChange(sessionType);
                  }
                }}
              >
                {SESSION_TYPES.map((type) => (
                  <ToggleGroupItem
                    key={type}
                    value={type}
                    className="flex-1 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                  >
                    {t(`admin.sessions.type.${type}`)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {renderError(fieldState.error)}
            </Field>
          );
        }}
      />

      {renderTextField({
        name: 'seasonYear',
        label: t('admin.sessions.form.year'),
        placeholder: t('admin.sessions.form.yearPlaceholder'),
      })}

      <div className="grid grid-cols-2 gap-3">
        {renderTextField({
          name: 'startsOn',
          label: t('admin.sessions.form.startsOn'),
          type: 'date',
        })}
        {renderTextField({ name: 'endsOn', label: t('admin.sessions.form.endsOn'), type: 'date' })}
      </div>

      <Controller
        name="status"
        control={form.control}
        render={({ field }) => {
          return (
            <Field>
              <FieldLabel htmlFor={fieldId('status')}>{t('admin.sessions.form.status')}</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={(value) => {
                  const status = SESSION_STATUSES.find((candidate) => candidate === value);
                  if (status) {
                    field.onChange(status);
                  }
                }}
              >
                <SelectTrigger id={fieldId('status')} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`admin.sessions.status.${status}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          );
        }}
      />

      <Controller
        name="isActive"
        control={form.control}
        render={({ field }) => {
          return (
            <Field orientation="horizontal" className="rounded-lg border p-3.5">
              <FieldContent>
                <FieldLabel htmlFor={fieldId('isActive')}>
                  {t('admin.sessions.form.isActive')}
                </FieldLabel>
                <FieldDescription>
                  {t('admin.sessions.form.isActiveHelp')}
                  {field.value && otherActiveSessionName !== undefined && (
                    <span className="font-medium text-highlight-foreground">
                      {' '}
                      {t('admin.sessions.form.replacesActive', { name: otherActiveSessionName })}
                    </span>
                  )}
                </FieldDescription>
              </FieldContent>
              <Switch
                id={fieldId('isActive')}
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          );
        }}
      />
    </FieldGroup>
  );
};
