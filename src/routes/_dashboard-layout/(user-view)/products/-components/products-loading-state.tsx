import { Skeleton } from '@/components/ui/skeleton';

import { ProductsCard } from './products-card';

// Mirrors the loaded card: breadcrumbs, title, search + "Add product", then
// the table's header row and a few product rows with the same heights.
export function ProductsLoadingState() {
  return (
    <ProductsCard
      breadcrumb={
        <div className="flex h-[17px] items-center">
          <Skeleton className="h-3 w-28" />
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 w-32 shrink-0 rounded-lg" />
      </div>
      <div className="flex h-8 items-center border-b px-2.5">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="ms-auto h-3 w-14" />
        <Skeleton className="ms-6 me-12 h-3 w-10" />
      </div>
      {['w-2/5', 'w-1/2', 'w-1/3'].map((width) => (
        <div
          key={width}
          className="flex h-[41px] items-center border-b px-2.5 last:border-0"
        >
          <Skeleton className={`h-4 ${width}`} />
          <Skeleton className="ms-auto h-4 w-6" />
          <Skeleton className="ms-8 h-4 w-12" />
          <Skeleton className="ms-5 me-1 size-5" />
        </div>
      ))}
    </ProductsCard>
  );
}
