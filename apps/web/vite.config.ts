import path from 'path';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file from root directory (Turbo loose mode support)
  const env = loadEnv(mode, '../../', '');

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
      __VITE_API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:3001'),
    },

    server: {
      port: 5173,
      host: 'localhost',
      cors: {
        origin: [env.VITE_API_URL || 'http://localhost:3001'],
        credentials: true,
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          credentials: 'include',
        },
      },
      hmr: {
        overlay: false,
      },
    },

    optimizeDeps: {
      include: [
        '@tanstack/react-query',
        '@trpc/client',
        '@trpc/react-query',
        'better-auth/react',
        'better-auth/client/plugins',
      ],
      exclude: ['@prisma/client', '@repo/database', '@repo/auth/server'],
    },

    build: {
      sourcemap: false,
      reportCompressedSize: false,
      rollupOptions: {
        external: ['@prisma/client', '@repo/database'],
      },
    },

    // Add aggressive external handling for server-only modules
    ssr: {
      external: ['@prisma/client', '@repo/database'],
    },

    // Load environment variables from root .env file
    envDir: '../../',
  };
});
