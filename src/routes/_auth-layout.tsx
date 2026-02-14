import { createFileRoute, Outlet } from '@tanstack/react-router';
import { LanguageSwitcher } from './_auth-layout/-components/language-switcher';

export const Route = createFileRoute('/_auth-layout')({
  component: AuthLayout
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden md:block lg:w-1/2 xl:w-2/3">
        <img
          src="/login-bg.avif"
          alt="Login background"
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2 xl:w-1/3">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
