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

type ProductCategoryLocal = ProductCategory;

// <= 10 items
const initialProductCategories: ProductCategoryLocal[] = [
  {
    id: 1,
    title: 'Welcome',
    children: [],
    products: [
      { id: 101, title: 'Welcome Pack' },
      { id: 102, title: 'City Map' },
      { id: 103, title: 'Welcome Drink' }
    ]
  },
  {
    id: 2,
    title: 'Room Service',
    children: [
      {
        id: 3,
        title: 'Breakfast Options',
        children: [],
        products: [
          { id: 201, title: 'Continental Breakfast' },
          { id: 202, title: 'Vegan Breakfast' },
          { id: 206, title: 'Gluten-Free Breakfast' }
        ]
      },
      {
        id: 4,
        title: 'Evening Menu',
        children: [],
        products: [
          { id: 203, title: 'Pasta Bolognese' },
          { id: 204, title: 'Grilled Salmon' },
          { id: 207, title: 'Steak Frites' },
          { id: 208, title: 'Chicken Curry' }
        ]
      }
    ],
    products: [{ id: 205, title: 'Late-night Snack' }]
  },
  {
    id: 5,
    title: 'Amenities',
    children: [
      {
        id: 6,
        title: 'Spa & Wellness',
        children: [],
        products: [
          { id: 301, title: 'Full Body Massage' },
          { id: 302, title: 'Facial Treatment' },
          { id: 305, title: 'Aromatherapy Session' }
        ]
      },
      {
        id: 7,
        title: 'Gym Access',
        children: [],
        products: [
          { id: 303, title: 'Personal Training Session' },
          { id: 306, title: 'Yoga Class' },
          { id: 307, title: 'Spin Class' }
        ]
      }
    ],
    products: []
  },
  {
    id: 8,
    title: 'Dining',
    children: [
      {
        id: 9,
        title: 'Restaurant',
        children: [],
        products: [
          { id: 401, title: 'Chef’s Special' },
          { id: 404, title: 'Tasting Menu' }
        ]
      },
      {
        id: 10,
        title: 'Lobby Bar',
        children: [],
        products: [
          { id: 402, title: 'Signature Cocktail' },
          { id: 405, title: 'Craft Beer Flight' }
        ]
      }
    ],
    products: [{ id: 403, title: 'Seasonal Menu' }]
  }
];

function ProductsPage() {
  const [categories, setCategories] = React.useState<ProductCategoryLocal[]>(
    initialProductCategories
  );

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

      <ProductTreeEditor categories={categories} onChange={setCategories} />
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/products/'
)({
  component: ProductsPage
});
