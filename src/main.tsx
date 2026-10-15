import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { I18nProvider } from '@lingui/react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { toast } from 'sonner';

import { ApiError, setUnauthorizedHandler } from './api/client';
import { AuthProvider, useAuth } from './auth';
import { RouteError } from './components/route-error';
import { ThemeProvider } from './components/theme-provider';

import './globals.css';
import { Toaster } from './components/ui/sonner';
import { loadCatalog } from './i18n';
import { isTransientError } from './lib/load-error';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    // A refresh that fails over data already on screen would otherwise go
    // unnoticed: the old rows stay, nothing says they are old. A first load
    // that fails shows its own error in place, so it isn't toasted.
    onError: (error, query) => {
      if (query.state.data === undefined) return;
      // Signed out: the login page says enough
      if (error instanceof ApiError && [401, 403].includes(error.status ?? 0))
        return;
      const time = i18n.date(new Date(query.state.dataUpdatedAt), {
        timeStyle: 'short'
      });
      // One toast however many queries failed together
      toast.error(t`Couldn't refresh`, {
        id: 'refresh-failed',
        description: t`Showing data from ${time}.`,
        action: {
          label: t`Try again`,
          onClick: () =>
            void queryClient.refetchQueries({
              type: 'active',
              predicate: (failed) => failed.state.status === 'error'
            })
        }
      });
    }
  }),
  defaultOptions: {
    queries: {
      // A dropped connection or a failing server may pass on a second try; a
      // refused request (4xx) won't, so it shows at once
      retry: (failureCount, error) =>
        failureCount < 2 && isTransientError(error),
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
});

const router = createRouter({
  routeTree,
  // Warm a route's loader when a link is hovered or focused, so the common case
  // is that the data has landed by the time the click does.
  defaultPreload: 'intent',
  // Query owns the caching (staleTime above); without this the router would
  // re-run loaders it has just preloaded moments earlier.
  defaultPreloadStaleTime: 0,
  // A failed page shows in its place, inside the sidebar and header
  defaultErrorComponent: RouteError,
  context: {
    // auth will initially be undefined
    // We'll be passing down the auth state from within a React component
    auth: undefined!,
    queryClient
  }
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
function InnerApp() {
  const auth = useAuth();
  const logout = auth.logout;

  React.useEffect(() => {
    const handler = () => {
      void logout()
        .catch((error) => {
          console.error('Auto logout failed', error);
        })
        .finally(() => {
          void router.navigate({
            to: '/auth/login',
            search: {
              redirect: router.state.location.href
            }
          });
        });
    };

    setUnauthorizedHandler(handler);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [logout]);

  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

function App() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const locale = localStorage.getItem('locale') ?? 'en';
    loadCatalog(locale).finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <I18nProvider i18n={i18n}>
      <ThemeProvider defaultTheme="system" storageKey="tanstack.theme">
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
        <Toaster richColors />
      </ThemeProvider>
    </I18nProvider>
  );
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {import.meta.env.DEV && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        )}
      </QueryClientProvider>
    </StrictMode>
  );
}
