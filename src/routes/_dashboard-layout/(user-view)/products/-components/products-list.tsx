import { Trans, useLingui } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  Trash2Icon,
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
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CurrencyFormatter } from '@/components/ui/currency-formatter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
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
    categoriesQuery.data?.some(category => category.id === searchCategoryId)
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

  const createMutation = useMutation({
    mutationFn: (values: ProductFormValues) =>
      createProduct({ ...values, category_id: categoryId as number }),
    onSuccess: product => {
      queryClient.invalidateQueries({ queryKey: ['products', categoryId] });
      setIsAdding(false);
      toast.success(t`Product “${product.title}” added`);
    },
    onError: error => {
      toast.error(t`Failed to add product`, { description: error.message });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ProductFormValues }) =>
      updateProduct(id, values),
    onSuccess: product => {
      queryClient.invalidateQueries({ queryKey: ['products', categoryId] });
      setPendingEdit(null);
      toast.success(t`Product “${product.title}” updated`);
    },
    onError: error => {
      toast.error(t`Failed to update product`, { description: error.message });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (product: Product) => deleteProduct(product.id),
    onSuccess: (_, product) => {
      queryClient.invalidateQueries({ queryKey: ['products', categoryId] });
      setPendingDelete(null);
      toast.success(t`Product “${product.title}” deleted`);
    },
    onError: error => {
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
            <ul className="grid grid-cols-1 gap-2">
              {productsQuery.data.map(product => (
                <li
                  key={product.id}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-colors'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{product.title}</div>
                    {product.description && (
                      <div className="truncate text-sm text-muted-foreground">
                        {product.description}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right tabular-nums">
                    <div className="text-sm">
                      <CurrencyFormatter value={product.price} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {product.quantity}x
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ size: 'icon', variant: 'ghost' }),
                        'shrink-0'
                      )}
                      aria-label={t`Product actions`}
                    >
                      <EllipsisVerticalIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => setPendingEdit(product)}>
                        <PencilIcon className="mr-2 size-4" />
                        <Trans>Edit product</Trans>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="focus:bg-destructive/10 focus:text-danger focus:**:text-danger!"
                        onClick={() => setPendingDelete(product)}
                      >
                        <Trash2Icon className="mr-2 size-4" />
                        <Trans>Delete product</Trans>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          ) : (
            <ProductsEmptyState />
          )}
        </CardContent>
      </Card>

      <ProductFormModal
        open={isAdding}
        onOpenChange={setIsAdding}
        onSave={values => createMutation.mutate(values)}
      />

      <ProductFormModal
        open={pendingEdit != null}
        product={pendingEdit}
        onOpenChange={open => !open && setPendingEdit(null)}
        onSave={values => {
          if (pendingEdit) {
            updateMutation.mutate({ id: pendingEdit.id, values });
          }
        }}
      />

      <DeleteProductDialog
        open={pendingDelete != null}
        productTitle={pendingDelete?.title ?? ''}
        onOpenChange={open => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete);
          }
        }}
      />
    </>
  );
}
