import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { AuthProvider, useAuth } from './auth';
import { Toaster } from './components/ui/sonner';
import './globals.css';
import { setUnauthorizedHandler } from './api/client';
import { loadCatalog } from './i18n';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    // auth will initially be undefined
    // We'll be passing down the auth state from within a React component
    auth: undefined!
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

  return <RouterProvider router={router} context={{ auth }} />;
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
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
      <Toaster richColors />
    </I18nProvider>
  );
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 1000 * 60 * 1 // 5 minutes
      }
    }
  });

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      </QueryClientProvider>
    </StrictMode>
  );
}
