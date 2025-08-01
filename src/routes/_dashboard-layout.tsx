'use client';

import { useState } from 'react';

import DashboardLayout from '@/layouts/dashboard-layout';
import { LogoutDialog } from '@/routes/_dashboard-layout/-components/logout-dialog';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';

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
  const navigate = Route.useNavigate();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutSuccess = () => {
    navigate({ to: '/auth/login' });
  };

  return (
    <>
      <DashboardLayout onLogout={handleLogout}>
        <Outlet />
      </DashboardLayout>
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onLogoutSuccess={handleLogoutSuccess}
      />
    </>
  );
}
