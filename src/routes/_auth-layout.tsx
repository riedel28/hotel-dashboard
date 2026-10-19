import { Trans } from '@lingui/react/macro';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { AppLogo } from '@/components/app-logo';

export const Route = createFileRoute('/_auth-layout')({
  component: AuthLayout
});

function AuthLayout() {
  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1fr_minmax(30rem,33%)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-primary"
      >
        <Trans>Skip to main content</Trans>
      </a>
      <section className="relative h-32 overflow-hidden sm:h-56 lg:h-auto lg:min-h-screen">
        <img
          src="/login-bg.avif"
          // Keep in step with the preload in index.html
          srcSet="/login-bg-sm.avif 1200w, /login-bg.avif 2400w"
          sizes="(min-width: 1024px) 67vw, 100vw"
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover dark:brightness-75"
        />
        <div className="absolute inset-x-0 bottom-0 hidden flex-col gap-3 bg-linear-to-t from-black/70 to-transparent p-10 pt-32 text-white lg:flex">
          <div className="flex items-center gap-3">
            <AppLogo size="lg" tone="solid" />
            <span className="text-xl font-semibold">
              <Trans>Hotel Dashboard</Trans>
            </span>
          </div>
          <p className="max-w-lg text-white/80">
            <Trans>
              Reservations, rooms and guests — your front office in one place.
            </Trans>
          </p>
        </div>
      </section>
      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex min-h-[calc(100vh-8rem)] flex-col bg-card px-5 py-4 sm:min-h-[calc(100vh-14rem)] sm:px-8 lg:min-h-screen lg:px-12"
      >
        <Outlet />
      </main>
    </div>
  );
}
