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

  // Serve static files from frontend build
  publicAssets: [
    {
      baseURL: '/',
      dir: resolve(__dirname, '../web/dist'),
      maxAge: 60 * 60 * 24 * 365, // 1 year cache for production
    },
  ],

  devServer: {
    watch: [],
  },

  // Set port in runtimeConfig instead
  runtimeConfig: {
    port: process.env.PORT || '3001',
  },

  experimental: {
    wasm: false,
  },

});
