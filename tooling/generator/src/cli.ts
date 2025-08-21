#!/usr/bin/env node

import { readFileSync } from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';
import { generatePackage } from './generator';

const packageJson = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

async function main() {
  console.log(chalk.blue(`\n🚀 ${packageJson.name} v${packageJson.version}`));
  console.log(chalk.gray('Generate new packages for your Turborepo monorepo\n'));

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
    console.log(chalk.yellow('Generation cancelled'));
    return;
  }

  try {
    const packagePath = await generatePackage(response);
    console.log(chalk.green(`\n✅ Package created successfully at: ${packagePath}`));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray(`1. cd ${packagePath}`));
    console.log(chalk.gray('2. pnpm install'));
    console.log(chalk.gray('3. pnpm build'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to generate package:'), error);
    process.exit(1);
  }
}

main().catch(console.error);
