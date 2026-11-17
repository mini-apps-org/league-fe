import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from '@/lib/icons';

interface StepperProps {
  label: string;
  value: number;
  max?: number;
  onChange: (value: number) => void;
}

const MIN = 0;

// The most-touched control in the app: 48px buttons either side of a real number input, so a
// captain can type as well as tap. `max` is the player's race for games, and absent for
// innings and defensive shots, which are uncapped.
export function Stepper({ label, value, max, onChange }: StepperProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const ceiling = max ?? Number.MAX_SAFE_INTEGER;

  const handleChange = (next: number): void => {
    if (Number.isNaN(next)) {
      return;
    }

    onChange(Math.min(Math.max(next, MIN), ceiling));
  };

  return (
    <div className="flex min-h-17 items-center gap-3 py-1.5 pr-3 pl-4">
      <label htmlFor={inputId} className="min-w-0 flex-1 truncate font-medium">
        {label}
      </label>

      <Button
        variant="outline"
        size="icon-touch"
        aria-label={t('result.decrease', { field: label })}
        disabled={value <= MIN}
        onClick={() => {
          handleChange(value - 1);
        }}
      >
        <Minus strokeWidth={2.5} aria-hidden />
      </Button>

      <span className="tabular flex min-w-14.5 items-baseline justify-center gap-1">
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          value={value}
          min={MIN}
          max={max}
          onChange={(event) => {
            handleChange(Number(event.target.value));
          }}
          className="tabular w-8 [appearance:textfield] bg-transparent text-center text-2xl font-bold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {max !== undefined && (
          <span className="text-sm text-muted-foreground">{t('result.ofRace', { race: max })}</span>
        )}
      </span>

      <Button
        variant="outline"
        size="icon-touch"
        aria-label={t('result.increase', { field: label })}
        disabled={value >= ceiling}
        onClick={() => {
          handleChange(value + 1);
        }}
      >
        <Plus strokeWidth={2.5} aria-hidden />
      </Button>
    </div>
  );
}
