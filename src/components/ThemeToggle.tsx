import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun } from '@/lib/icons';

const ORDER = ['system', 'light', 'dark'] as const;

type ThemeChoice = (typeof ORDER)[number];

const ICON = { system: Monitor, light: Sun, dark: Moon } as const;

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return value !== undefined && (ORDER as readonly string[]).includes(value);
}

function nextTheme(current: string | undefined): ThemeChoice {
  const index = isThemeChoice(current) ? ORDER.indexOf(current) : 0;

  return ORDER[(index + 1) % ORDER.length] ?? 'system';
}

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const choice: ThemeChoice = isThemeChoice(theme) ? theme : 'system';
  const Icon = ICON[choice];

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="size-11"
      aria-label={`${t('common.theme.toggle')}: ${t(`common.theme.${choice}`)}`}
      onClick={() => {
        setTheme(nextTheme(theme));
      }}
    >
      <Icon className="size-5" aria-hidden />
    </Button>
  );
}
