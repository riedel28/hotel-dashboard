import { Trans } from '@lingui/react/macro';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PencilIcon, Trash2Icon, XIcon } from 'lucide-react';
import * as React from 'react';
import {
  deleteProduct,
  fetchProductsByCategory,
  updateProduct
} from '@/api/products';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ErrorDisplay,
  ErrorDisplayActions,
  ErrorDisplayIcon,
  ErrorDisplayMessage,
  ErrorDisplayRetryButton,
  ErrorDisplayTitle
} from '@/components/ui/error-display';

import { cn } from '@/lib/utils';

import { Route as ProductsRoute } from '../index';
import { DeleteProductDialog } from './delete-product-dialog';
import { EditProductModal } from './edit-product-modal';
import { ProductsEmptyState } from './products-empty-state';
import { ProductsLoadingState } from './products-loading-state';

type Product = { id: number; title: string; category_id: number };

export function ProductsList() {
  const categoryId = ProductsRoute.useSearch().category_id ?? null;

  const productsQuery = useQuery<Product[], Error>({
    queryKey: ['products', categoryId],
    enabled: categoryId != null,
    queryFn: () => fetchProductsByCategory(categoryId as number)
  });

  const queryClient = useQueryClient();
  const [pendingEdit, setPendingEdit] = React.useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(
    null
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      updateProduct(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', categoryId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', categoryId] });
      setPendingDelete(null);
    }
  });

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
            <ErrorDisplay variant="destructive" size="sm" className="w-full">
              <ErrorDisplayIcon icon={XIcon} />
              <ErrorDisplayTitle>
                <Trans>Failed to load products</Trans>
              </ErrorDisplayTitle>
              <ErrorDisplayMessage>
                {productsQuery.error?.message}
              </ErrorDisplayMessage>
              <ErrorDisplayActions>
                <ErrorDisplayRetryButton
                  onRetry={() => productsQuery.refetch()}
                  isRetrying={productsQuery.isFetching}
                />
              </ErrorDisplayActions>
            </ErrorDisplay>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="min-h-[150px]">
        <CardHeader>
          <CardTitle className="text-base">
            <Trans>Products</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {productsQuery.data && productsQuery.data.length > 0 ? (
            <ul className="grid gap-2">
              {productsQuery.data.map((product) => (
                <li
                  key={product.id}
                  className={cn(
                    'flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 transition-colors'
                  )}
                >
                  <span className="text-sm font-medium">{product.title}</span>
                  <span className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit product"
                      onClick={() => setPendingEdit(product)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete product"
                      onClick={() => setPendingDelete(product)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <ProductsEmptyState />
          )}
        </CardContent>
      </Card>

      <EditProductModal
        open={pendingEdit != null}
        initialTitle={pendingEdit?.title ?? ''}
        onOpenChange={(open) => !open && setPendingEdit(null)}
        onSave={(newTitle) => {
          if (pendingEdit) {
            updateMutation.mutate({ id: pendingEdit.id, title: newTitle });
            setPendingEdit(null);
          }
        }}
      />

      <DeleteProductDialog
        open={pendingDelete != null}
        productTitle={pendingDelete?.title ?? ''}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteMutation.mutate(pendingDelete.id);
          }
        }}
      />
    </>
  );
}
