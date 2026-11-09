import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorBanner from '@/components/league/ErrorBanner';
import { Button } from '@/components/ui/button';
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
import { useSubmitNight } from '@/hooks/useLeagueMutations';

interface SubmitNightSheetProps {
  teamMatchId: string;
}

// A sheet, not a dialog and never window.confirm: the project's shadcn rule makes every
// confirmation a sheet. Submitting is a one-way door for a captain, which is why it confirms
// at all — an admin can still correct afterwards.
export default function SubmitNightSheet({ teamMatchId }: SubmitNightSheetProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const submit = useSubmitNight(teamMatchId);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="h-12 w-full">{t('night.submit')}</Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('night.confirmTitle')}</DrawerTitle>
          <DrawerDescription>{t('night.confirmBody')}</DrawerDescription>
        </DrawerHeader>

        {submit.error !== null && (
          <div className="px-4">
            <ErrorBanner error={submit.error} />
          </div>
        )}

        <DrawerFooter>
          {/* Cancel first, so focus lands on the safe choice when the sheet opens. */}
          <DrawerClose asChild>
            <Button variant="outline" className="h-12 w-full">
              {t('common.cancel')}
            </Button>
          </DrawerClose>
          <Button
            className="h-12 w-full"
            disabled={submit.isPending}
            onClick={() => {
              submit.mutate(undefined, {
                onSuccess: () => {
                  setIsOpen(false);
                },
              });
            }}
          >
            {t('night.submit')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
