import { useQuery } from '@tanstack/react-query';

import { productCategoriesQueryOptions } from '@/api/product-categories';

import { Route as ProductsRoute } from '../index';
import { categoryLineage } from './category-tree-data';

// The category picked in the URL, checked against the current property's
// categories. An id that isn't among them (stale link, deleted category,
// property switch) counts as no selection — for every consumer alike.
export function useSelectedCategory() {
  const requestedId = ProductsRoute.useSearch().category_id ?? null;
  const { data: categories, isLoading } = useQuery(
    productCategoriesQueryOptions
  );

  // The selected category first, then its ancestors.
  const lineage =
    categories && requestedId != null
      ? categoryLineage(categories, requestedId)
      : [];

  return {
    categoryId: lineage[0]?.id ?? null,
    // Titles from the top-level category down to the selected one.
    path: lineage.map((category) => category.title).reverse(),
    // Whether an id from the URL is still waiting for the categories to load.
    isResolving: requestedId != null && isLoading
  };
}
