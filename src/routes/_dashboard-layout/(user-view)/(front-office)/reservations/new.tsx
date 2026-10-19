import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';

import { PageHeader } from '@/components/page-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useDocumentTitle } from '@/hooks/use-document-title';

import { AddReservationForm } from '../reservations/-components/add-reservation-form';

function NewReservationPage() {
  const { t } = useLingui();
  useDocumentTitle(t`New reservation`);

  return (
    <div className="space-y-6">
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
              <BreadcrumbLink to="/reservations">
                <Trans>Reservations</Trans>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <Trans>New reservation</Trans>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageHeader
          title={<Trans>New reservation</Trans>}
          description={<Trans>Enter the booking, then add its guests.</Trans>}
          // Spaced by the page's own column
          className="mb-0"
        />
      </div>

      <AddReservationForm />
    </div>
  );
}

export const Route = createFileRoute(
  '/_dashboard-layout/(user-view)/(front-office)/reservations/new'
)({
  component: NewReservationPage
});
