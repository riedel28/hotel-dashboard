import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth-layout')({
  component: AuthLayout
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block lg:w-1/2 xl:w-2/3"></div>
      <div className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2 xl:w-1/3">
        <Outlet />
      </div>
    </div>
  );
}
