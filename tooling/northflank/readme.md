# @repo/northflank

> Simple Northflank deployment tooling for Vitro Supercharged

Deploy your Vitro Supercharged Turbo repo to Northflank using Git Source (no Docker required) with Infrastructure as Code configuration.

## ✨ Features

- 🏗️ **Infrastructure as Code** - Configuration saved and versioned
- ⚡ **Git Source Deployment** - No Docker knowledge required
- 🌎 **US Central Region** - Optimized for US-based traffic
- 🆓 **Free Tier Ready** - 2 services + PostgreSQL + 1GB storage
- 🔄 **Auto-deploys** - Push code to trigger deployments
- 🛠️ **Turbo Integration** - Optimized build commands for monorepo

## 🚀 Quick Start

```bash
# 1. Setup (saves configuration)
pnpm infra:setup

# 2. Get deployment instructions
pnpm infra:deploy

# 3. Follow the manual steps in Northflank dashboard
```

## 📋 What Gets Created

### Free Tier Resources
- **API Service** - Your Nitro backend (0.1 CPU, 256Mi RAM)
- **Web Service** - Your Vite frontend (0.1 CPU, 128Mi RAM)  
- **PostgreSQL Database** - 1GB storage for your data
- **Persistent Volume** - 1GB for media/file storage

### Auto-Generated URLs
- **API**: `https://api-{project-name}.northflank.app`
- **Web**: `https://web-{project-name}.northflank.app`

## 🛠️ Commands

### `pnpm infra:setup`
Interactive setup that collects:
- Project name
- GitHub repository URL
- Better Auth secret (32+ characters)

Saves configuration to `.northflank.json` for reuse.

### `pnpm infra:deploy`
Shows step-by-step instructions for:
- Creating project in Northflank dashboard
- Setting up PostgreSQL addon
- Configuring Git Source services
- Setting environment variables

## 📁 Configuration

After running `pnpm infra:setup`, configuration is saved in `.northflank.json`:

```json
{
  "projectName": "vitro-app",
  "repoUrl": "https://github.com/username/repo",
  "authSecret": "your-32-char-secret",
  "region": "us-central",
  "apiUrl": "https://api-vitro-app.northflank.app",
  "webUrl": "https://web-vitro-app.northflank.app"
}
```

## 🔧 Build Commands

The tooling provides optimized build commands for your Turbo repo:

### API Service (Git Source)
```bash
# Build Command
pnpm install && pnpm db:generate && pnpm turbo build --filter=@repo/api

# Start Command  
node apps/api/.output/server/index.mjs

# Port
3001
```

### Web Service (Static Site)
```bash
# Build Command
pnpm install && pnpm turbo build --filter=@repo/web

# Publish Directory
apps/web/dist
```

## 🌍 Environment Variables

Set these in the Northflank dashboard for each service:

### API Service
```env
DATABASE_URL=postgresql://...  # From PostgreSQL addon
BETTER_AUTH_SECRET=your-secret # From setup
NODE_ENV=production
VITE_API_URL=https://api-{project}.northflank.app
NITRO_PORT=3001
```

### Web Service
```env
VITE_API_URL=https://api-{project}.northflank.app
```

## 📋 Manual Setup Steps

1. **Create Project**
   - Go to [Northflank Dashboard](https://app.northflank.com)
   - Create new project with your chosen name
   - Select **US Central** region

2. **Add Database**
   - Add PostgreSQL addon
   - Choose free tier (1GB storage)

3. **Create API Service**
   - Type: **Deployment**
   - Source: **Git Repository**
   - Repository: Your GitHub repo URL
   - Build settings: Use provided build command
   - Port: 3001
   - Resources: 0.1 CPU, 256Mi RAM

4. **Create Web Service**
   - Type: **Static Site**
   - Source: **Git Repository** 
   - Repository: Your GitHub repo URL
   - Build settings: Use provided build command
   - Publish directory: `apps/web/dist`
   - Resources: 0.1 CPU, 128Mi RAM

5. **Set Environment Variables**
   - Use the provided environment variables for each service

6. **Deploy**
   - Push code to your repository
   - Northflank auto-deploys on every push

## 🎯 Why This Approach?

### Git Source Benefits
- ✅ **No Docker** - Northflank auto-detects Node.js + pnpm
- ✅ **Auto-deploys** - Push code = automatic deployment
- ✅ **Faster builds** - Optimized for your stack
- ✅ **Less complexity** - No container management

### Infrastructure as Code
- ✅ **Reproducible** - Same setup every time
- ✅ **Version controlled** - Configuration in git
- ✅ **Documented** - Clear instructions for team
- ✅ **Portable** - Easy to recreate environments

## 🔐 Security

- Configuration saved locally (not committed to git)
- Secrets handled through Northflank dashboard
- Database runs in private network
- HTTPS enabled by default

## 📝 Notes

- **Free Tier Limits**: 2 services max, 1GB storage per addon
- **Auto-scaling**: Services scale to 0 when idle (saves resources)
- **Regions**: US Central optimized for US traffic
- **Git Integration**: Deploys automatically on push to main branch

## 🤝 Contributing

To modify the infrastructure:

1. Edit configuration in `setup.js`
2. Update build commands as needed
3. Test with `pnpm infra:setup && pnpm infra:deploy`

## 📄 License

Part of Vitro Supercharged - MIT License