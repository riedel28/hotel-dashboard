import { Trans } from '@lingui/react/macro';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { LanguageSwitcher } from './_auth-layout/-components/language-switcher';

export const Route = createFileRoute('/_auth-layout')({
  component: AuthLayout
});

function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[2fr_1fr]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-primary"
      >
        <Trans>Skip to main content</Trans>
      </a>
      <section className="relative min-h-72 overflow-hidden lg:min-h-screen">
        <img
          src="/login-bg.avif"
          alt="Login background"
          fetchPriority="high"
          className="h-full w-full object-cover"
          sizes="(min-width: 1024px) 67vw, 100vw"
        />
      </section>
      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex min-h-[calc(100vh-18rem)] flex-col bg-card px-5 py-4 sm:px-8 lg:min-h-screen"
      >
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <Outlet />
      </main>
    </div>
  );
}
