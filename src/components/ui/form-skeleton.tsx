import { Skeleton } from './skeleton';

export function FormSkeleton() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 max-w-[120px]" />
        <Skeleton className="h-10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 max-w-[120px]" />
        <Skeleton className="h-10" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 max-w-[120px]" />
        <Skeleton className="h-10" />
      </div>
    </div>
  );
}
