import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_dashboard-layout/products')({
  component: () => (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">
          <FormattedMessage
            id="products.inventory"
            defaultMessage="Inventory"
          />
        </h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-xs"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            <FormattedMessage
              id="products.noProducts"
              defaultMessage="You have no products"
            />
          </h3>
          <p className="text-muted-foreground text-sm">
            <FormattedMessage
              id="products.startSelling"
              defaultMessage="You can start selling as soon as you add a product."
            />
          </p>
          <Button className="mt-4">
            <FormattedMessage
              id="products.addProduct"
              defaultMessage="Add Product"
            />
          </Button>
        </div>
      </div>
    </>
  )
});
