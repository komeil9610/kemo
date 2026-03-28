# قاعدة البيانات | Database Documentation

## MongoDB Collections

### 1. Users Collection

```javascript
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string (unique),
  phone: string,
  password: string (hashed),
  profileImage: string,
  role: enum['user', 'admin', 'vendor'],
  address: {
    street: string,
    city: string,
    region: string,
    postalCode: string
  },
  isEmailVerified: boolean,
  isPhoneVerified: boolean,
  rating: number (0-5),
  totalBookings: number,
  wallet: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Products Collection

```javascript
{
  _id: ObjectId,
  name: string,
  description: string,
  category: enum['device', 'costume', 'service', 'other'],
  images: [{
    url: string,
    alt: string
  }],
  owner: ObjectId (ref: User),
  pricePerDay: number,
  stock: number,
  location: {
    city: string,
    region: string,
    coordinates: {
      type: Point,
      coordinates: [longitude, latitude]
    }
  },
  condition: enum['excellent', 'good', 'fair'],
  rating: number (0-5),
  reviewCount: number,
  isActive: boolean,
  tags: [string],
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Bookings Collection

```javascript
{
  _id: ObjectId,
  bookingNumber: string (unique),
  userId: ObjectId (ref: User),
  productId: ObjectId (ref: Product),
  startDate: Date,
  endDate: Date,
  quantity: number,
  totalPrice: number,
  status: enum['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
  deliveryType: enum['pickup', 'delivery'],
  deliveryAddress: {
    street: string,
    city: string,
    region: string,
    postalCode: string
  },
  notes: string,
  paymentStatus: enum['unpaid', 'paid', 'refunded'],
  cancellationReason: string,
  cancellationDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Payments Collection

```javascript
{
  _id: ObjectId,
  transactionId: string (unique),
  bookingId: ObjectId (ref: Booking),
  userId: ObjectId (ref: User),
  amount: number,
  currency: string (default: 'SAR'),
  paymentMethod: enum['credit_card', 'debit_card', 'apple_pay', 'google_pay', 'wallet'],
  status: enum['pending', 'processing', 'completed', 'failed', 'refunded'],
  stripePaymentId: string,
  description: string,
  refundAmount: number,
  refundDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Reviews Collection

```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product),
  userId: ObjectId (ref: User),
  bookingId: ObjectId (ref: Booking),
  rating: number (1-5),
  title: string,
  comment: string,
  images: [string],
  isVerifiedPurchase: boolean,
  helpful: number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Indexes والبحث | Indexes and Search

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 })
db.users.createIndex({ role: 1 })

// Products
db.products.createIndex({ category: 1 })
db.products.createIndex({ owner: 1 })
db.products.createIndex({ "location.coordinates": "2dsphere" })
db.products.createIndex({ name: "text", description: "text", tags: "text" })
db.products.createIndex({ isActive: 1, pricePerDay: 1 })

// Bookings
db.bookings.createIndex({ userId: 1 })
db.bookings.createIndex({ productId: 1 })
db.bookings.createIndex({ bookingNumber: 1 }, { unique: true })
db.bookings.createIndex({ status: 1 })
db.bookings.createIndex({ startDate: 1, endDate: 1 })

// Payments
db.payments.createIndex({ transactionId: 1 }, { unique: true })
db.payments.createIndex({ bookingId: 1 })
db.payments.createIndex({ userId: 1 })

// Reviews
db.reviews.createIndex({ productId: 1 })
db.reviews.createIndex({ userId: 1 })
db.reviews.createIndex({ bookingId: 1 })
```

---

## علاقات البيانات | Data Relationships

```
Users (1) ──────────────→ (many) Products
        └──────────────→ (many) Bookings
                └──────→ (many) Payments
                └──────→ (many) Reviews

Products (1) ───────────→ (many) Bookings
          └────────────→ (many) Reviews

Bookings (1) ──────────→ (1) Payments
          └──────────→ (many) Reviews
```

---

## نسخ المياه الاحتياطي | Backup Strategy

```bash
# نسخ احتياطي يومي | Daily Backup
mongodump --uri="mongodb://localhost:27017/tarkeeb_pro_db" --archive=tarkeeb_pro_$(date +%Y%m%d).archive

# استعادة | Restore
mongorestore --uri="mongodb://localhost:27017" --archive=tarkeeb_pro_20240308.archive
```

---

## أداء وتحسينات | Performance & Optimization

- ✅ استخدام Indexes على الحقول المستخدمة في البحث
- ✅ Pagination للقوائم الطويلة
- ✅ Caching للبيانات الثابتة
- ✅ Lazy Loading للصور
- ✅ Aggregation Pipelines للتقارير
