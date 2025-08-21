// Simple environment variable usage with Turbo loose mode

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
// Load .env file explicitly for Nitro
import { loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '../..');

// Load environment variables from root .env
const env = loadEnv('development', rootDir, '');

// Merge with process.env
Object.assign(process.env, env);

export default defineNitroConfig({
  compatibilityDate: '2025-08-19',
  srcDir: 'src',
  logLevel: process.env.NODE_ENV === 'development' ? 3 : 1,

  devServer: {
    port: Number.parseInt(process.env.PORT || process.env.NITRO_PORT || '3001'),
    host: process.env.NITRO_HOST || 'localhost',
  },

  // Also ensure runtime port is set
  runtimeConfig: {
    nitro: {
      port: Number.parseInt(process.env.PORT || process.env.NITRO_PORT || '3001'),
    },
  },

  devtools: { enabled: false },
  experimental: {
    wasm: false,
  },

  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
      },
    },
  },
});
