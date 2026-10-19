import type * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * The profile page's shape while it loads: breadcrumb, header, the tab list
 * (a row on phones, a column from `lg`) and one card, so nothing jumps when
 * the page arrives.
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-1" aria-hidden="true">
      <Skeleton className="h-5 w-28" />

      <div className="space-y-6">
        <div className="space-y-2 pt-1">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-full max-w-80" />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="flex shrink-0 gap-1 overflow-hidden lg:w-50 lg:flex-col">
            {[28, 20, 28, 24].map((width, index) => (
              <Skeleton
                key={index}
                // Each tab's own width in the row; the column fills its rail.
                className="h-8 w-(--tab-w) shrink-0 lg:w-full"
                style={{ '--tab-w': `${width * 4}px` } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="min-w-0 flex-1 space-y-6 rounded-xl p-4 ring-1 ring-foreground/10 sm:p-6 lg:max-w-2xl">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="size-18 shrink-0 rounded-full sm:size-24" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-9 w-full sm:w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
