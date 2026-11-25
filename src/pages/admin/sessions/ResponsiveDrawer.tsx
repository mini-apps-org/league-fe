import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { X } from '@/lib/icons';

// The sidebar's breakpoint: with room for a side panel, the sheet slides in from the right.
const DESKTOP_QUERY = '(min-width: 1024px)';

interface ResponsiveDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  // The body and its footer, so a form can wrap both.
  children: ReactNode;
}

export const ResponsiveDrawer = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}: ResponsiveDrawerProps) => {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    // handleOnly: vaul otherwise treats a press anywhere in the panel as the start of a drag,
    // which swallows the press that opens a native date picker. The stock drawer renders no
    // vaul Handle, so swipe-to-close is off; Cancel, the close button, Esc and the overlay close it.
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isDesktop ? 'right' : 'bottom'}
      handleOnly
    >
      <DrawerContent className="data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-110">
        <DrawerHeader className="flex-row items-start gap-3 border-b text-left md:text-left">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label={t('admin.sessions.form.close')}>
              <X aria-hidden />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
};
