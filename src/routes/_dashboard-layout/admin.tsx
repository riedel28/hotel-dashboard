import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard-layout/admin')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.is_admin) {
      throw redirect({ to: '/' });
    }
  },
  component: AdminLayout
});

function AdminLayout() {
  return <Outlet />;
}
