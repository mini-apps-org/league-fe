import type { ReactNode } from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/useMobile';

interface ResponsiveDrawerProps {
  title: string;
  description?: string;
  // While a request is in flight the drawer stays open: closing would hide its outcome.
  isBusy?: boolean;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}

// A right panel on desktop and a bottom sheet on phones, as the Teams screens draw them. The
// caller mounts it only while it is open, so its form state starts fresh every time.
export const ResponsiveDrawer = ({
  title,
  description,
  isBusy = false,
  children,
  footer,
  onClose,
}: ResponsiveDrawerProps) => {
  const isMobile = useIsMobile();

  const handleOpenChange = (open: boolean) => {
    if (!open && !isBusy) {
      onClose();
    }
  };

  return (
    <Drawer open direction={isMobile ? 'bottom' : 'right'} onOpenChange={handleOpenChange}>
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description !== undefined && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-2">{children}</div>
        <DrawerFooter className="md:flex-row md:justify-end">{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
