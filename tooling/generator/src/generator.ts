import * as path from 'path';
import chalk from 'chalk';
import * as fs from 'fs-extra';

export interface PackageConfig {
  type: 'package' | 'tooling';
  name: string;
  description: string;
  displayName: string;
}

export async function generatePackage(config: PackageConfig): Promise<string> {
  const repoRoot = findRepoRoot();
  const templateDir = path.join(__dirname, '../templates', config.type);

  // Determine destination based on type
  const destDir =
    config.type === 'tooling'
      ? path.join(repoRoot, 'tooling', config.name)
      : path.join(repoRoot, 'packages', config.name);

  console.log(chalk.blue(`📁 Creating package at: ${path.relative(repoRoot, destDir)}`));

  // Check if destination already exists
  if (await fs.pathExists(destDir)) {
    throw new Error(`Package directory already exists: ${destDir}`);
  }

  // Ensure destination directory exists
  await fs.ensureDir(destDir);

  // Copy and process template files
  await processTemplateDirectory(templateDir, destDir, config);

  console.log(chalk.green(`✅ Package structure created`));

  return destDir;
}

async function processTemplateDirectory(
  templateDir: string,
  destDir: string,
  config: PackageConfig
): Promise<void> {
  const items = await fs.readdir(templateDir);

  for (const item of items) {
    const templatePath = path.join(templateDir, item);
    const stat = await fs.stat(templatePath);

    if (stat.isDirectory()) {
      const destSubDir = path.join(destDir, item);
      await fs.ensureDir(destSubDir);
      await processTemplateDirectory(templatePath, destSubDir, config);
    } else {
      await processTemplateFile(templatePath, destDir, config);
    }
  }
}

async function processTemplateFile(
  templatePath: string,
  destDir: string,
  config: PackageConfig
): Promise<void> {
  const templateContent = await fs.readFile(templatePath, 'utf8');
  const processedContent = processTemplate(templateContent, config);

  // Remove .template extension from filename
  const fileName = path.basename(templatePath).replace('.template', '');
  const destPath = path.join(destDir, fileName);

  await fs.writeFile(destPath, processedContent);
  console.log(chalk.gray(`  ${fileName}`));
}

function processTemplate(content: string, config: PackageConfig): string {
  return content
    .replace(/\{\{name\}\}/g, config.name)
    .replace(/\{\{description\}\}/g, config.description)
    .replace(/\{\{displayName\}\}/g, config.displayName)
    .replace(/\{\{type\}\}/g, config.type);
}

function findRepoRoot(): string {
  let currentDir = __dirname;

  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    const turboJsonPath = path.join(currentDir, 'turbo.json');

    if (fs.existsSync(packageJsonPath) && fs.existsSync(turboJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.workspaces || fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml'))) {
        return currentDir;
      }
    }

    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find Turborepo root directory');
}
