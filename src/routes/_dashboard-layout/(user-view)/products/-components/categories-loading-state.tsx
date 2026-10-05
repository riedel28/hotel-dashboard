import { Skeleton } from '@/components/ui/skeleton';

import { CategoriesCard } from './categories-card';

// Mirrors the loaded card: the add button, the search field, then rows like
// the real ones (40px label + 4px gap, 20px per indent level).
export function CategoriesLoadingState() {
  return (
    <CategoriesCard action={<Skeleton className="size-7 rounded-lg" />}>
      <Skeleton className="mb-3 h-9 w-full rounded-lg" />
      <div className="flex flex-col gap-1">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="ms-5 h-10 w-3/5 rounded-lg" />
        <Skeleton className="ms-5 h-10 w-2/5 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </CategoriesCard>
  );
}
