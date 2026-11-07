import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggle from '@/components/ThemeToggle';
import { useLogout, useMe } from '@/hooks/useMe';

export default function AppHeader() {
  const { t } = useTranslation();
  const { data } = useMe();
  const { mutate: signOut, isPending } = useLogout();

  const user = data?.user;
  const initial = user?.name.slice(0, 1).toUpperCase() ?? '?';

  return (
    <header
      className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-2 px-4 lg:max-w-6xl lg:px-6">
        <Link to="/" className="truncate text-base font-semibold tracking-tight">
          {t('app.name')}
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Icon-only, so it needs an aria-label; size-11 overrides the 36px Nova
                primitive to clear the 44px touch target. */}
              <Button
                variant="ghost"
                size="icon-lg"
                className="size-11"
                aria-label={t('auth.account')}
              >
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatarUrl || undefined} alt="" />
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
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
