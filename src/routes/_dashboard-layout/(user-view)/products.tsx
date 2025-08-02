import { createFileRoute } from '@tanstack/react-router';
import { FormattedMessage } from 'react-intl';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '../../components/ui/breadcrumb';
import { Button } from '../../components/ui/button';

export const Route = createFileRoute('/_dashboard-layout/(user-view)/products')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <FormattedMessage id="breadcrumb.home" defaultMessage="Home" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <FormattedMessage id="products.title" defaultMessage="Products" />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            <FormattedMessage id="products.title" defaultMessage="Products" />
          </h1>
          <Button>
            <FormattedMessage
              id="products.addProduct"
              defaultMessage="Add Product"
            />
          </Button>
        </div>
        <div className="text-muted-foreground">
          <FormattedMessage
            id="products.noProducts"
            defaultMessage="You have no products"
          />
        </div>
        <div className="text-muted-foreground">
          <FormattedMessage
            id="products.startSelling"
            defaultMessage="You can start selling as soon as you add a product."
          />
        </div>
      </div>
    </div>
  );
}
