import * as React from 'react';

import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import { Plural, Trans } from '@lingui/react/macro';
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusCircleIcon,
  PlusIcon,
  Trash2Icon
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree';

import { cn } from '@/lib/utils';

import { AddCategoryModal } from './add-category-modal';
import { AddProductModal } from './add-product-modal';
import { DeleteCategoryDialog } from './delete-category-dialog';
import { DeleteProductDialog } from './delete-product-dialog';
import { EditCategoryModal } from './edit-category-modal';
import { EditProductModal } from './edit-product-modal';
import { ProductsList } from './products-list';

export type Product = {
  id: number;
  title: string;
  category_id: number;
};

export type ProductCategory = {
  id: number;
  title: string;
  parent_id: number | null;
  children: ProductCategory[];
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

function getMaxCategoryId(nodes: ProductCategory[]): number {
  let maxId = 0;
  const visit = (list: ProductCategory[]) => {
    for (const node of list) {
      if (node.id > maxId) maxId = node.id;
      if (node.children && node.children.length) visit(node.children);
    }
  };
  visit(nodes);
  return maxId;
}

function addSubcategory(
  nodes: ProductCategory[],
  parentId: number,
  newId: number,
  title: string
): ProductCategory[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      const nextChildren = node.children ? [...node.children] : [];
      nextChildren.push({
        id: newId,
        title,
        parent_id: parentId,
        children: []
      });
      return { ...node, children: nextChildren };
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: addSubcategory(node.children, parentId, newId, title)
      };
    }
    return node;
  });
}

function addRootCategory(
  nodes: ProductCategory[],
  newId: number,
  title: string
): ProductCategory[] {
  return [...nodes, { id: newId, title, parent_id: null, children: [] }];
}

function deleteCategory(
  nodes: ProductCategory[],
  id: number
): ProductCategory[] {
  const filtered = nodes
    .filter((n) => n.id !== id)
    .map((n) =>
      n.children && n.children.length
        ? { ...n, children: deleteCategory(n.children, id) }
        : n
    );
  return filtered;
}

interface ProductTreeEditorProps {
  categories: ProductCategory[];
  products: Product[];
  onCategoriesChange: (next: ProductCategory[]) => void;
  onProductsChange: (next: Product[]) => void;
}

type TreeItemData = { name: string; children?: string[]; nodeId?: number };

export function ProductTreeEditor({
  categories,
  products,
  onCategoriesChange,
  onProductsChange
}: ProductTreeEditorProps) {
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  // We no longer highlight a selected product

  const indent = 20;

  const { itemsMap, rootId, initiallyExpanded } = React.useMemo(() => {
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
    // Expand root and all top-level categories by default so items render
    const expanded = ['root', ...topLevelIds];
    return { itemsMap: map, rootId: 'root', initiallyExpanded: expanded };
  }, [categories]);

  const treeKey = React.useMemo(() => {
    const ids: number[] = [];
    const visit = (nodes: ProductCategory[]) => {
      for (const n of nodes) {
        ids.push(n.id);
        if (n.children && n.children.length) visit(n.children);
      }
    };
    visit(categories);
    return ids.sort((a, b) => a - b).join('-');
  }, [categories]);

  const tree = useTree<TreeItemData>({
    initialState: { expandedItems: initiallyExpanded },
    indent,
    rootItemId: rootId,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      // Return a stable fallback object for missing ids to avoid async loading paths
      getItem: (itemId) =>
        itemsMap[itemId] ?? { name: 'unknown', children: [] },
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
  const [pendingCreateForCategoryId, setPendingCreateForCategoryId] =
    React.useState<number | null>(null);
  const [pendingAddSubcategoryForId, setPendingAddSubcategoryForId] =
    React.useState<number | null>(null);
  const [pendingAddRootCategory, setPendingAddRootCategory] =
    React.useState(false);
  const [pendingEditCategory, setPendingEditCategory] = React.useState<{
    categoryId: number;
    initialTitle: string;
  } | null>(null);
  const [pendingDeleteCategory, setPendingDeleteCategory] = React.useState<{
    categoryId: number;
    title: string;
  } | null>(null);
  const categoryTitle = selectedNode ? selectedNode.title : '';
  const pendingProductTitle = pendingDelete?.product.title ?? '';
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
                <div className="space-y-2 pl-4">
                  <Skeleton className="h-7 w-1/2 rounded-md" />
                  <Skeleton className="h-7 w-1/3 rounded-md" />
                  <Skeleton className="h-7 w-1/2 rounded-md" />
                  <Skeleton className="h-7 w-1/3 rounded-md" />
                </div>
              ) : categories.length === 0 ? (
                <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 py-4">
                  <div className="text-muted-foreground text-center text-sm text-pretty">
                    <Trans>
                      No categories yet. Add a category to get started.
                    </Trans>
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-1"
                    onClick={() => setPendingAddRootCategory(true)}
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" />
                    <Trans>Add category</Trans>
                  </Button>
                </div>
              ) : (
                <Tree
                  key={treeKey}
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
                    const productCount =
                      numericId != null
                        ? products.filter((p) => p.category_id === numericId)
                            .length
                        : 0;

                    return (
                      <TreeItem key={id} item={item}>
                        <TreeItemLabel
                          aria-selected={isSelected}
                          className={cn(
                            'group w-full justify-between rounded-md px-2.5',
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
                            <span className="flex items-center gap-2">
                              <span>{item.getItemData().name}</span>
                              {numericId != null ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className="rounded-sm px-1.5 py-0 text-[10px] leading-none"
                                      >
                                        {productCount}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="center">
                                      <Plural
                                        value={productCount}
                                        _0="No products in this category"
                                        one="# product in this category"
                                        other="# products in this category"
                                      />
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : null}
                            </span>

                            {numericId != null ? (
                              <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      aria-label="Category actions"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <MoreHorizontalIcon className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    side="right"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setPendingAddSubcategoryForId(
                                          numericId
                                        );
                                      }}
                                    >
                                      <PlusIcon className="mr-2 size-4" />
                                      <Trans>Add subcategory</Trans>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        const node = findCategoryById(
                                          categories,
                                          numericId
                                        );
                                        setPendingEditCategory({
                                          categoryId: numericId,
                                          initialTitle: node?.title ?? ''
                                        });
                                      }}
                                    >
                                      <PencilIcon className="mr-2 size-4" />
                                      <Trans>Edit category</Trans>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => {
                                        const node = findCategoryById(
                                          categories,
                                          numericId
                                        );
                                        setPendingDeleteCategory({
                                          categoryId: numericId,
                                          title: node?.title ?? ''
                                        });
                                      }}
                                    >
                                      <Trash2Icon className="mr-2 size-4" />
                                      <Trans>Delete category</Trans>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </span>
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
                products.filter((p) => p.category_id === selectedNode.id)
                  .length > 0 ? (
                  <ProductsList
                    products={products.filter(
                      (p) => p.category_id === selectedNode.id
                    )}
                    onEdit={(p) => {
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
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="text-muted-foreground text-center text-sm text-pretty">
                      <Trans>
                        No products in this category. Add products to this
                        category by clicking the button below.
                      </Trans>
                    </div>

                    <Button
                      variant="secondary"
                      className="mt-2"
                      onClick={() => {
                        setPendingCreateForCategoryId(selectedNode.id);
                      }}
                    >
                      <PlusCircleIcon className="mr-2 h-4 w-4" />
                      <Trans>Add product</Trans>
                    </Button>
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
            onProductsChange(
              products.filter((p) => p.id !== pendingDelete.product.id)
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
            onProductsChange(
              products.map((p) =>
                p.id === pendingEdit.product.id ? { ...p, title: newTitle } : p
              )
            );
            // no selection highlight
          }
          setPendingEdit(null);
        }}
      />
      <AddProductModal
        open={pendingCreateForCategoryId != null}
        onOpenChange={(open) => !open && setPendingCreateForCategoryId(null)}
        onSave={(newTitle) => {
          if (pendingCreateForCategoryId != null && selectedNode) {
            const newId = Math.max(0, ...products.map((p) => p.id)) + 1;
            onProductsChange([
              ...products,
              { id: newId, title: newTitle, category_id: selectedNode.id }
            ]);
          }
          setPendingCreateForCategoryId(null);
        }}
      />
      <AddCategoryModal
        open={pendingAddSubcategoryForId != null}
        onOpenChange={(open) => !open && setPendingAddSubcategoryForId(null)}
        onSave={(newTitle) => {
          if (pendingAddSubcategoryForId != null) {
            const newId = getMaxCategoryId(categories) + 1;
            onCategoriesChange(
              addSubcategory(
                categories,
                pendingAddSubcategoryForId,
                newId,
                newTitle.trim()
              )
            );
          }
          setPendingAddSubcategoryForId(null);
        }}
      />
      <AddCategoryModal
        open={pendingAddRootCategory}
        onOpenChange={(open) => !open && setPendingAddRootCategory(false)}
        onSave={(newTitle) => {
          const newId = getMaxCategoryId(categories) + 1;
          onCategoriesChange(
            addRootCategory(categories, newId, newTitle.trim())
          );
          setPendingAddRootCategory(false);
        }}
      />
      <EditCategoryModal
        open={pendingEditCategory != null}
        initialTitle={pendingEditCategory?.initialTitle ?? ''}
        onOpenChange={(open) => !open && setPendingEditCategory(null)}
        onSave={(newTitle) => {
          if (pendingEditCategory) {
            onCategoriesChange(
              updateCategoryTitle(
                categories,
                pendingEditCategory.categoryId,
                newTitle.trim()
              )
            );
          }
          setPendingEditCategory(null);
        }}
      />
      <DeleteCategoryDialog
        open={pendingDeleteCategory != null}
        categoryTitle={pendingDeleteCategory?.title ?? ''}
        onOpenChange={(open) => !open && setPendingDeleteCategory(null)}
        onConfirm={() => {
          if (pendingDeleteCategory) {
            // collect all descendant ids including the category itself
            const collectIds = (
              nodes: ProductCategory[],
              id: number
            ): number[] => {
              const result: number[] = [];
              const traverse = (list: ProductCategory[]) => {
                for (const n of list) {
                  if (n.id === id) {
                    const gather = (node: ProductCategory) => {
                      result.push(node.id);
                      node.children.forEach(gather);
                    };
                    gather(n);
                  } else if (n.children.length) {
                    traverse(n.children);
                  }
                }
              };
              traverse(nodes);
              return result;
            };
            const idsToRemove = collectIds(
              categories,
              pendingDeleteCategory.categoryId
            );
            onCategoriesChange(
              deleteCategory(categories, pendingDeleteCategory.categoryId)
            );
            onProductsChange(
              products.filter((p) => !idsToRemove.includes(p.category_id))
            );
            if (selectedId === pendingDeleteCategory.categoryId) {
              setSelectedId(null);
            }
          }
          setPendingDeleteCategory(null);
        }}
      />
    </>
  );
}
