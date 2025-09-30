import path from 'path';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
// Using PostCSS for Tailwind processing
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file from root directory (Turbo loose mode support)
  const env = loadEnv(mode, '../../', '');
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';

  // For unified deployment, don't use VITE_API_URL in production builds
  // This forces the frontend to use relative URLs (same origin)
  const apiUrl = isProduction ? undefined : (env.VITE_API_URL || 'http://localhost:3001');

  return {
    logLevel: 'warn',
    clearScreen: false,
    plugins: [TanStackRouterVite(), react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/lib': path.resolve(__dirname, './src/lib'),
      },
    },

    // Define environment variables for the browser
    define: {
      global: 'globalThis',
      // In production, don't set VITE_API_URL to force relative URLs
      __VITE_API_URL__: JSON.stringify(apiUrl),
    },

    server: {
      port: 5173,
      host: 'localhost',
      // Only configure CORS and proxy in development
      ...(isDevelopment && {
        cors: {
          origin: [apiUrl || 'http://localhost:3001'],
          credentials: true,
        },
        proxy: {
          '/api': {
            target: apiUrl || 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
            credentials: 'include',
          },
        },
      }),
      hmr: {
        overlay: false,
      },
      // Suppress source map warnings in development
      open: false,
      strictPort: false,
    },

    optimizeDeps: {
      include: [
        'better-auth/react',
        'better-auth/client/plugins',
        'react/jsx-dev-runtime',
        '@tanstack/react-router',
        'react-dom/client',
      ],
      exclude: ['@prisma/client', '@repo/database', '@repo/auth/server', '@repo/logger', '@repo/trpc/server'],
    },

    build: {
      sourcemap: false,
      reportCompressedSize: false,
      rollupOptions: {
        external: ['@prisma/client', '@repo/database', '@repo/logger', '@repo/trpc/server'],
      },
    },

    // Keep CSS source maps for Tailwind functionality
    css: {
      devSourcemap: true,
    },

    // Configure esbuild to handle source maps properly
    esbuild: {
      sourcemap: isDevelopment ? false : 'external',
    },

    // Add aggressive external handling for server-only modules
    ssr: {
      external: ['@prisma/client', '@repo/database', '@repo/logger', '@repo/trpc/server'],
    },

    // Load environment variables from root .env file
    envDir: '../../',
  };
});
