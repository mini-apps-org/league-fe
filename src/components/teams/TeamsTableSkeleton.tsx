import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_ROWS = 8;

export const TeamsTableSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-line bg-card p-4" aria-hidden>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => {
        return <Skeleton key={index} className="h-9 w-full" />;
      })}
    </div>
  );
};
