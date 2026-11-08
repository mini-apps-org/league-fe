import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/UserAvatar';
import { useLogout, useMe } from '@/hooks/useMe';

export function AppHeader() {
  const { t } = useTranslation();
  const { data } = useMe();
  const { mutate: signOut, isPending } = useLogout();

  const user = data?.user;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-2 px-4 lg:max-w-6xl lg:px-6">
        <Link to="/" className="truncate text-base font-semibold tracking-tight">
          {t('app.name')}
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="size-11"
                aria-label={t('auth.account')}
              >
                <UserAvatar user={user} className="size-8" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate text-sm font-medium">{user?.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={isPending}
                onSelect={() => {
                  signOut();
                }}
              >
                {isPending ? t('auth.signingOut') : t('auth.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
