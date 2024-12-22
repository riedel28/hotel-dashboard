import { StrictMode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';

import './globals.css';
// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { AuthProvider, useAuth } from './auth'

// Create a new router instance
const router = createRouter({
  routeTree, context: {
    // auth will initially be undefined
    // We'll be passing down the auth state from within a React component
    auth: undefined!,
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });


  function InnerApp() {
    const auth = useAuth()
    return <RouterProvider router={router} context={{ auth }} />
  }

  function App() {
    return (
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    )
  }

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
}
