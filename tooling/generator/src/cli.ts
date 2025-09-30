#!/usr/bin/env node

import { readFileSync } from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import { devLogger } from '@repo/logger';
import { generatePackage } from './generator';

const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

async function main() {
  devLogger.startup(`${packageJson.name} v${packageJson.version}`);
  devLogger.info('Generate new packages for your Turborepo monorepo');

  const response = await prompts([
    {
      type: 'select',
      name: 'type',
      message: 'What type of package do you want to create?',
      choices: [
        { title: 'Library Package', value: 'package', description: 'A shared TypeScript library' },
        { title: 'Tooling Package', value: 'tooling', description: 'A tooling/utility package' },
      ],
    },
    {
      type: 'text',
      name: 'name',
      message: 'Package name:',
      initial: 'my-package',
      validate: (value: string) => {
        if (!value.trim()) return 'Package name is required';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Package name must be lowercase with hyphens only';
        return true;
      },
    },
    {
      type: 'text',
      name: 'description',
      message: 'Package description:',
      initial: (prev: string, values: any) => `A new ${values.type} package`,
    },
    {
      type: 'text',
      name: 'displayName',
      message: 'Display name:',
      initial: (prev: string, values: any) => values.name.replace(/-/g, ' '),
    },
  ]);

  if (!response.type || !response.name) {
    devLogger.warn('Generation cancelled');
    return;
  }

  try {
    const packagePath = await generatePackage(response);
    devLogger.success(`Package created successfully at: ${packagePath}`);
    devLogger.info('Next steps:');
    devLogger.info(`1. cd ${packagePath}`);
    devLogger.info('2. pnpm install');
    devLogger.info('3. pnpm build');
  } catch (error) {
    devLogger.error(`Failed to generate package: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main().catch((error) => {
  devLogger.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
