import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="rounded-md border">
      <div className="border-b">
        <div className="flex h-10 items-center px-2"></div>
      </div>
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex h-12 items-center border-b px-2 last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <Skeleton className="h-4 w-full max-w-[120px]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
