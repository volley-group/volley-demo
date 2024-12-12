import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter } from './lib/router';
import { hc, tsrpc, queryClient } from './lib/clients';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log('All env variables:', import.meta.env);

const router = createRouter(queryClient);

const App = () => {
  return <RouterProvider router={router} context={{ queryClient, hc, trpc: tsrpc }} />;
};

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ClerkProvider
          publishableKey={CLERK_KEY}
          routerReplace={(to: string) => router.navigate({ to, replace: true })}
          routerPush={(to: string) => router.navigate({ to, replace: false })}
          afterSignOutUrl="/signin"
          signInUrl="/signin"
          signUpUrl="/signup"
        >
          <App />
        </ClerkProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </StrictMode>
  );
}
