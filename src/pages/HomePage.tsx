import { useTranslation } from 'react-i18next';
import UserAvatar from '@/components/UserAvatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMe } from '@/hooks/useMe';

export default function HomePage() {
  const { t } = useTranslation();
  const { data, isPending } = useMe();

  if (isPending) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const user = data?.user;

  return (
    <div className="space-y-4">
      <Card className="flex flex-row items-center gap-3 p-4">
        <UserAvatar user={user} className="size-12" />
        <div className="min-w-0">
          <p className="truncate font-medium">{user?.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-muted-foreground">{t('app.signedIn')}</p>
      </Card>
    </div>
  );
}
