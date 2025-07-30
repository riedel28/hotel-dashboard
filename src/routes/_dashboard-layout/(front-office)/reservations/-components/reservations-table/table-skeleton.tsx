import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="rounded-md border">
      <div className="bg-muted/50 border-b">
        <div className="flex h-12 items-center px-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="flex-1 px-2">
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex h-16 items-center border-b px-4 last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-2">
                <Skeleton className="h-4 w-full max-w-[120px]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
