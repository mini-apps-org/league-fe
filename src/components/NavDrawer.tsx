import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppNav } from '@/components/AppNav';
import { HeaderMark } from '@/components/HeaderMark';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Menu } from '@/lib/icons';

export const NavDrawer = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="-ml-2.5 size-11 lg:hidden"
          aria-label={t('nav.openMenu')}
        >
          <Menu className="size-5.5" aria-hidden />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="gap-2 px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <div className="flex items-center gap-2.5 px-2 pt-1 pb-4">
          <HeaderMark tone="ink" />
          <div className="flex flex-col">
            <DrawerTitle className="text-[15px] font-semibold">{t('app.name')}</DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              {t('nav.adminConsole')}
            </DrawerDescription>
          </div>
        </div>
        <AppNav
          onNavigate={() => {
            setOpen(false);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
};
