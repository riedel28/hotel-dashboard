import * as React from 'react';

import {
  fetchProductCategories,
  transformFlatCategoriesToTree
} from '@/api/product-categories';
import { fetchProducts } from '@/api/products';
import { Trans, useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  ErrorDisplayActions,
  ErrorDisplayError,
  ErrorDisplayMessage,
  ErrorDisplayRetryButton,
  ErrorDisplayTitle
} from '@/components/ui/error-display';

import {
  type ProductCategory,
  ProductTreeEditor
} from './-components/product-tree-editor';
import type { Product } from './-components/product-tree-editor';

type ProductCategoryLocal = ProductCategory;
type ProductLocal = Product;

function ProductsPage() {
  const { t } = useLingui();
  const categoriesQuery = useQuery({
    queryKey: ['product-categories'],
    queryFn: fetchProductCategories,
    select: transformFlatCategoriesToTree
  });
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const [categories, setCategories] = React.useState<ProductCategoryLocal[]>(
    []
  );
  const [products, setProducts] = React.useState<ProductLocal[]>([]);

  React.useEffect(() => {
    if (categoriesQuery.data) setCategories(categoriesQuery.data);
  }, [categoriesQuery.data]);
  React.useEffect(() => {
    if (productsQuery.data) setProducts(productsQuery.data);
  }, [productsQuery.data]);

  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
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
        <h1 className="text-2xl font-bold">
          <Trans>Products</Trans>
        </h1>
      </div>

      {categoriesQuery.isError || productsQuery.isError ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <ErrorDisplayError className="w-md max-w-md">
            <ErrorDisplayTitle>
              <Trans>Something went wrong</Trans>
            </ErrorDisplayTitle>
            <ErrorDisplayMessage>
              {categoriesQuery.error?.message ||
                productsQuery.error?.message ||
                t`Failed to load data`}
            </ErrorDisplayMessage>
            <ErrorDisplayActions>
              <ErrorDisplayRetryButton
                onRetry={() => {
                  categoriesQuery.refetch();
                  productsQuery.refetch();
                }}
                isRetrying={
                  categoriesQuery.isFetching || productsQuery.isFetching
                }
              />
            </ErrorDisplayActions>
          </ErrorDisplayError>
        </div>
      ) : categoriesQuery.isLoading || productsQuery.isLoading ? (
        <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center">
          <Trans>Loading products...</Trans>
        </div>
      ) : (
        <ProductTreeEditor
          categories={categories}
          products={products}
          onCategoriesChange={setCategories}
          onProductsChange={setProducts}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/products/'
)({
  component: ProductsPage
});
