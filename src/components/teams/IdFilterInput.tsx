import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { isEmptyOrUuid } from '@/lib/uuid';

interface IdFilterInputProps {
  label: string;
  initialValue: string;
  disabled: boolean;
  onApply: (value: string) => void;
}

// league-be has no division or venue lookup yet, so these filters take the id itself. Only a
// complete id (or none) is applied: a half-typed one would be a 400 on every keystroke.
export const IdFilterInput = ({ label, initialValue, disabled, onApply }: IdFilterInputProps) => {
  const { t } = useTranslation();
  const hintId = useId();
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();
  const isInvalid = !isEmptyOrUuid(trimmed);

  const handleChange = (next: string) => {
    setValue(next);

    const nextTrimmed = next.trim();
    if (isEmptyOrUuid(nextTrimmed)) {
      onApply(nextTrimmed);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Input
        value={value}
        disabled={disabled}
        placeholder={label}
        aria-label={label}
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? hintId : undefined}
        onChange={(event) => {
          handleChange(event.target.value);
        }}
      />
      {isInvalid && (
        <p id={hintId} className="text-xs text-destructive">
          {t('teams.filters.invalidId')}
        </p>
      )}
    </div>
  );
};
