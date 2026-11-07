import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        <Avatar className="size-12">
          <AvatarImage src={user?.avatarUrl || undefined} alt="" />
          <AvatarFallback>{user?.name.slice(0, 1).toUpperCase() ?? '?'}</AvatarFallback>
        </Avatar>
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
