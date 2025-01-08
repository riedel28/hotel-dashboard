import AuthLayout from '@/layouts/auth-layout';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth-layout')({
  component: Layout
});

function Layout() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
