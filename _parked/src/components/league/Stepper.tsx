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

// The most-touched control in the app: 44px buttons either side of a real number input, so a
// captain can type as well as tap. `max` is the player's race for games, and absent for
// innings and defensive shots, which are uncapped.
export default function Stepper({ label, value, max, onChange }: StepperProps) {
  const { t } = useTranslation();
  const ceiling = max ?? Number.MAX_SAFE_INTEGER;

  const clamp = (next: number): void => {
    if (Number.isNaN(next)) {
      return;
    }

    onChange(Math.min(Math.max(next, MIN), ceiling));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-lg"
        className="size-11 rounded-lg"
        aria-label={t('result.decrease', { field: label })}
        disabled={value <= MIN}
        onClick={() => {
          clamp(value - 1);
        }}
      >
        <Minus className="size-5" aria-hidden />
      </Button>

      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={MIN}
        max={max}
        onChange={(event) => {
          clamp(Number(event.target.value));
        }}
        className="tabular h-11 w-14 rounded-lg border border-input-line bg-card text-center text-xl font-semibold"
      />

      {max !== undefined && (
        <span className="tabular text-sm text-muted-foreground">
          {t('result.ofRace', { race: max })}
        </span>
      )}

      <Button
        variant="outline"
        size="icon-lg"
        className="size-11 rounded-lg"
        aria-label={t('result.increase', { field: label })}
        disabled={value >= ceiling}
        onClick={() => {
          clamp(value + 1);
        }}
      >
        <Plus className="size-5" aria-hidden />
      </Button>
    </div>
  );
}
