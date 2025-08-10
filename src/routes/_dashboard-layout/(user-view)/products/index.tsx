import * as React from 'react';

import { Trans } from '@lingui/react/macro';
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
  type ProductCategory,
  ProductTreeEditor
} from './-components/product-tree-editor';
import type { Product } from './-components/product-tree-editor';

type ProductCategoryLocal = ProductCategory;
type ProductLocal = Product;

// <= 10 items
const initialCategories: ProductCategoryLocal[] = [
  {
    id: 1,
    title: 'Welcome',
    parent_id: null,
    children: []
  },
  {
    id: 2,
    title: 'Room Service',
    parent_id: null,
    children: [
      { id: 3, title: 'Breakfast Options', parent_id: 2, children: [] },
      { id: 4, title: 'Evening Menu', parent_id: 2, children: [] }
    ]
  },
  {
    id: 5,
    title: 'Amenities',
    parent_id: null,
    children: [
      { id: 6, title: 'Spa & Wellness', parent_id: 5, children: [] },
      { id: 7, title: 'Gym Access', parent_id: 5, children: [] }
    ]
  },
  {
    id: 8,
    title: 'Dining',
    parent_id: null,
    children: [
      { id: 9, title: 'Restaurant', parent_id: 8, children: [] },
      { id: 10, title: 'Lobby Bar', parent_id: 8, children: [] }
    ]
  }
];

const initialProducts: ProductLocal[] = [
  { id: 101, title: 'Welcome Pack', category_id: 1 },
  { id: 102, title: 'City Map', category_id: 1 },
  { id: 103, title: 'Welcome Drink', category_id: 1 },
  { id: 201, title: 'Continental Breakfast', category_id: 3 },
  { id: 202, title: 'Vegan Breakfast', category_id: 3 },
  { id: 206, title: 'Gluten-Free Breakfast', category_id: 3 },
  { id: 203, title: 'Pasta Bolognese', category_id: 4 },
  { id: 204, title: 'Grilled Salmon', category_id: 4 },
  { id: 207, title: 'Steak Frites', category_id: 4 },
  { id: 208, title: 'Chicken Curry', category_id: 4 },
  { id: 205, title: 'Late-night Snack', category_id: 2 },
  { id: 301, title: 'Full Body Massage', category_id: 6 },
  { id: 302, title: 'Facial Treatment', category_id: 6 },
  { id: 305, title: 'Aromatherapy Session', category_id: 6 },
  { id: 303, title: 'Personal Training Session', category_id: 7 },
  { id: 306, title: 'Yoga Class', category_id: 7 },
  { id: 307, title: 'Spin Class', category_id: 7 },
  { id: 401, title: 'Chef’s Special', category_id: 9 },
  { id: 404, title: 'Tasting Menu', category_id: 9 },
  { id: 402, title: 'Signature Cocktail', category_id: 10 },
  { id: 405, title: 'Craft Beer Flight', category_id: 10 },
  { id: 403, title: 'Seasonal Menu', category_id: 8 }
];

function ProductsPage() {
  const [categories, setCategories] =
    React.useState<ProductCategoryLocal[]>(initialCategories);
  const [products, setProducts] =
    React.useState<ProductLocal[]>(initialProducts);

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

      <ProductTreeEditor
        categories={categories}
        products={products}
        onCategoriesChange={setCategories}
        onProductsChange={setProducts}
      />
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/products/'
)({
  component: ProductsPage
});
