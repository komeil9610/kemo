# RentIT Edge API (Cloudflare Worker + D1)

Backend API for RentIT running on Cloudflare Workers with D1 as the main database.

## Supported features

- Customer authentication: `POST /api/auth/register`, `POST /api/auth/login`
- Products: `GET /api/products`, `GET /api/products/:id`
- Admin product management: `POST|PUT|DELETE /api/products`
- Customer checkout flow:
  - `POST /api/cart/checkout`
  - `GET /api/orders`
  - `GET /api/orders/:id`
  - `PUT /api/bookings/:id/cancel`
- Admin operations:
  - `GET /api/admin/products`
  - `GET /api/admin/users`
  - `PUT /api/admin/users/:id`
  - `GET /api/admin/bookings`
  - `PUT /api/admin/bookings/:id`

## Cloudflare bindings

- `DB`: D1 database binding
- `JWT_SECRET`: Worker secret for auth tokens
- `CORS_ALLOWED_ORIGINS`: comma-separated local/dev origins

## Setup

1. `cd edge-api && npm install`
2. Create D1:
   - `npx wrangler d1 create rentit_db`
3. Put the returned `database_id` into [wrangler.toml](/home/bobby/Desktop/rentit/edge-api/wrangler.toml)
4. Apply the full schema:
   - Local: `npm run db:migrate:local`
   - Remote: `npm run db:migrate:remote`
5. Add the auth secret:
   - `npx wrangler secret put JWT_SECRET`
6. Deploy:
   - `npm run deploy`

## Notes

- The frontend Worker can call this API via `Service Bindings` or fallback proxying with `API_ORIGIN`.
- In production, the frontend usually calls `/api/*` on the same domain, so direct browser CORS is minimal.
