import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Edit2Icon,
  PlusCircleIcon,
  RefreshCwIcon,
  TrashIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { fetchProductCategories } from '@/api/product-categories';
import {
  createProduct,
  deleteProduct,
  fetchProductsByCategory,
  type Product,
  updateProduct
} from '@/api/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { Route as ProductsRoute } from '../index';
import { DeleteProductDialog } from './delete-product-dialog';
import { ProductFormModal, type ProductFormValues } from './product-form-modal';
import { ProductsEmptyState } from './products-empty-state';
import { ProductsLoadingState } from './products-loading-state';

export function ProductsList() {
  const searchCategoryId = ProductsRoute.useSearch().category_id ?? null;

  // Shares the tree's ['product-categories'] cache — no extra request. A
  // category_id that isn't in the current property's categories (stale link,
  // deleted category, property switch) is treated as no selection.
  const categoriesQuery = useQuery({
    queryKey: ['product-categories'],
    queryFn: fetchProductCategories
  });
  const categoryId =
    searchCategoryId != null &&
    categoriesQuery.data?.some((category) => category.id === searchCategoryId)
      ? searchCategoryId
      : null;

  const productsQuery = useQuery<Product[], Error>({
    queryKey: ['products', categoryId],
    enabled: categoryId != null,
    queryFn: () => fetchProductsByCategory(categoryId as number)
  });

  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = React.useState(false);
  const [pendingEdit, setPendingEdit] = React.useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(
    null
  );

  // After the server confirms a change, patch the cached list right away so
  // the table updates together with the dialog closing, then refetch in the
  // background to reconcile. Not optimistic: nothing to roll back.
  const updateCachedProducts = (update: (products: Product[]) => Product[]) => {
    const queryKey = ['products', categoryId];
    queryClient.setQueryData<Product[]>(queryKey, (products) =>
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

  if (categoriesQuery.isLoading) {
    return <ProductsLoadingState />;
  }

  if (categoryId == null) {
    return (
      <div className="col-span-12 md:col-span-6">
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
      </div>
    );
  }

  if (productsQuery.isLoading) {
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
            <Empty variant="destructive" className="w-full md:p-6">
              <EmptyHeader>
                <EmptyMedia variant="destructive">
                  <XIcon />
                </EmptyMedia>
                <EmptyTitle>
                  <Trans>Failed to load products</Trans>
                </EmptyTitle>
                <EmptyDescription>
                  {productsQuery.error?.message}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="destructive"
                  onClick={() => productsQuery.refetch()}
                  disabled={productsQuery.isFetching}
                >
                  <RefreshCwIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      productsQuery.isFetching && 'animate-spin'
                    )}
                  />
                  <Trans>Try again</Trans>
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="min-h-[150px]">
        <CardHeader>
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
          <CardAction>
            <Button variant="secondary" onClick={() => setIsAdding(true)}>
              <PlusCircleIcon />
              <Trans>Add product</Trans>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-0">
          {productsQuery.data && productsQuery.data.length > 0 ? (
            <Table borderless className="table-fixed">
              <TableBody>
                {productsQuery.data.map((product) => (
                  <TableRow
                    key={product.id}
                    className="group/row hover:bg-transparent"
                  >
                    <TableCell className="py-2.5">
                      <div className="flex min-w-0 items-baseline gap-2">
                        <span className="max-w-full flex-none truncate font-medium">
                          {product.title}
                        </span>
                        {product.description && (
                          <span className="min-w-0 flex-1 truncate text-muted-foreground">
                            {product.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-12 py-2.5 text-right text-muted-foreground tabular-nums">
                      {product.quantity}x
                    </TableCell>
                    <TableCell className="w-20 py-2.5 text-right tabular-nums">
                      <CurrencyFormatter value={product.price} />
                    </TableCell>
                    <TableCell className="w-18 py-1.5">
                      {/* Revealed on row hover or keyboard focus, like Guest ABC. */}
                      <div className="flex justify-end gap-0.5 opacity-0 group-hover/row:opacity-100 group-hover/row:transition-opacity focus-within:opacity-100 focus-within:transition-opacity">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          aria-label={t`Edit product`}
                          onClick={() => setPendingEdit(product)}
                        >
                          <Edit2Icon className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          aria-label={t`Delete product`}
                          onClick={() => setPendingDelete(product)}
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <ProductsEmptyState />
          )}
        </CardContent>
      </Card>

      <ProductFormModal
        open={isAdding}
        onOpenChange={setIsAdding}
        isPending={createMutation.isPending}
        onSave={(values) => createMutation.mutate(values)}
      />

      <ProductFormModal
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
