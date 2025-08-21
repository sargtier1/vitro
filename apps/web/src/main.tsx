import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@repo/ui'; // Import UI styles
import './index.css';

import { frontendLogger } from '@repo/logger';
import { TRPCProvider } from '@repo/trpc/react';
import { config } from './config';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

frontendLogger.info('Initializing React application');

// Create a new router instance
const router = createRouter({
  routeTree,
});

frontendLogger.info('Router configured');

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

frontendLogger.success('React application ready');

root.render(
  <React.StrictMode>
    <TRPCProvider config={{ apiUrl: config.apiUrl }}>
      <RouterProvider router={router} />
    </TRPCProvider>
  </React.StrictMode>
);
