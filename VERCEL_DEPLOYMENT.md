# Vercel Deployment Guide

## Prerequisites

1. Vercel account: https://vercel.com
2. Node.js 18+
3. Vercel CLI: `npm i -g vercel`

## Setup Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Then update the values:

```
DATABASE_URL=your_database_connection_string
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_db_id
CLOUDFLARE_API_TOKEN=your_api_token
JWT_SECRET=your_jwt_secret_key
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

### 3. Local Development

```bash
npm run dev
```

The app will run at `http://localhost:3000`

### 4. Build

```bash
npm run build
```

### 5. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
vercel
```

Follow the prompts to:
- Select project
- Set environment variables
- Deploy

#### Option B: Using Git Integration

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel will auto-deploy on push to main

#### Option C: Using GitHub Actions

Add `.github/workflows/vercel-deployment.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
      - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Database Migration

### From Cloudflare D1 to Vercel-Compatible Database

For serverless-friendly databases, consider:

1. **Vercel with PostgreSQL (Vercel Postgres)**
   - Native integration
   - Pay-as-you-go pricing

2. **Supabase PostgreSQL**
   - Open-source backend
   - Real-time capabilities

3. **MongoDB Atlas**
   - NoSQL option
   - Serverless scaling

4. **PlanetScale (MySQL)**
   - MySQL compatible
   - Serverless scaling

### Migration Steps

1. Export data from Cloudflare D1
2. Set up database service
3. Update `DATABASE_URL` in environment variables
4. Update database connection in `lib/database.js`
5. Run migrations

## API Routes Structure

Current routes available at `/api/*`:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/health` - Health check
- `GET /api/operations/dashboard` - Dashboard data
- `GET /api/operations/orders` - List orders
- `POST /api/operations/orders` - Create order
- `GET /api/notifications` - Get notifications
- `GET /api/products` - List products
- `POST /api/products` - Create product

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | Yes |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Optional |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | Optional |
| `CLOUDFLARE_EMAIL_API_TOKEN` | For email service | Optional |

## Troubleshooting

### Build Failures

Check `vercel.json` configuration and ensure all imports use absolute paths with `@/` prefix.

### Database Connection Errors

Verify `DATABASE_URL` is correct and the database service is accessible from Vercel.

### CORS Issues

Update `ALLOWED_ORIGINS` environment variable with your frontend domain.

### API Not Found (404)

Ensure API files are in `pages/api/` directory with correct naming conventions.

## Monitoring

Monitor deployments via:
1. Vercel dashboard: https://vercel.com/dashboard
2. GitHub Actions logs
3. Application logs in Vercel

## Rollback

```bash
vercel rollback
```

Select a previous deployment to revert to.

## Performance Tips

1. Enable caching for static assets
2. Use serverless database connection pooling
3. Implement API rate limiting
4. Cache API responses where possible
5. Use Next.js image optimization

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- API Reference: See `edge-api/README.md` for endpoint details