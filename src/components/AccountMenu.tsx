import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

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
import { type Locale, setLocale } from '@/i18n';
import { ROUTES } from '@/utils';

const ITEM_CLASS = 'min-h-11 rounded-[10px] px-3 text-[15px] font-medium';

export const AccountMenu = () => {
  const { t, i18n } = useTranslation();
  const { data } = useMe();
  const { mutate: signOut, isPending } = useLogout();

  const user = data?.user;
  const locale: Locale = i18n.language === 'vi' ? 'vi' : 'en';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="size-11" aria-label={t('auth.account')}>
          <UserAvatar user={user} className="size-8" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-66 rounded-card p-2">
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-3 pt-2.5 pb-3 font-normal">
          <span className="truncate text-[15px] font-semibold text-foreground">{user?.name}</span>
          <span className="truncate text-[13px] text-muted-foreground">{user?.email}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-0 mt-0 mb-2" />

        <DropdownMenuItem asChild className={ITEM_CLASS}>
          <Link to={ROUTES.PROFILE}>{t('nav.myProfile')}</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className={ITEM_CLASS}>
          <Link to={ROUTES.STANDINGS}>{t('nav.standings')}</Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={`${ITEM_CLASS} justify-between gap-2`}
          onSelect={() => {
            setLocale(locale === 'en' ? 'vi' : 'en');
          }}
        >
          <span>{t('common.language.label')}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {t(`common.language.${locale}`)}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className={ITEM_CLASS}
          disabled={isPending}
          onSelect={() => {
            signOut();
          }}
        >
          {isPending ? t('auth.signingOut') : t('auth.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
