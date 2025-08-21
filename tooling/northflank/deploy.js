import { existsSync, readFileSync } from 'fs';
import { intro, note, outro } from '@clack/prompts';
import { consola } from 'consola';
import process from 'process';

async function deploy() {
  intro('📝 Deployment Instructions');

  if (!existsSync('.northflank.json')) {
    consola.error('Configuration file .northflank.json not found!');
    consola.info('Please run "pnpm setup" first to create the configuration.');
    outro('Setup required');
    process.exit(1);
  }

  let config;
  try {
    config = JSON.parse(readFileSync('.northflank.json', 'utf-8'));
  } catch (error) {
    consola.error('Failed to parse .northflank.json:', error.message);
    outro('Configuration error');
    process.exit(1);
  }

  note(
    `
Manual Setup in Northflank Dashboard:

1. Go to https://app.northflank.com
2. Create project: "${config.projectName}" in US Central
3. Add PostgreSQL addon (free tier)
4. Create API service:
   • Git source: ${config.repoUrl}
   • Build: pnpm install && pnpm db:generate && pnpm turbo build --filter=@repo/api
   • Start: node apps/api/.output/server/index.mjs
   • Port: 3001
5. Create Web service:
   • Git source: ${config.repoUrl} 
   • Build: pnpm install && pnpm turbo build --filter=@repo/web
   • Publish: apps/web/dist
  `,
    'Setup Steps'
  );

  consola.box('Environment Variables', {
    DATABASE_URL: 'From PostgreSQL addon',
    BETTER_AUTH_SECRET: config.authSecret,
    NODE_ENV: 'production',
    VITE_API_URL: config.apiUrl,
    NITRO_PORT: '3001',
  });

  consola.success('Your apps will be at:');
  consola.log(`  • API: ${config.apiUrl}`);
  consola.log(`  • Web: ${config.webUrl}`);

  outro('Ready to deploy! 🚀');
}

deploy().catch(console.error);
