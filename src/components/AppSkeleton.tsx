import { Skeleton } from '@/components/ui/skeleton';

export default function AppSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4" aria-busy="true">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
