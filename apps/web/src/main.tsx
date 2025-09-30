// @ts-expect-error - TanStack Router exports are available at runtime but TypeScript has resolution issues
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@repo/ui'; // Import UI styles
import './index.css';

// TODO: Re-enable logger import once module resolution is fixed
// import { frontendLogger } from '@repo/logger';
import { TRPCProvider } from './lib/trpc-provider';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({
  routeTree,
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <TRPCProvider>
      <RouterProvider router={router} />
    </TRPCProvider>
  </React.StrictMode>
);
