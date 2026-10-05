import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeftIcon } from 'lucide-react';
import { z } from 'zod';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { cn } from '@/lib/utils';

import { ProductCategoriesTree } from './-components/product-categories-tree';
import { ProductsList } from './-components/products-list';

const productsSearchSchema = z.object({
  category_id: z.number().optional()
});

function ProductsPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Products`);
  const hasSelection = Route.useSearch().category_id != null;

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <Trans>Products</Trans>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between">
        <h1 className="text-xl font-bold">
          <Trans>Products</Trans>
        </h1>
      </div>

      {/* Two columns from lg up. Below that it's one screen at a time: the
          categories, then (once one is picked) its products with a way back.
          Both stay mounted, so the tree keeps its expanded folders. */}
      <div className="grid grid-cols-12 gap-4 xl:max-w-300">
        <div
          className={cn(
            'col-span-12 lg:col-span-5',
            hasSelection && 'max-lg:hidden'
          )}
        >
          <ProductCategoriesTree />
        </div>
        <div
          className={cn(
            'col-span-12 lg:col-span-7',
            !hasSelection && 'max-lg:hidden'
          )}
        >
          <Link
            to="/products"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'mb-2 text-muted-foreground lg:hidden'
            )}
          >
            <ChevronLeftIcon />
            <Trans>Categories</Trans>
          </Link>
          <ProductsList />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/products/'
)({
  component: ProductsPage,
  validateSearch: productsSearchSchema
});
