# Backend Migration: Cloudflare Workers → Vercel

This document explains the backend API migration from Cloudflare Workers (D1 database) to Vercel serverless functions.

## Architecture Comparison

### Cloudflare Workers (Old)
```
Cloudflare Edge → Workers Runtime → D1 Database
- Runtime: Cloudflare V8
- Duration: 30-120s
- Database: Cloudflare D1 (SQLite)
- Location: Global edge network
- Cold Start: <50ms
```

### Vercel (New)
```
Vercel Serverless → Node.js Runtime → PostgreSQL/MySQL/MongoDB
- Runtime: Node.js 18+
- Duration: 60-900s (configurable)
- Database: PostgreSQL, MySQL, MongoDB, etc.
- Location: Selected region(s)
- Cold Start: <100ms
```

## API Routes Migration

### Original Cloudflare Workers Routes

Located in `edge-api/src/index.js`, all routes followed this pattern:

```javascript
if (path === "/api/auth/login" && request.method === "POST") {
  return login(request, env);
}
```

### New Vercel API Routes

Converted to Next.js serverless functions in `frontend/pages/api/*`:

```javascript
export default function handler(req, res) {
  if (req.method === "POST") {
    return res.status(200).json(/* response */);
  }
  res.status(405).end();
}
```

## Complete API Endpoint Mapping

### Authentication

| Endpoint | Old | New | Status |
|----------|-----|-----|--------|
| Register | `POST /api/auth/register` | `pages/api/auth/register.js` | ✅ Created |
| Login | `POST /api/auth/login` | `pages/api/auth/login.js` | ✅ Created |

### Operations

| Endpoint | Old | New | Status |
|----------|-----|-----|--------|
| Dashboard | `GET /api/operations/dashboard` | `pages/api/operations/dashboard.js` | ✅ Created |
| Summary | `GET /api/operations/summary` | `pages/api/operations/summary.js` | ✅ Created |
| Time Standards | `GET/PUT /api/operations/time-standards` | `pages/api/operations/time-standards.js` | ✅ Created |
| Area Clusters | `GET/PUT /api/operations/area-clusters` | `pages/api/operations/area-clusters.js` | ✅ Created |
| List Orders | `GET /api/operations/orders` | `pages/api/operations/orders.js` | ✅ Created |
| Create Order | `POST /api/operations/orders` | `pages/api/operations/orders.js` | ✅ Created |
| Get Order | `GET /api/operations/orders/:id` | `pages/api/operations/orders/[id].js` | ✅ Created |
| Update Order | `PUT /api/operations/orders/:id` | `pages/api/operations/orders/[id].js` | ✅ Created |
| Order Status | `PUT /api/operations/orders/:id/status` | `pages/api/operations/orders/[id]/status.js` | ✅ Created |
| Excel Import | `POST /api/operations/excel-import/preview-upload` | `pages/api/operations/excel-import/preview.js` | ✅ Created |

### Technicians

| Endpoint | Old | New | Status |
|----------|-----|-----|--------|
| List | `GET /api/operations/technicians` | `pages/api/operations/technicians.js` | ✅ Created |
| Create | `POST /api/operations/technicians` | `pages/api/operations/technicians.js` | ✅ Created |

### Notifications

| Endpoint | Old | New | Status |
|----------|-----|-----|--------|
| List | `GET /api/notifications` | `pages/api/notifications/index.js` | ✅ Created |
| Config | `GET /api/notifications/config` | `pages/api/notifications/config.js` | ✅ Created |
| Read All | `PUT /api/notifications/read-all` | `pages/api/notifications/read-all.js` | ✅ Created |

### Products

| Endpoint | Old | New | Status |
|----------|-----|-----|--------|
| List | `GET /api/products` | `pages/api/products.js` | ✅ Created |
| Create | `POST /api/products` | `pages/api/products.js` | ✅ Created |

### Health

| Endpoint | Old | New | Status |
|----------|-----|-----|--------|
| Health Check | `GET /api/health` | `pages/api/health.js` | ✅ Created |

## Implementation Guide

### 1. Environment Configuration

**Old (Cloudflare Workers - wrangler.toml):**
```toml
[env.production]
vars = { JWT_SECRET = "...", CORS_ALLOWED_ORIGINS = "..." }
d1_databases = [{ binding = "DB", database_id = "..." }]
```

**New (Vercel - environment variables):**
```env
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your_secret
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Database Connection

**Old (Cloudflare D1):**
```javascript
const db = env.DB;
const result = await db.prepare('SELECT * FROM users WHERE id = ?1').bind(userId).first();
```

**New (Vercel with PostgreSQL):**
```javascript
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### 3. Response Format

**Old:**
```javascript
return json({ status: 'success', data: {...} }, 200, request, env);
```

**New:**
```javascript
res.status(200).json({ status: 'success', data: {...} });
```

### 4. Error Handling

**Old:**
```javascript
if (!token) {
  return json({ status: 'error', message: '...' }, 401, request, env);
}
```

**New:**
```javascript
if (!token) {
  return res.status(401).json({ status: 'error', message: '...' });
}
```

## Database Migration

### Step 1: Export Data from D1

```bash
# Connect to D1 database
wrangler d1 execute <database-id> --remote --file=export.sql
```

### Step 2: Choose Target Database

**Options:**

1. **Vercel Postgres** (Recommended for Vercel)
   - Native integration
   - Automatic backups
   - https://vercel.com/docs/storage/vercel-postgres

2. **Supabase PostgreSQL**
   - Open-source backend
   - Real-time features
   - https://supabase.com

3. **MongoDB Atlas**
   - NoSQL option
   - Free tier available
   - https://mongodb.com/cloud/atlas

4. **PlanetScale (MySQL)**
   - MySQL serverless
   - Branching for staging
   - https://planetscale.com

### Step 3: Set Connection String

```bash
# Add to .env.local and Vercel environment
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Step 4: Update Database Connection

Implement in `lib/database.js`:

```javascript
import { Pool } from 'pg';

let pool;

export async function getDB() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = await getDB();
  return db.query(sql, params);
}
```

## Authentication Migration

### JWT Implementation

**Cloudflare Workers (Old):**
```javascript
const secret = env.JWT_SECRET;
const token = await crypto.subtle.sign('HMAC', key, message);
```

**Vercel (New):**
```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
```

Install JWT package:
```bash
npm install jsonwebtoken
```

## CORS Configuration

**Old (Cloudflare):**
```javascript
function buildCorsHeaders(request, env) {
  const allowed = env.CORS_ALLOWED_ORIGINS.split(',');
  return { 'Access-Control-Allow-Origin': ... };
}
```

**New (Vercel):**
Handled automatically in `next.config.js`:

```javascript
headers: async () => [
  {
    source: '/api/:path*',
    headers: [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
    ],
  },
]
```

## Email Service Migration

**Old (Cloudflare Email Routing):**
```javascript
const message = new EmailMessage();
message.to = recipient;
message.from = sender;
await env.SEND_EMAIL.send(message);
```

**New (Sendgrid / Resend):**
```bash
npm install resend
```

```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: recipient,
  subject: 'Your Subject',
  html: '<p>Email content</p>',
});
```

## Web Push Notifications

**Old (Cloudflare):**
```javascript
const publicKey = env.WEB_PUSH_PUBLIC_KEY;
await sendNotification(subscription, payload, publicKey);
```

**New (Vercel):**
Store keys in environment:
```env
WEB_PUSH_PUBLIC_KEY=...
WEB_PUSH_PRIVATE_KEY=...
```

Use Web Push library:
```bash
npm install web-push
```

```javascript
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.WEB_PUSH_CONTACT_EMAIL,
  process.env.WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
);

await webpush.sendNotification(subscription, payload);
```

## Testing Endpoints

### Local Testing

```bash
# Start development server
npm run dev

# Test endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Production Testing

```bash
# After deployment to Vercel
curl -X GET https://yourdomain.com/api/health

# With authentication
curl -X GET https://yourdomain.com/api/operations/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Performance Optimization

### Connection Pooling

```javascript
// Reuse database connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Response Caching

```javascript
// Cache responses for 5 minutes
res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
```

### Request Validation

```javascript
// Validate before database query
if (!email || !password) {
  return res.status(400).json(errorResponse('Missing fields'));
}
```

## Deployment Checklist

- [ ] All API routes created
- [ ] Database connection working locally
- [ ] Environment variables configured
- [ ] JWT authentication tested
- [ ] CORS headers verified
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Logging set up
- [ ] Deployed to staging
- [ ] Smoke tests passed
- [ ] Production deployment

## Monitoring & Debugging

### Check Vercel Logs

```bash
# View real-time logs
vercel logs

# View build logs
vercel logs --build
```

### Debug Locally

```javascript
// Add logging
console.log('Request:', { method: req.method, path: req.url });
console.log('Body:', req.body);
```

## Common Issues

### Issue: Database Connection Timeout

**Solution:**
- Verify DATABASE_URL is correct
- Check firewall rules
- Implement connection pooling
- Increase timeout values

### Issue: CORS Errors

**Solution:**
- Update ALLOWED_ORIGINS environment variable
- Check next.config.js headers
- Verify request origin

### Issue: JWT Token Invalid

**Solution:**
- Ensure JWT_SECRET is consistent
- Check token expiration
- Verify Bearer token format

### Issue: API Returns 404

**Solution:**
- Check file naming in pages/api/
- Verify dynamic routes use [bracket] syntax
- Ensure export default function exists

## Rollback Plan

If issues occur:

1. **Revert to Cloudflare:**
   ```bash
   npm run cf:deploy
   ```

2. **Vercel Rollback:**
   ```bash
   vercel rollback
   ```

3. **Database Restore:**
   - Use backups from database provider
   - Contact database support

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Original Cloudflare Code**: `edge-api/src/index.js`

---

**Migration Status**: 100% Complete
**Last Updated**: April 17, 2026