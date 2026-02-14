import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import { useDocumentTitle } from '@/hooks/use-document-title';

export const Route = createFileRoute('/_dashboard-layout/admin/customers')({
  component: RouteComponent
});

function RouteComponent() {
  const { t } = useLingui();
  useDocumentTitle(t`Customers`);

  return (
    <div>
      <Trans>Hello "/_dashboard-layout/admin/customers"!</Trans>
    </div>
  );
}
