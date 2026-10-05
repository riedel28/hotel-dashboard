import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import * as React from 'react';

import { type Product, productsByCategoryQueryOptions } from '@/api/products';
import { ErrorState } from '@/components/error-state';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';

import { DeleteProductDialog } from './delete-product-dialog';
import { ProductFormDrawer } from './product-form-drawer';
import { CategoryBreadcrumb, ProductsCard } from './products-card';
import { ProductsEmptyState } from './products-empty-state';
import { ProductsLoadingState } from './products-loading-state';
import { ProductsTable } from './products-table';
import { useProductMutations } from './use-product-mutations';
import { useSelectedCategory } from './use-selected-category';

// A fast response would flash the skeleton for a few frames, so it only
// appears once loading has taken a noticeable time.
const skeletonDelayMs = 250;

// The products column: a hint until a category is selected, then that
// category's products.
export function ProductsList() {
  const { categoryId, path, isResolving } = useSelectedCategory();
  console.log(
    'ProductsList categoryId:',
    categoryId,
    'path:',
    path,
    'isResolving:',
    isResolving
  );

  if (isResolving) {
    return <ProductsLoadingState />;
  }

  if (categoryId == null) {
    return (
      <ProductsCard>
        <div className="flex min-h-[140px] items-center justify-center text-center text-base text-muted-foreground">
          <Trans>Select a category to view products</Trans>
        </div>
      </ProductsCard>
    );
  }

  // Keyed by category: search, dialogs and the skeleton delay start fresh for
  // each one instead of being reset by hand.
  return (
    <CategoryProducts key={categoryId} categoryId={categoryId} path={path} />
  );
}

interface CategoryProductsProps {
  categoryId: number;
  path: string[];
}

function CategoryProducts({ categoryId, path }: CategoryProductsProps) {
  const { t } = useLingui();
  const productsQuery = useQuery(productsByCategoryQueryOptions(categoryId));
  const showSkeleton = useDelayedFlag(productsQuery.isLoading, skeletonDelayMs);
  const { create, update, remove } = useProductMutations(categoryId);

  const [search, setSearch] = React.useState('');
  // `product: null` adds a new one. The target is kept while the drawer
  // closes so its title doesn't change mid-animation.
  const [form, setForm] = React.useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });
  const closeForm = () => setForm((prev) => ({ ...prev, open: false }));
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(
    null
  );

  if (showSkeleton) {
    return <ProductsLoadingState />;
  }

  const breadcrumb = <CategoryBreadcrumb path={path} />;

  if (productsQuery.isError) {
    return (
      <ProductsCard breadcrumb={breadcrumb}>
        <div className="flex min-h-[140px] items-center justify-center">
          <ErrorState
            size="sm"
            title={<Trans>Failed to load products</Trans>}
            message={productsQuery.error.message}
            onRetry={() => productsQuery.refetch()}
            isRetrying={productsQuery.isFetching}
          />
        </div>
      </ProductsCard>
    );
  }

  const products = productsQuery.data ?? [];
  const query = search.trim().toLowerCase();
  const visibleProducts = products.filter((product) =>
    product.title.toLowerCase().includes(query)
  );

  return (
    <>
      <ProductsCard breadcrumb={breadcrumb} count={products.length}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t`Search products`}
            aria-label={t`Search products`}
            wrapperClassName="2xl:max-w-[400px]"
          />
          <Button
            variant="secondary"
            className="shrink-0 bg-clip-border"
            onClick={() => setForm({ open: true, product: null })}
          >
            <PlusIcon />
            <Trans>Add product</Trans>
          </Button>
        </div>
        {/* Still loading, but not for long enough to show the skeleton. */}
        {productsQuery.isLoading ? null : products.length === 0 ? (
          <ProductsEmptyState />
        ) : visibleProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            <Trans>No products found</Trans>
          </p>
        ) : (
          <ProductsTable
            products={visibleProducts}
            onEdit={(product) => setForm({ open: true, product })}
            onDelete={setPendingDelete}
          />
        )}
      </ProductsCard>

      <ProductFormDrawer
        open={form.open}
        product={form.product}
        onOpenChange={(open) => !open && closeForm()}
        isPending={create.isPending || update.isPending}
        onSave={(values) =>
          form.product
            ? update.mutate(
                { id: form.product.id, values },
                { onSuccess: closeForm }
              )
            : create.mutate(values, { onSuccess: closeForm })
        }
      />

      <DeleteProductDialog
        open={pendingDelete != null}
        productTitle={pendingDelete?.title ?? ''}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        isPending={remove.isPending}
        onConfirm={() => {
          if (pendingDelete) {
            remove.mutate(pendingDelete, {
              onSuccess: () => setPendingDelete(null)
            });
          }
        }}
      />
    </>
  );
}
