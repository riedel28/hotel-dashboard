import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import {
  fetchProductCategories,
  productCategoriesQueryKey
} from '@/api/product-categories';
import {
  createProduct,
  deleteProduct,
  type Product,
  productsByCategoryQueryOptions,
  updateProduct
} from '@/api/products';
import { ErrorState } from '@/components/error-state';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SearchInput } from '@/components/ui/search-input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { Route as ProductsRoute } from '../index';
import { DeleteProductDialog } from './delete-product-dialog';
import { destructiveMenuItemClassName } from './destructive-styles';
import {
  ProductFormDrawer,
  type ProductFormValues
} from './product-form-drawer';
import { ProductsEmptyState } from './products-empty-state';
import { ProductsLoadingState } from './products-loading-state';

const skeletonDelayMs = 250;

export function ProductsList() {
  const searchCategoryId = ProductsRoute.useSearch().category_id ?? null;

  // Shares the tree's ['product-categories'] cache — no extra request. A
  // category_id that isn't in the current property's categories (stale link,
  // deleted category, property switch) is treated as no selection.
  const categoriesQuery = useQuery({
    queryKey: productCategoriesQueryKey,
    queryFn: fetchProductCategories
  });
  const categoryId =
    searchCategoryId != null &&
    categoriesQuery.data?.some((category) => category.id === searchCategoryId)
      ? searchCategoryId
      : null;

  // Titles from the top-level category down to the selected one.
  const categoryPath: string[] = [];
  for (
    let category = categoriesQuery.data?.find((c) => c.id === categoryId);
    category;
    category = categoriesQuery.data?.find((c) => c.id === category?.parent_id)
  ) {
    categoryPath.unshift(category.title);
  }

  const productsQuery = useQuery({
    // The placeholder id is never fetched: the query is disabled without one.
    ...productsByCategoryQueryOptions(categoryId ?? 0),
    enabled: categoryId != null
  });

  // A fast response would flash the skeleton for a few frames, so it only
  // appears once loading has taken a noticeable time. Until then the card
  // shows its header and toolbar with an empty body.
  const [showSkeleton, setShowSkeleton] = React.useState(false);
  React.useEffect(() => {
    setShowSkeleton(false);
    if (!productsQuery.isLoading) return;
    const timeout = setTimeout(() => setShowSkeleton(true), skeletonDelayMs);
    return () => clearTimeout(timeout);
  }, [productsQuery.isLoading, categoryId]);

  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  // A search belongs to the category it was typed in.
  React.useEffect(() => setSearch(''), [categoryId]);
  const query = search.trim().toLowerCase();
  const visibleProducts = (productsQuery.data ?? []).filter((product) =>
    product.title.toLowerCase().includes(query)
  );
  const [isAdding, setIsAdding] = React.useState(false);
  const [pendingEdit, setPendingEdit] = React.useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(
    null
  );

  // After the server confirms a change, patch the cached list right away so
  // the table updates together with the dialog closing, then refetch in the
  // background to reconcile. Not optimistic: nothing to roll back.
  const updateCachedProducts = (update: (products: Product[]) => Product[]) => {
    if (categoryId == null) return;
    const { queryKey } = productsByCategoryQueryOptions(categoryId);
    queryClient.setQueryData(queryKey, (products) =>
      products
        ? update(products).sort((a, b) => a.title.localeCompare(b.title))
        : products
    );
    queryClient.invalidateQueries({ queryKey });
  };

  const createMutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      createProduct({ ...values, category_id: categoryId as number }),
    onSuccess: (product) => {
      updateCachedProducts((products) => [...products, product]);
      setIsAdding(false);
      toast.success(t`Product “${product.title}” added`);
    },
    onError: (error) => {
      toast.error(t`Failed to add product`, { description: error.message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ProductFormValues }) =>
      updateProduct(id, values),
    onSuccess: (product) => {
      updateCachedProducts((products) =>
        products.map((item) => (item.id === product.id ? product : item))
      );
      setPendingEdit(null);
      toast.success(t`Product “${product.title}” updated`);
    },
    onError: (error) => {
      toast.error(t`Failed to update product`, { description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (product: Product) => deleteProduct(product.id),
    onSuccess: (_, product) => {
      updateCachedProducts((products) =>
        products.filter((item) => item.id !== product.id)
      );
      setPendingDelete(null);
      toast.success(t`Product “${product.title}” deleted`);
    },
    onError: (error) => {
      toast.error(t`Failed to delete product`, { description: error.message });
    }
  });

  // Without a category in the URL the card ends up as the "select a
  // category" hint below, so only show the table skeleton when one is set.
  if (categoriesQuery.isLoading && searchCategoryId != null) {
    return <ProductsLoadingState />;
  }

  if (categoryId == null) {
    return (
      <Card className="min-h-[150px]">
        <CardHeader>
          <CardTitle className="text-base">
            <Trans>Products</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex min-h-[140px] items-center justify-center">
            <div className="text-center text-base text-muted-foreground">
              <Trans>Select a category to view products</Trans>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (productsQuery.isLoading && showSkeleton) {
    return <ProductsLoadingState />;
  }

  if (productsQuery.isError) {
    return (
      <Card className="min-h-[150px]">
        <CardHeader>
          <CardTitle className="text-base">
            <Trans>Products</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex min-h-[140px] items-center justify-center">
            <ErrorState
              size="sm"
              title={<Trans>Failed to load products</Trans>}
              message={productsQuery.error?.message}
              onRetry={() => productsQuery.refetch()}
              isRetrying={productsQuery.isFetching}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="min-h-[150px]">
        <CardHeader>
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              {categoryPath.map((title, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem className="min-w-0">
                    {index === categoryPath.length - 1 ? (
                      <BreadcrumbPage className="truncate" title={title}>
                        {title}
                      </BreadcrumbPage>
                    ) : (
                      <span className="truncate" title={title}>
                        {title}
                      </span>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trans>Products</Trans>
            {productsQuery.data && productsQuery.data.length > 0 && (
              <Badge
                variant="secondary"
                color="gray"
                size="xs"
                className="tabular-nums"
              >
                {productsQuery.data.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <SearchInput
              key={categoryId}
              value={search}
              onChange={setSearch}
              placeholder={t`Search products`}
              aria-label={t`Search products`}
              wrapperClassName="2xl:max-w-[400px]"
            />
            <Button
              variant="secondary"
              className="shrink-0 bg-clip-border"
              onClick={() => setIsAdding(true)}
            >
              <PlusIcon />
              <Trans>Add product</Trans>
            </Button>
          </div>
          {productsQuery.isLoading ? null : !productsQuery.data ||
            productsQuery.data.length === 0 ? (
            <ProductsEmptyState />
          ) : visibleProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              <Trans>No products found</Trans>
            </p>
          ) : (
            <Table borderless className="table-fixed">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>
                    <Trans>Title</Trans>
                  </TableHead>
                  <TableHead className="w-20 text-right">
                    <Trans>Quantity</Trans>
                  </TableHead>
                  <TableHead className="w-20 text-right">
                    <Trans>Price</Trans>
                  </TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">
                      <Trans>Actions</Trans>
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-transparent">
                    <TableCell className="truncate py-2.5 font-medium">
                      {product.title}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-muted-foreground tabular-nums">
                      {product.quantity}
                    </TableCell>
                    <TableCell className="py-2.5 text-right tabular-nums">
                      <CurrencyFormatter value={product.price} />
                    </TableCell>
                    <TableCell className="py-1.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={buttonVariants({
                            size: 'icon-sm',
                            variant: 'ghost'
                          })}
                          aria-label={t`Product actions`}
                        >
                          <MoreHorizontalIcon className="size-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-auto max-w-72 min-w-40"
                        >
                          <DropdownMenuItem
                            onClick={() => setPendingEdit(product)}
                          >
                            <PencilIcon className="mr-2 size-4" />
                            <Trans>Edit product</Trans>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={destructiveMenuItemClassName}
                            onClick={() => setPendingDelete(product)}
                          >
                            <Trash2Icon className="mr-2 size-4" />
                            <Trans>Delete product</Trans>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProductFormDrawer
        open={isAdding}
        onOpenChange={setIsAdding}
        isPending={createMutation.isPending}
        onSave={(values) => createMutation.mutate(values)}
      />

      <ProductFormDrawer
        open={pendingEdit != null}
        product={pendingEdit}
        onOpenChange={(open) => !open && setPendingEdit(null)}
        isPending={updateMutation.isPending}
        onSave={(values) => {
          if (pendingEdit) {
            updateMutation.mutate({ id: pendingEdit.id, values });
          }
        }}
      />

      <DeleteProductDialog
        open={pendingDelete != null}
        productTitle={pendingDelete?.title ?? ''}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete);
          }
        }}
      />
    </>
  );
}
