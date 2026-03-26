# RentIT Edge API (Cloudflare Worker + D1)

This service is the zero-cost oriented backend path for RentIT.

## Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (requires `Authorization: Bearer <token>`)

## Setup

1. Install deps:
   - `cd edge-api`
   - `npm install`
2. Create D1 database in Cloudflare:
   - `npx wrangler d1 create rentit_db`
3. Copy the returned `database_id` into `wrangler.toml` under `[[d1_databases]]`.
4. Apply schema:
   - Local: `npm run db:migrate:local`
   - Remote: `npm run db:migrate:remote`
5. Set production secret:
   - `npx wrangler secret put JWT_SECRET`
6. Deploy:
   - `npm run deploy`

## Frontend API URL

Set frontend env:

- `REACT_APP_API_URL=https://<your-worker-subdomain>.workers.dev/api`

## CORS

This Worker allows the frontend origin through `CORS_ALLOWED_ORIGINS`.

- Current default: `http://localhost:3000,http://127.0.0.1:3000`
- In production with the Cloudflare frontend worker, the browser calls the same origin and the worker proxies `/api/*`, so cross-origin browser access is usually unnecessary.
