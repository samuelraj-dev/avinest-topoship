import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from './routeTree.gen';

import "./index.css";
import { NotFoundPage } from "./pages/not-found";
import { initTheme } from "./lib/utils/theme";

initTheme();

const router = createRouter({
  routeTree,
  defaultPendingMs: 0,
  defaultPreload: 'intent',
  defaultNotFoundComponent: NotFoundPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
