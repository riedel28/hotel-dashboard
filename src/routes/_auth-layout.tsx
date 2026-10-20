import { Trans } from '@lingui/react/macro';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { AppLogo } from '@/components/app-logo';
import { cn } from '@/lib/utils';

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
      <section className="relative h-20 overflow-hidden sm:h-56 lg:h-auto lg:min-h-screen">
        <img
          src="/login-bg.avif"
          // Keep in step with the preload in index.html
          srcSet="/login-bg-sm.avif 1200w, /login-bg.avif 2400w"
          sizes="(min-width: 1024px) 67vw, 100vw"
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover dark:brightness-75"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-linear-to-t from-black/70 to-transparent p-5 text-white lg:p-10 lg:pt-32">
          <div className="flex items-center gap-3">
            <AppLogo size="lg" tone="solid" />
            <span className="text-xl font-semibold">
              <Trans>Hotel Dashboard</Trans>
            </span>
          </div>
          <p className="hidden max-w-lg text-white/80 lg:block">
            <Trans>
              Reservations, rooms and guests — your front office in one place.
            </Trans>
          </p>
        </div>
      </section>
      {/* On touch screens every control here is a 44px target (Apple HIG):
          fields and buttons grow, links and the password toggle get a larger
          hit area without moving. The shared components stay 36px for the
          dashboard. */}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'relative flex min-h-[calc(100vh-5rem)] flex-col bg-card px-5 py-4 sm:min-h-[calc(100vh-14rem)] sm:px-8 lg:min-h-screen lg:px-12',
          'pointer-coarse:**:data-[slot=input]:h-11 pointer-coarse:**:data-[slot=input-group]:h-11',
          'pointer-coarse:[&_[data-slot=button]:not([data-size])]:h-11',
          'pointer-coarse:[&_a:not([data-slot])]:-my-3 pointer-coarse:[&_a:not([data-slot])]:py-3'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
