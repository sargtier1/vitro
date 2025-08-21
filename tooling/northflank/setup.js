import { writeFileSync } from 'fs';
import { intro, isCancel, outro, password, text } from '@clack/prompts';
import { consola } from 'consola';
import process from 'process';

async function setup() {
  if (!process.stdin.isTTY) {
    consola.error('This script requires an interactive terminal. Please run in a TTY environment.');
    process.exit(1);
  }

  intro('🚀 Northflank Setup');

  const projectName = await text({
    message: 'Project name:',
    defaultValue: 'vitro-app',
  });

  if (isCancel(projectName)) {
    outro('Setup cancelled');
    process.exit(0);
  }

  const repoUrl = await text({
    message: 'GitHub repo URL:',
    placeholder: 'https://github.com/username/repo',
  });

  if (isCancel(repoUrl)) {
    outro('Setup cancelled');
    process.exit(0);
  }

  const authSecret = await password({
    message: 'Auth secret (32+ chars):',
  });

  if (isCancel(authSecret)) {
    outro('Setup cancelled');
    process.exit(0);
  }

  // Save config
  const config = {
    projectName,
    repoUrl,
    authSecret,
    region: 'us-central',
    apiUrl: `https://api-${projectName}.northflank.app`,
    webUrl: `https://web-${projectName}.northflank.app`,
  };

  writeFileSync('.northflank.json', JSON.stringify(config, null, 2));

  consola.success('Config saved!');
  consola.info('Next: Run pnpm infra:deploy');

  outro('Setup complete! 🚀');
}

setup().catch(console.error);
