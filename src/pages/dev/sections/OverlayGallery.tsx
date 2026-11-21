import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { GallerySection } from '../GallerySection';
import {
  DRAWER_DIRECTIONS,
  type DrawerDirection,
  PRIMITIVES,
  TOAST_KINDS,
  type ToastKind,
} from '../galleryVariants';
import { VariantRow } from '../VariantRow';

const TOAST_BY_KIND: Record<ToastKind, (message: string) => void> = {
  message: (message) => {
    toast(message);
  },
  success: (message) => {
    toast.success(message);
  },
  info: (message) => {
    toast.info(message);
  },
  warning: (message) => {
    toast.warning(message);
  },
  error: (message) => {
    toast.error(message);
  },
  loading: (message) => {
    toast.loading(message);
  },
};

interface DrawerSampleProps {
  direction: DrawerDirection;
}

function DrawerSample({ direction }: DrawerSampleProps) {
  const { t } = useTranslation();

  return (
    <Drawer direction={direction}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="lg">
          {t('dev.gallery.sample.open', { what: direction })}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg font-bold">{t('night.confirmTitle')}</DrawerTitle>
          <DrawerDescription>{t('night.confirmBody')}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="grid grid-cols-2 gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DrawerClose asChild>
            <Button variant="outline" size="lg">
              {t('common.cancel')}
            </Button>
          </DrawerClose>
          <Button size="lg">{t('night.submit')}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DropdownSample() {
  const { t } = useTranslation();
  const [showUnpaid, setShowUnpaid] = useState(true);
  const [sortBy, setSortBy] = useState('name');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg">
          {t('dev.gallery.sample.open', { what: 'menu' })}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem>{t('dev.gallery.sample.menuItem')}</DropdownMenuItem>
        <DropdownMenuItem disabled>{t('dev.gallery.disabled')}</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">
          {t('dev.gallery.sample.menuDelete')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showUnpaid} onCheckedChange={setShowUnpaid}>
          {t('dev.gallery.sample.menuCheckbox')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('dev.gallery.sample.menuLabel')}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
          <DropdownMenuRadioItem value="name">
            {t('dev.gallery.sample.menuRadioName')}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="level">
            {t('dev.gallery.sample.menuRadioLevel')}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Everything that opens above the page: menus, dialogs, drawers and toasts.
export function OverlayGallery() {
  const { t } = useTranslation();

  return (
    <>
      <GallerySection entry={PRIMITIVES['dropdown-menu']}>
        <VariantRow name="item · checkbox · radio · label · separator">
          <DropdownSample />
        </VariantRow>
      </GallerySection>

      <GallerySection entry={PRIMITIVES.dialog}>
        <VariantRow name="open">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                {t('dev.gallery.sample.open', { what: 'dialog' })}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('night.confirmTitle')}</DialogTitle>
                <DialogDescription>{t('night.confirmBody')}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>{t('night.submit')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </VariantRow>
      </GallerySection>

      <GallerySection entry={PRIMITIVES.drawer}>
        <VariantRow name="direction">
          {DRAWER_DIRECTIONS.map((direction) => (
            <DrawerSample key={direction} direction={direction} />
          ))}
        </VariantRow>
      </GallerySection>

      <GallerySection entry={PRIMITIVES.toast}>
        <VariantRow name="kind">
          {TOAST_KINDS.map((kind) => (
            <Button
              key={kind}
              variant="outline"
              size="lg"
              onClick={() => {
                TOAST_BY_KIND[kind](t('dev.gallery.sample.toastMessage'));
              }}
            >
              {kind}
            </Button>
          ))}
        </VariantRow>
      </GallerySection>
    </>
  );
}
