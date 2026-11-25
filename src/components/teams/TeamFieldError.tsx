import type { FieldError as FormFieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FieldError } from '@/components/ui/field';
import { isTeamFormError } from '@/lib/team-schema';

interface TeamFieldErrorProps {
  error: FormFieldError | undefined;
}

// Translates a Teams form's Zod message id where it is shown.
export const TeamFieldError = ({ error }: TeamFieldErrorProps) => {
  const { t } = useTranslation();
  const message = error?.message;

  if (!isTeamFormError(message)) {
    return null;
  }

  return <FieldError>{t(`teams.form.errors.${message}`)}</FieldError>;
};
