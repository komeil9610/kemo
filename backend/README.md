# RentIT Backend Server

## 🚀 البدء السريع | Quick Start

### المتطلبات | Requirements
- Node.js v16+
- MongoDB v5+
- npm أو yarn

### التثبيت والتشغيل | Installation & Setup

```bash
# تثبيت الحزم
npm install

# إعداد المتغيرات
cp .env.example .env
# ثم عدل .env بـ بيانات MongoDB و Stripe

# تشغيل الخادم بوضع التطوير
npm run dev

# تشغيل الخادم بوضع الإنتاج
npm start

# اختبار الخادم
npm test
```

---

## 📁 بنية المشروع | Project Structure

```
backend/
├── src/
│   ├── models/           # Mongoose Schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── controllers/      # Business Logic (سيتم إضافته)
│   ├── routes/           # API Routes
│   │   └── example.js
│   ├── middleware/       # Custom Middleware
│   │   ├── auth.js
│   │   └── validators.js
│   ├── services/         # External Services (سيتم إضافته)
│   ├── utils/            # Helper Functions (سيتم إضافته)
│   ├── config/           # Configuration (سيتم إضافته)
│   └── server.js         # Entry Point
├── package.json
└── .env.example
```

---

## 🔌 المسارات الرئيسية | Main Routes

| Method | Path | الوصف |
|--------|------|-------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد |
| POST | `/api/auth/login` | تسجيل الدخول |
| GET | `/api/products` | الحصول على المنتجات |
| POST | `/api/products` | إنشاء منتج جديد (بائع فقط) |
| POST | `/api/bookings` | إنشاء حجز جديد |
| POST | `/api/payments` | معالجة الدفع |

---

## 🔐 المصادقة | Authentication

```javascript
// مثال على الطلب
GET /api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📚 المعايير والممارسات | Standards & Best Practices

- ✅ استخدام async/await
- ✅ معالجة الأخطاء الشاملة
- ✅ التحقق من الإدخالات
- ✅ تسجيل العمليات (Logging)
- ✅ الأمان والتشفير
- ✅ التوثيق الواضح

---

## 🛠️ أدوات التطوير | Development Tools

- **Nodemon**: إعادة تشغيل تلقائي
- **Express Validator**: التحقق من الإدخالات
- **JWT**: المصادقة الآمنة
- **Mongoose**: إدارة قاعدة البيانات
- **Stripe**: معالجة الدفع

---

## 📖 الوثائق | Documentation

- [API Documentation](../../docs/API.md)
- [Database Schema](../../docs/DATABASE.md)
- [Architecture](../../docs/ARCHITECTURE.md)

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### MongoDB لا يتصل
```bash
mongod  # شغل MongoDB
```

### Port 5000 مشغول
```bash
lsof -i :5000
kill -9 <PID>
```

### أخطاء التبعيات
```bash
rm -rf node_modules
npm install
```

---

## 📝 الخطوات التالية | Next Steps

- [ ] إنشاء Controllers للمسارات
- [ ] إضافة Stripe Integration
- [ ] إضافة Firebase Notifications
- [ ] تطبيق Caching
- [ ] كتابة Unit Tests
- [ ] نشر على Heroku

---

للمزيد من المعلومات، راجع [دليل التطوير](../../docs/DEVELOPMENT.md).
