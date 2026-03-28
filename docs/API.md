# توثيق الـ API | API Documentation

## الأساسيات | Base URL

```
https://tarkeeb-pro-edge-api.bobkumeel.workers.dev/api
```

---

## المصادقة | Authentication

### تسجيل المستخدم | User Registration

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "firstName": "أحمد",
  "lastName": "علي",
  "email": "ahmed@example.com",
  "phone": "0501234567",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "أحمد",
      "lastName": "علي",
      "email": "ahmed@example.com",
      "role": "user"
    }
  }
}
```

---

### تسجيل الدخول | User Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "أحمد",
      "email": "ahmed@example.com",
      "role": "user"
    }
  }
}
```

---

## المنتجات | Products

### الحصول على جميع المنتجات | Get All Products

**Endpoint:** `GET /products`

**Query Parameters:**
- `category` - نوع المنتج (device, costume, service, other)
- `city` - المدينة
- `minPrice` - أقل سعر
- `maxPrice` - أعلى سعر
- `page` - رقم الصفحة
- `limit` - عدد النتائج

**Example:** `GET /products?category=costume&city=الرياض&page=1&limit=10`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "كاميرا احترافية Canon",
        "description": "كاميرا...",
        "category": "device",
        "pricePerDay": 150,
        "stock": 5,
        "rating": 4.5,
        "images": ["url1", "url2"]
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 5
    }
  }
}
```

---

### الحصول على منتج واحد | Get Product by ID

**Endpoint:** `GET /products/:id`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "كاميرا احترافية Canon",
      "description": "...",
      "owner": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "محمد",
        "lastName": "سالم",
        "rating": 4.8
      },
      "reviews": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "rating": 5,
          "comment": "منتج ممتاز جداً",
          "user": "أحمد علي"
        }
      ]
    }
  }
}
```

---

### إضافة منتج جديد | Create Product

**Endpoint:** `POST /products`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "كاميرا احترافية Sony",
  "description": "كاميرا احترافية عالية الجودة",
  "category": "device",
  "pricePerDay": 200,
  "stock": 3,
  "condition": "excellent",
  "images": [
    {"url": "image_url_1", "alt": "الكاميرا من الأمام"}
  ],
  "location": {
    "city": "الرياض",
    "region": "منطقة الرياض"
  },
  "tags": ["كاميرا", "احترافية", "تصوير"]
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "كاميرا احترافية Sony",
      "pricePerDay": 200,
      "owner": "507f1f77bcf86cd799439011"
    }
  }
}
```

---

## الحجوزات | Bookings

### إنشاء حجز | Create Booking

**Endpoint:** `POST /bookings`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "startDate": "2024-03-15",
  "endDate": "2024-03-17",
  "quantity": 1,
  "deliveryType": "pickup",
  "notes": "سأستلمها من المتجر مباشرة"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439015",
      "bookingNumber": "BK20240308001",
      "productId": "507f1f77bcf86cd799439011",
      "startDate": "2024-03-15",
      "endDate": "2024-03-17",
      "totalPrice": 400,
      "status": "pending",
      "paymentStatus": "unpaid"
    }
  }
}
```

---

### الحصول على حجوزاتي | Get My Bookings

**Endpoint:** `GET /bookings`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "bookings": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "bookingNumber": "BK20240308001",
        "product": {
          "name": "كاميرا احترافية Canon",
          "images": ["url"]
        },
        "startDate": "2024-03-15",
        "endDate": "2024-03-17",
        "totalPrice": 400,
        "status": "confirmed"
      }
    ]
  }
}
```

---

## المدفوعات | Payments

### إنشاء دفعة | Create Payment

**Endpoint:** `POST /payments`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bookingId": "507f1f77bcf86cd799439015",
  "amount": 400,
  "paymentMethod": "credit_card",
  "stripePaymentMethodId": "pm_1234567890"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439016",
      "transactionId": "TXN123456789",
      "amount": 400,
      "status": "completed",
      "bookingId": "507f1f77bcf86cd799439015"
    }
  }
}
```

---

## التقييمات | Reviews

### إضافة تقييم | Create Review

**Endpoint:** `POST /reviews`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "bookingId": "507f1f77bcf86cd799439015",
  "rating": 5,
  "title": "منتج رائع جداً",
  "comment": "الكاميرا بحالة ممتازة وخدمة العميل رائعة",
  "images": ["review_image_url"]
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Review added successfully",
  "data": {
    "review": {
      "_id": "507f1f77bcf86cd799439017",
      "rating": 5,
      "productId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439011"
    }
  }
}
```

---

## معالجة الأخطاء | Error Handling

### رسائل الخطأ الشائعة | Common Error Messages

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "البريد الإلكتروني غير صحيح" }
  ]
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "An error occurred",
  "code": "SERVER_ERROR"
}
```

---

## رموز الحالة | Status Codes

| Code | Message |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
