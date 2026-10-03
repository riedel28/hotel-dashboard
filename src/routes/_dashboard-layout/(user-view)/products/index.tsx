import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { ProductCategoriesTree } from './-components/product-categories-tree';
import { ProductsList } from './-components/products-list';

const productsSearchSchema = z.object({
  category_id: z.number().optional()
});

function ProductsPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Products`);

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

      <div className="grid grid-cols-12 gap-4 xl:max-w-300">
        <div className="col-span-12 md:col-span-4 2xl:col-span-5">
          <ProductCategoriesTree />
        </div>
        <div className="col-span-12 md:col-span-8 2xl:col-span-7">
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
