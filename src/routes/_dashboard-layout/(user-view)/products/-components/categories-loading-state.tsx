import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { CategoriesCard } from './categories-card';

// Each row as tall as a real one (32px label + 2px gap, 20px per indent
// level), with a bar the size of its name where the name will be.
const rows = [
  { indent: false, width: 'w-3/5' },
  { indent: true, width: 'w-2/5' },
  { indent: true, width: 'w-1/3' },
  { indent: false, width: 'w-1/2' }
];

// Mirrors the loaded card: the add button, the search field, then the rows.
export function CategoriesLoadingState() {
  return (
    <CategoriesCard action={<Skeleton className="size-7 rounded-lg" />}>
      <Skeleton className="mb-3 h-9 w-full rounded-lg" />
      <div className="flex flex-col gap-0.5">
        {rows.map((row, index) => (
          <div
            key={index}
            className={cn('flex h-8 items-center px-2', row.indent && 'ms-5')}
          >
            <Skeleton className={cn('h-4', row.width)} />
          </div>
        ))}
      </div>
    </CategoriesCard>
  );
}
