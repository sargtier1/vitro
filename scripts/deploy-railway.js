#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

class RailwayDeployer {
  constructor() {
    this.projectName = 'four-site';
    this.serviceName = 'app';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[34m', // blue
      success: '\x1b[32m', // green
      warning: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
      reset: '\x1b[0m'
    };
    
    const color = colors[type] || colors.info;
    console.log(`${colors.reset}[${timestamp}] ${color}${message}${colors.reset}`);
  }

  async execCommand(command, options = {}) {
    try {
      this.log(`Running: ${command}`, 'info');
      const result = execSync(command, {
        encoding: 'utf8',
        cwd: rootDir,
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  loadEnvFile() {
    try {
      const envPath = resolve(rootDir, '.env.prod');
      const envContent = readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');
          envVars[key.trim()] = value.trim();
        }
      });
      
      return envVars;
    } catch (error) {
      this.log('No .env.prod file found - using minimal environment variables', 'warning');
      return {
        NODE_ENV: 'production',
        PORT: '3000'
      };
    }
  }

  async checkAuthentication() {
    this.log('Checking Railway authentication...', 'info');
    const result = await this.execCommand('railway whoami', { silent: true });
    
    if (!result.success) {
      this.log('Not authenticated with Railway', 'error');
      this.log('Please run: railway login', 'warning');
      process.exit(1);
    } else {
      this.log(`Authenticated as: ${result.output.trim()}`, 'success');
    }
  }

  async createProject() {
    this.log('Setting up Railway project...', 'info');
    
    // Check if project already exists
    const statusResult = await this.execCommand('railway status', { silent: true });
    
    if (statusResult.success) {
      this.log('Using existing Railway project', 'success');
      return;
    }

    // Create new project
    const createResult = await this.execCommand(`railway init`);
    if (!createResult.success) {
      this.log('Failed to create Railway project', 'error');
      this.log(createResult.error, 'error');
      process.exit(1);
    }
    
    this.log('Created Railway project', 'success');
  }

  async addDatabase() {
    this.log('Adding PostgreSQL database...', 'info');
    
    const result = await this.execCommand('railway add --database postgres');
    if (!result.success) {
      this.log('Database might already exist or failed to add', 'warning');
      this.log('Continuing with deployment...', 'info');
    } else {
      this.log('PostgreSQL database added', 'success');
    }
  }

  async setEnvironmentVariables() {
    this.log('Setting environment variables from .env.prod...', 'info');
    
    const envVars = this.loadEnvFile();
    const requiredVars = ['NODE_ENV', 'PORT', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'];
    
    // Check for required variables
    const missingVars = requiredVars.filter(key => !envVars[key]);
    if (missingVars.length > 0) {
      this.log(`Missing required environment variables: ${missingVars.join(', ')}`, 'warning');
      this.log('Please configure these in .env.prod before deployment', 'warning');
    }

    try {
      for (const [key, value] of Object.entries(envVars)) {
        if (value && key !== 'DATABASE_URL') { // Skip DATABASE_URL as it's auto-injected
          await this.execCommand(`railway variables --set "${key}=${value}"`, { silent: true });
        }
      }
      this.log(`Environment variables set from .env.prod (${Object.keys(envVars).length} variables)`, 'success');
    } catch (error) {
      this.log('Failed to set environment variables', 'error');
      this.log(error.message, 'error');
    }
  }

  async deployApplication() {
    this.log('Deploying application...', 'info');
    
    const result = await this.execCommand('railway up --detach');
    if (!result.success) {
      this.log('Deployment failed', 'error');
      this.log(result.error, 'error');
      process.exit(1);
    }
    
    this.log('Application deployed successfully', 'success');
  }

  async runDatabaseMigrations() {
    this.log('Running database migrations...', 'info');
    
    const result = await this.execCommand('railway run pnpm db:deploy');
    if (!result.success) {
      this.log('Database migration failed - you may need to run this manually', 'warning');
      this.log('Run: railway run pnpm db:deploy', 'info');
    } else {
      this.log('Database migrations completed', 'success');
    }
  }

  async getServiceInfo() {
    this.log('Getting service information...', 'info');
    
    const result = await this.execCommand('railway service', { silent: true });
    if (result.success) {
      this.log('Service information retrieved', 'success');
      console.log('\n🚀 Deployment Summary:');
      console.log(result.output);
    } else {
      this.log('Failed to get service info', 'warning');
    }
  }

  async deploy() {
    console.log('\n🚀 Railway Deployment Starting...\n');

    await this.checkAuthentication();
    await this.createProject();
    await this.addDatabase();
    await this.setEnvironmentVariables();
    await this.deployApplication();
    await this.runDatabaseMigrations();
    await this.getServiceInfo();

    console.log('\n✅ Deployment Complete!\n');
    console.log('Next steps:');
    console.log('1. Set up custom domain in Railway dashboard');
    console.log('2. Enable Cloudflare integration for CDN');
    console.log('3. Update BETTER_AUTH_URL in .env.prod with your actual domain');
    console.log('4. Monitor logs: railway logs');
  }
}

// Run deployment if called directly
if (process.argv[1] === __filename) {
  const deployer = new RailwayDeployer();
  deployer.deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}