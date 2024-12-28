'use client';

import { useAuth } from '@/auth';
import DashboardLayout from '@/layouts/dashboard-layout';
import {
  Outlet,
  createFileRoute,
  redirect,
  useRouter
} from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard-layout')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href
        }
      });
    }
  },
  component: Layout
});

export default function Layout() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const auth = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      auth.logout().then(() => {
        router.invalidate().finally(() => {
          navigate({ to: '/auth/login' });
        });
      });
    }
  };

  return (
    <DashboardLayout onLogout={handleLogout}>
      <Outlet />
    </DashboardLayout>
  );
}
