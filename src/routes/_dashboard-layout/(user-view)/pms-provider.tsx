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

export const Route = createFileRoute('/_dashboard-layout/(user-view)/pms-provider')({
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
              <FormattedMessage
                id="pmsProvider.title"
                defaultMessage="PMS Provider"
              />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <FormattedMessage
          id="pmsProvider.title"
          defaultMessage="Hello '/_dashboard-layout/pms-provider'!"
        />
      </div>
    </div>
  );
}
