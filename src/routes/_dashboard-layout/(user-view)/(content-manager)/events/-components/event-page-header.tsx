import { Trans } from '@lingui/react/macro';
import type { ReactNode } from 'react';

import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

/** Home / Events / {title}, the title under it and any actions beside it. */
export function EventPageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink to="/">
              <Trans>Home</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink to="/events">
              <Trans>Events</Trans>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Spaced by the page's own column */}
      <PageHeader
        title={title}
        description={description}
        actions={actions}
        className="mb-0"
      />
    </div>
  );
}
