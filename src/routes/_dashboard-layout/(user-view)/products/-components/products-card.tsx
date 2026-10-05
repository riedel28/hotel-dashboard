import { Trans } from '@lingui/react/macro';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductsCardProps {
  // Shown above the title: the category path, or its skeleton.
  breadcrumb?: React.ReactNode;
  // Number of products, shown next to the title when above zero.
  count?: number;
  children: React.ReactNode;
}

// The shell every state of the products column shares.
export function ProductsCard({
  breadcrumb,
  count = 0,
  children
}: ProductsCardProps) {
  return (
    <Card className="min-h-[150px]">
      <CardHeader>
        {breadcrumb}
        <CardTitle className="flex items-center gap-2 text-base">
          <Trans>Products</Trans>
          {count > 0 && (
            <Badge
              variant="secondary"
              color="gray"
              size="xs"
              className="tabular-nums"
            >
              {count}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

// Where the selected category sits in the tree, e.g. "Mini-bar / Drinks".
export function CategoryBreadcrumb({ path }: { path: string[] }) {
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {path.map((title, index) => (
          <React.Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className="min-w-0">
              {index === path.length - 1 ? (
                <BreadcrumbPage className="truncate" title={title}>
                  {title}
                </BreadcrumbPage>
              ) : (
                <span className="truncate" title={title}>
                  {title}
                </span>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
