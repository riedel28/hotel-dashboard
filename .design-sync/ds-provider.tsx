/**
 * Preview provider for design-sync — the context chain every preview card is
 * wrapped in (`cfg.provider.component`).
 *
 * This module is part of the Vite library entry rather than an `extraEntries`
 * esbuild input, because only the Vite build has `lingui()` — which is what
 * turns the compiled `.po` catalog into an importable ES module.
 *
 * Three contexts, each earning its place from a real render failure:
 *
 *  - I18n — 16 components call Lingui macros (`<Trans>`, `useLingui`) and read
 *    from an activated catalog at render time.
 *  - Theme — `Toaster` calls `useTheme`, which throws outside a ThemeProvider
 *    and unmounts the whole cell.
 *  - Router — `Link`, `BreadcrumbLink` and `NotFound` wrap TanStack Router's
 *    Link; without a router every path throws "Cannot read properties of null
 *    (reading 'stores')" and the card paints blank.
 *
 * The catalog is activated at module scope on purpose: this module exists only
 * to host previews, so no component can render before activation. (App code
 * must NOT do this — see CLAUDE.md.)
 */
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterContextProvider
} from '@tanstack/react-router';
import type * as React from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { messages } from '@/locales/en/messages.po';

i18n.loadAndActivate({ locale: 'en', messages });

// Routes the previews actually link to. `RouterContextProvider` exposes the
// router to `useRouter()` without rendering the matched route, which is what
// lets the preview tree render normally underneath it — plain `RouterProvider`
// would render the route instead of `children`.
const rootRoute = createRootRoute();
const previewRouter = createRouter({
  routeTree: rootRoute.addChildren(
    [
      '/',
      '/reservations',
      '/payments',
      '/properties',
      '/properties/archive',
      '/customers/$customerId',
      '/auth/forgot-password'
    ].map((path) =>
      createRoute({
        getParentRoute: () => rootRoute,
        path,
        component: () => null
      })
    )
  ),
  history: createMemoryHistory({ initialEntries: ['/'] })
});

export function DsProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider i18n={i18n}>
      <ThemeProvider defaultTheme="light" storageKey="ds-preview.theme">
        <RouterContextProvider router={previewRouter}>
          {children}
        </RouterContextProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
