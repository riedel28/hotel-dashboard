import * as React from 'react';

import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { Trans } from '@lingui/react/macro';
import { Loader2Icon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree';

import { cn } from '@/lib/utils';

import { DeleteProductDialog } from './delete-product-dialog';
import { EditProductModal } from './edit-product-modal';
import { ProductsList } from './products-list';

export type Product = {
  id: number;
  title: string;
};

export type ProductCategory = {
  id: number;
  title: string;
  children?: ProductCategory[];
  products: Product[];
};

function findCategoryById(
  nodes: ProductCategory[],
  id: number
): ProductCategory | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length) {
      const found = findCategoryById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateCategoryTitle(
  nodes: ProductCategory[],
  id: number,
  title: string
): ProductCategory[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, title };
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: updateCategoryTitle(node.children, id, title)
      };
    }
    return node;
  });
}

function updateProductTitle(
  nodes: ProductCategory[],
  categoryId: number,
  productId: number,
  title: string
): ProductCategory[] {
  return nodes.map((node) => {
    if (node.id === categoryId) {
      return {
        ...node,
        products: node.products.map((p) =>
          p.id === productId ? { ...p, title } : p
        )
      };
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: updateProductTitle(
          node.children,
          categoryId,
          productId,
          title
        )
      };
    }
    return node;
  });
}

function deleteProduct(
  nodes: ProductCategory[],
  categoryId: number,
  productId: number
): ProductCategory[] {
  return nodes.map((node) => {
    if (node.id === categoryId) {
      return {
        ...node,
        products: node.products.filter((p) => p.id !== productId)
      };
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: deleteProduct(node.children, categoryId, productId)
      };
    }
    return node;
  });
}

interface ProductTreeEditorProps {
  categories: ProductCategory[];
  onChange: (next: ProductCategory[]) => void;
}

type TreeItemData = { name: string; children?: string[]; nodeId?: number };

export function ProductTreeEditor({
  categories,
  onChange
}: ProductTreeEditorProps) {
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = React.useState<
    number | null
  >(null);

  const indent = 20;

  const { itemsMap, rootId } = React.useMemo(() => {
    const map: Record<string, TreeItemData> = {};
    const topLevelIds: string[] = [];

    const addNode = (node: ProductCategory) => {
      const idStr = String(node.id);
      const childrenIds = (node.children ?? []).map((c) => String(c.id));
      map[idStr] = {
        name: node.title,
        children: childrenIds.length ? childrenIds : undefined,
        nodeId: node.id
      };
      node.children?.forEach(addNode);
    };

    categories.forEach((cat) => {
      topLevelIds.push(String(cat.id));
      addNode(cat);
    });

    map.root = { name: 'root', children: topLevelIds };
    return { itemsMap: map, rootId: 'root', initiallyExpanded: topLevelIds };
  }, [categories]);

  const tree = useTree<TreeItemData>({
    initialState: { expandedItems: [] },
    indent,
    rootItemId: rootId,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => itemsMap[itemId],
      getChildren: (itemId) => itemsMap[itemId]?.children ?? []
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature]
  });

  const selectedNode = React.useMemo(() => {
    return selectedId != null ? findCategoryById(categories, selectedId) : null;
  }, [categories, selectedId]);
  const [pendingDelete, setPendingDelete] = React.useState<{
    categoryId: number;
    product: Product;
  } | null>(null);
  const [pendingEdit, setPendingEdit] = React.useState<{
    categoryId: number;
    product: Product;
  } | null>(null);
  const categoryTitle = selectedNode ? selectedNode.title : '';
  const pendingProductTitle = pendingDelete?.product.title ?? '';

  const [titleInput, setTitleInput] = React.useState('');
  React.useEffect(() => {
    setTitleInput(selectedNode?.title ?? '');
  }, [selectedNode]);

  React.useEffect(() => {
    setSelectedProductId(null);
  }, [selectedId]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isTreeLoading, setIsTreeLoading] = React.useState(false);

  React.useEffect(() => {
    setIsTreeLoading(true);
    const id = setTimeout(() => setIsTreeLoading(false), 1500);
    return () => clearTimeout(id);
  }, [categories]);

  // Simple loading skeleton: 4 full-width rows

  return (
    <>
      <div className="grid grid-cols-12 gap-4 xl:max-w-[1200px]">
        <div className="col-span-12 md:col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Trans>Product categories</Trans>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isTreeLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-1/2 rounded-md" />
                  <Skeleton className="h-6 w-1/3 rounded-md" />
                  <Skeleton className="h-6 w-1/2 rounded-md" />
                  <Skeleton className="h-6 w-1/3 rounded-md" />
                  <Skeleton className="h-6 w-1/2 rounded-md" />
                  <Skeleton className="h-6 w-1/3 rounded-md" />
                </div>
              ) : (
                <Tree
                  indent={indent}
                  tree={tree}
                  aria-busy={isTreeLoading}
                  className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
                >
                  {tree.getItems().map((item) => {
                    const id = item.getId() as string;
                    const numericId = /^\d+$/.test(id) ? Number(id) : null;
                    const isSelected =
                      numericId != null && selectedId === numericId;
                    const categoryForCount =
                      numericId != null
                        ? findCategoryById(categories, numericId)
                        : null;
                    const productCount =
                      categoryForCount?.products?.length ?? 0;
                    return (
                      <TreeItem key={id} item={item}>
                        <TreeItemLabel
                          aria-selected={isSelected}
                          className={cn(
                            'w-full justify-between rounded-md px-2.5',
                            isSelected
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent'
                          )}
                          onClick={() =>
                            !isTreeLoading &&
                            numericId != null &&
                            setSelectedId(numericId)
                          }
                        >
                          <span className="flex w-full items-center justify-between">
                            <span>{item.getItemData().name}</span>
                            {numericId != null ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="ml-2 rounded-sm px-1.5 py-0 text-[10px] leading-none"
                                    >
                                      {productCount}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" align="center">
                                    <span>{`${productCount} products in this category`}</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : null}
                          </span>
                        </TreeItemLabel>
                      </TreeItem>
                    );
                  })}
                </Tree>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 md:col-span-6">
          <Card className="min-h-[200px]">
            <CardHeader>
              <CardTitle className="text-base">
                <Trans>Category details</Trans>
              </CardTitle>
              <CardDescription>
                <Trans>
                  Edit the category title and save to update the products in
                  this category.
                </Trans>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedNode ? (
                <form
                  className="grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setTimeout(() => {
                      onChange(
                        updateCategoryTitle(
                          categories,
                          selectedNode.id,
                          titleInput
                        )
                      );
                      setIsSubmitting(false);
                    }, 250);
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="title">
                      <Trans>Title</Trans>
                    </Label>
                    <Input
                      id="title"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </form>
              ) : (
                <div className="text-muted-foreground text-center text-base">
                  <Trans>Select a category to edit</Trans>
                </div>
              )}
            </CardContent>
            {selectedNode && (
              <CardFooter className="flex justify-end border-t-0">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      <Trans>Saving...</Trans>
                    </>
                  ) : (
                    <Trans>Save changes</Trans>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <Card className="min-h-[150px]">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedNode ? (
                  <Trans>Products in {categoryTitle}</Trans>
                ) : (
                  <Trans>Products</Trans>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {selectedNode ? (
                selectedNode.products && selectedNode.products.length > 0 ? (
                  <ProductsList
                    products={selectedNode.products}
                    selectedProductId={selectedProductId}
                    onEdit={(p) => {
                      setSelectedProductId(p.id);
                      setPendingEdit({
                        categoryId: selectedNode.id,
                        product: p
                      });
                    }}
                    onDelete={(p) =>
                      setPendingDelete({
                        categoryId: selectedNode.id,
                        product: p
                      })
                    }
                  />
                ) : (
                  <div className="text-muted-foreground text-center text-base">
                    <Trans>No products in this category</Trans>
                  </div>
                )
              ) : (
                <div className="text-muted-foreground text-center text-base">
                  <Trans>Select a category to view products</Trans>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <DeleteProductDialog
        open={!!pendingDelete}
        productTitle={pendingProductTitle}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            onChange(
              deleteProduct(
                categories,
                pendingDelete.categoryId,
                pendingDelete.product.id
              )
            );
          }
          setPendingDelete(null);
        }}
      />
      <EditProductModal
        open={!!pendingEdit}
        initialTitle={pendingEdit?.product.title ?? ''}
        onOpenChange={(open) => !open && setPendingEdit(null)}
        onSave={(newTitle) => {
          if (pendingEdit) {
            onChange(
              updateProductTitle(
                categories,
                pendingEdit.categoryId,
                pendingEdit.product.id,
                newTitle
              )
            );
          }
          setPendingEdit(null);
        }}
      />
    </>
  );
}
