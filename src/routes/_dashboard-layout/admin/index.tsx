import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import { BuildingIcon, UsersIcon } from 'lucide-react';

import { useAuth } from '@/auth';
import { PageHeader } from '@/components/page-header';
import { useDocumentTitle } from '@/hooks/use-document-title';
import {
  type QuickAction,
  QuickActions
} from '@/routes/_dashboard-layout/-components/quick-actions';

export const Route = createFileRoute('/_dashboard-layout/admin/')({
  component: AdminStartPage
});

function AdminStartPage() {
  const { t } = useLingui();
  useDocumentTitle(t`Admin Dashboard`);
  const auth = useAuth();

  const quickActions: QuickAction[] = [
    {
      title: t`Properties`,
      description: t`Manage hotel properties, view details, and configure settings`,
      icon: BuildingIcon,
      to: '/admin/properties'
    },
    {
      title: t`Customers`,
      description: t`View and manage customer accounts, profiles, and history`,
      icon: UsersIcon,
      to: '/admin/customers'
    }
  ];

  const userName = auth.user?.first_name;

  return (
    <div>
      <PageHeader
        title={<Trans>Admin Dashboard</Trans>}
        description={<Trans>Welcome back, {userName}!</Trans>}
      />

      <QuickActions actions={quickActions} />
    </div>
  );
}
