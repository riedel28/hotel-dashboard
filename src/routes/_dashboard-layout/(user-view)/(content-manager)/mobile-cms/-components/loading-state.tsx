import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { appTokens } from './preview/tokens';

const treeRows = [
  { indent: false, width: 'w-3/5' },
  { indent: true, width: 'w-2/5' },
  { indent: true, width: 'w-1/3' },
  { indent: false, width: 'w-1/2' },
  { indent: false, width: 'w-2/5' }
];

// A label above a field, at the loaded form's sizes.
function FieldSkeleton({
  labelWidth,
  field
}: {
  labelWidth: string;
  field: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className={cn('h-4', labelWidth)} />
      <Skeleton className={cn('rounded-lg', field)} />
    </div>
  );
}

// Mirrors the loaded page in broad strokes: the tree card, the editor card
// and, where it has a column, the phone preview. `columnsClassName` is the
// page's own grid, so both always line up.
export function CmsLoadingState({
  columnsClassName
}: {
  columnsClassName: string;
}) {
  const { width, height } = appTokens.viewport;
  return (
    <div className={columnsClassName} aria-busy="true">
      <Card className="@max-3xl:hidden">
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 w-[74px] rounded-lg" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          {/* As in Products' categories skeleton: rows as tall as the tree's
              (32px + 2px gap, 20px per indent level), each with a bar the
              size of its title. */}
          <div className="flex flex-col gap-0.5">
            {treeRows.map((row, index) => (
              <div
                key={index}
                className={cn(
                  'flex h-8 items-center px-2',
                  row.indent && 'ms-5'
                )}
              >
                <Skeleton className={cn('h-4', row.width)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="grid-cols-[1fr_auto] items-center">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-10" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-9 rounded-lg" />
              <Skeleton className="h-9 rounded-lg" />
            </div>
          </div>
          <FieldSkeleton labelWidth="w-14" field="size-24" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
          <FieldSkeleton labelWidth="w-10" field="h-9 w-full" />
          <FieldSkeleton labelWidth="w-24" field="h-9 w-full" />
          <FieldSkeleton labelWidth="w-10" field="h-40 w-full" />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 @max-7xl:hidden">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-[74px] rounded-lg" />
          <Skeleton className="h-7 w-[92px] rounded-lg" />
          <Skeleton className="ms-auto h-4 w-24" />
        </div>
        {/* The phone frame at its logical size, scaled like the real one. */}
        <Skeleton
          className="w-full rounded-[48px]"
          style={{ aspectRatio: `${width + 24} / ${height + 24}` }}
        />
      </div>
    </div>
  );
}
