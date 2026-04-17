# Vercel API Endpoints Summary

This file documents all API endpoints created for Vercel deployment.

## Quick Start

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Test locally**
   ```bash
   npm run dev
   # Visit http://localhost:3000/api/health
   ```

4. **Deploy**
   ```bash
   vercel
   ```

## API Endpoints

### Base URL
- Local: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": "user_id"
  }
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "status": "success",
  "message": "User logged in successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "customer"
    }
  }
}
```

### Operations Endpoints

Require authentication: `Authorization: Bearer <token>`

#### Get Dashboard
```
GET /operations/dashboard
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "message": "Dashboard data retrieved",
  "data": {
    "totalOrders": 0,
    "pendingOrders": 0,
    "completedOrders": 0,
    "metrics": {}
  }
}
```

#### List Orders
```
GET /operations/orders
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "message": "Orders retrieved",
  "data": {
    "orders": []
  }
}
```

#### Create Order
```
POST /operations/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer_id",
  "items": [
    {
      "productId": "product_id",
      "quantity": 1
    }
  ]
}

Response:
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "orderId": "order_id"
  }
}
```

#### Get Order Detail
```
GET /operations/orders/[id]
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "message": "Order retrieved",
  "data": {
    "orderId": "order_id",
    "status": "pending"
  }
}
```

#### Update Order
```
PUT /operations/orders/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped"
}

Response:
{
  "status": "success",
  "message": "Order updated",
  "data": {
    "orderId": "order_id"
  }
}
```

### Technician Endpoints

#### List Technicians
```
GET /operations/technicians
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "message": "Technicians retrieved",
  "data": {
    "technicians": []
  }
}
```

#### Create Technician
```
POST /operations/technicians
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "coverage": ["jeddah", "mecca"]
}

Response:
{
  "status": "success",
  "message": "Technician created",
  "data": {
    "technicianId": "tech_id"
  }
}
```

### Notification Endpoints

#### List Notifications
```
GET /notifications
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "message": "Notifications retrieved",
  "data": {
    "notifications": [],
    "unreadCount": 0
  }
}
```

### Product Endpoints

#### List Products
```
GET /products

Response:
{
  "status": "success",
  "message": "Products retrieved",
  "data": {
    "products": []
  }
}
```

#### Create Product
```
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "AC Unit",
  "description": "Cooling system",
  "price": 5000
}

Response:
{
  "status": "success",
  "message": "Product created",
  "data": {
    "productId": "product_id"
  }
}
```

### Health Check

#### Check Service Status
```
GET /health

Response:
{
  "status": "success",
  "message": "ok",
  "service": "tarkeeb-pro-next-api",
  "date": "2026-04-17T10:00:00.000Z"
}
```

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Missing/invalid auth token |
| `MISSING_FIELDS` | 400 | Required fields missing |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `SERVER_ERROR` | 500 | Internal server error |

## Authentication

All endpoints requiring authentication expect:

```
Authorization: Bearer <jwt_token>
```

Token is obtained from `/auth/login` endpoint.

## CORS Headers

All endpoints automatically include:

```
Access-Control-Allow-Origin: <requesting_origin>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Workspace-Role
```

## Rate Limiting

Currently no rate limiting is implemented. To add:

1. Install package:
   ```bash
   npm install ratelimit
   ```

2. Use in endpoints:
   ```javascript
   import { Ratelimit } from '@upstash/ratelimit';
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '1 h'),
   });
   ```

## Testing Endpoints

### Using cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# List orders (replace TOKEN)
curl http://localhost:3000/api/operations/orders \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import collection from `frontend/postman-collection.json` (create this)
2. Set environment variables:
   - `BASE_URL` = `http://localhost:3000/api`
   - `TOKEN` = token from login response
3. Run requests

### Using Thunder Client in VS Code

Create `.apidog/requests.rest`:

```rest
@baseUrl = http://localhost:3000/api
@token = 

### Health Check
GET {{baseUrl}}/health

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### List Orders
GET {{baseUrl}}/operations/orders
Authorization: Bearer {{token}}
```

## Implementation Notes

- All endpoints return JSON responses
- All dates are in ISO 8601 format
- Pagination uses query parameters: `?page=1&limit=20`
- Sorting uses query parameters: `?sort=created&order=desc`