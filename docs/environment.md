# Environment Setup

## Quick Setup

```bash
# Copy example file
cp .env.example .env

# Edit with your values
# DATABASE_URL - PostgreSQL connection string
# BETTER_AUTH_SECRET - 32+ character secret key
```

## Required Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
BETTER_AUTH_SECRET="your-super-secret-32-char-minimum-key"
```

## Optional Variables

```env
VITE_API_URL=http://localhost:3001          # API URL for frontend
WEB_URL=http://localhost:5173               # Frontend URL for CORS
NITRO_PORT=3001                            # API server port
NODE_ENV=development                       # Environment mode
```

## Production

Set these in your hosting platform:

```env
DATABASE_URL="postgresql://prod-host:5432/mydb"
BETTER_AUTH_SECRET="secure-production-secret-32-chars-min"
VITE_API_URL=https://api.yourdomain.com
WEB_URL=https://yourdomain.com  
NODE_ENV=production
```

## Notes

- Uses **Turbo loose mode** - single `.env` file for all packages
- Vite variables need `VITE_` prefix for frontend access
- Never commit `.env` files to version control