import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from '@/lib/icons';

// Shown split into its parts when the typed code is too short to illustrate the rule.
const EXAMPLE_TEAM_CODE = '41504';
const TEAM_CODE_LENGTH = 5;

interface TeamCodeRulesProps {
  teamCode: string;
}

// The ⓘ beside "Team code": XX region, yy venue, A team, using the code being typed.
export const TeamCodeRules = ({ teamCode }: TeamCodeRulesProps) => {
  const { t } = useTranslation();
  const typed = teamCode.trim().toUpperCase();
  const code = typed.length === TEAM_CODE_LENGTH ? typed : EXAMPLE_TEAM_CODE;
  const parts = [
    { value: code.slice(0, 2), label: t('teams.codeRules.region') },
    { value: code.slice(2, 4), label: t('teams.codeRules.venue') },
    { value: code.slice(4), label: t('teams.codeRules.team') },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={t('teams.codeRules.open')}>
          <Info aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-80 flex-col gap-3 text-sm">
        <p className="font-semibold">{t('teams.codeRules.title')}</p>
        <div className="grid grid-cols-3 gap-2">
          {parts.map((part) => (
            <div
              key={part.label}
              className="flex flex-col items-center gap-1 rounded-tile bg-sunken p-2"
            >
              <span className="font-mono text-base font-semibold">{part.value}</span>
              <span className="text-xs text-muted-foreground">{part.label}</span>
            </div>
          ))}
        </div>
        <p>{t('teams.codeRules.regionBody')}</p>
        <p>{t('teams.codeRules.venueBody')}</p>
        <p>{t('teams.codeRules.teamBody')}</p>
        <p className="text-muted-foreground">{t('teams.codeRules.capacityBody')}</p>
      </PopoverContent>
    </Popover>
  );
};
