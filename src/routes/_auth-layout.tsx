import { Trans } from '@lingui/react/macro';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { LanguageSwitcher } from './_auth-layout/-components/language-switcher';

export const Route = createFileRoute('/_auth-layout')({
  component: AuthLayout
});

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:bg-background focus:px-4 focus:py-2 focus:rounded-md focus:ring-2 focus:ring-primary focus:text-foreground"
      >
        <Trans>Skip to main content</Trans>
      </a>
      <div className="hidden lg:block lg:w-1/2 xl:w-2/3" aria-hidden="true">
        <img
          src="/login-bg.avif"
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>
      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2 xl:w-1/3 focus:outline-none"
      >
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
