#!/usr/bin/env node

/**
 * Development startup script with comprehensive logging using @repo/logger
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file to check environment variables
try {
  const envFile = readFileSync(join(__dirname, '.env'), 'utf8');
  const envVars = envFile
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, value] = line.split('=', 2);
      if (key && value) {
        acc[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
      return acc;
    }, {});

  // Set environment variables
  Object.assign(process.env, envVars);
} catch (error) {
  console.warn('⚠️  Warning: Could not load .env file');
}

// Set environment variables for enhanced logging
process.env.NODE_ENV = 'development';
process.env.LOG_ENV = 'true';

console.log('🔧 Building logger package...');

// Build the logger package first
const buildLogger = spawn('pnpm', ['--filter', '@repo/logger', 'build'], {
  cwd: __dirname,
  stdio: 'pipe',
});

await new Promise((resolve, reject) => {
  buildLogger.on('close', (code) => {
    if (code === 0) {
      resolve();
    } else {
      reject(new Error(`Logger build failed with code ${code}`));
    }
  });
  buildLogger.on('error', reject);
});

// Import the logger after building and setting environment variables
const { devLogger, logEnvironment } = await import('./packages/logger/dist/index.mjs');

devLogger.startup('Development environment starting with comprehensive logging');

// Log environment configuration using the logger package
logEnvironment(devLogger);

devLogger.startup('Services to start:');
devLogger.info('Database schema generation');
devLogger.info('API server (Nitro)');
devLogger.info('Web server (Vite)');

// Start the development environment
devLogger.startup('Launching development servers...');

const child = spawn('pnpm', ['dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    FORCE_COLOR: '1',
  },
});

child.on('error', (error) => {
  devLogger.error(`Failed to start development environment: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  devLogger.info(`Development environment stopped with code ${code || 0}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  devLogger.warn('Received SIGINT, shutting down development environment...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  devLogger.warn('Received SIGTERM, shutting down development environment...');
  child.kill('SIGTERM');
});
