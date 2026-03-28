# عمارة النظام | System Architecture

## نظرة عامة | Overview

تطبيق Tarkeeb Pro يتبع معمارية **Microservices-ready** مع فصل واضح بين المكونات:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
├─────────────────────┬─────────────────────────────────────┤
│   React Web App     │    React Native Mobile App           │
└─────────────────────┴──────────────┬──────────────────────┘
                                     │
                     ┌───────────────┴────────────────┐
                     │                                 │
                     ▼                                 ▼
        ┌──────────────────────────┐    ┌──────────────────────────┐
        │  FACEBOOK / APPLE AUTH   │    │   BACKEND API SERVER     │
        │  (OAuth 2.0)             │    │   (Express.js)           │
        │                          │    │  - User Management       │
        └──────────────────────────┘    │  - Product Management    │
                                        │  - Booking System        │
                                        │  - Payment Processing    │
                                        │  - Review System         │
                                        └──────────────────────────┘
                                                │
                                ┌───────────────┼───────────────┐
                                ▼               ▼               ▼
                        ┌─────────────┐  ┌─────────────┐  ┌────────────┐
                        │  MongoDB    │  │  Stripe     │  │   Firebase │
                        │  Database   │  │  Payment    │  │ Notifications
                        │             │  │  Gateway    │  │            │
                        └─────────────┘  └─────────────┘  └────────────┘
```

---

## مكونات النظام | System Components

### 1. Backend (Node.js + Express)
- **REST API** للتطبيقات الأمامية
- **مصادقة JWT** آمنة
- **نموذج MVC**
- **معالجة الأخطاء** المركزية
- **تسجيل العمليات** (Logging)

### 2. Frontend (React)
- **واجهة مستخدم حديثة** وتفاعلية
- **إدارة الحالة** باستخدام Zustand
- **نماذج** باستخدام React Hook Form
- **تصميم الاستجابة** مع Tailwind CSS

### 3. Mobile (React Native)
- **نفس منطق العمل** كـ Web
- **تجربة محلية** متقدمة
- **دعم الإشعارات** عبر Firebase
- **دعم الدفع** عبر Apple Pay و Google Pay

### 4. Database (MongoDB)
- **تخزين بيانات آمن** ومركزي
- **نماذج مرنة** مع Mongoose
- **مؤشرات متقدمة** للبحث السريع
- **موثوقية عالية** وقابلية التوسع

---

## تدفق البيانات | Data Flow

### تدفق تسجيل المستخدم | Registration Flow
```
1. المستخدم يملأ النموذج → Frontend
2. التحقق من الصحة → Frontend
3. إرسال البيانات → Backend
4. التحقق من البريد الموجود → Database
5. تشفير كلمة المرور → Backend
6. حفظ المستخدم → Database
7. إنشاء JWT Token → Backend
8. إرجاع البيانات → Frontend
```

### تدفق عملية تأجير | Booking Flow
```
1. اختيار منتج → Frontend/Mobile
2. اختيار التواريخ → Frontend/Mobile
3. عرض السعر الإجمالي → Frontend/Mobile
4. تأكيد الحجز → Frontend/Mobile
5. معالجة الدفع → Stripe
6. حفظ الحجز → Database
7. إشعار المستخدم → Firebase
8. تحديث المخزون → Database
```

---

## مسارات الـ API | API Routes

```
Authentication:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/profile
  PUT    /api/auth/profile
  POST   /api/auth/refresh-token

Products:
  GET    /api/products (with filters)
  GET    /api/products/:id
  POST   /api/products (vendor only)
  PUT    /api/products/:id (owner only)
  DELETE /api/products/:id (owner only)
  GET    /api/products/:id/reviews

Bookings:
  POST   /api/bookings
  GET    /api/bookings (user's bookings)
  GET    /api/bookings/:id
  PUT    /api/bookings/:id
  DELETE /api/bookings/:id

Payments:
  POST   /api/payments
  GET    /api/payments/:id
  POST   /api/payments/:id/refund

Reviews:
  POST   /api/reviews
  GET    /api/reviews/:productId
  PUT    /api/reviews/:id
  DELETE /api/reviews/:id
```

---

## نموذج قاعدة البيانات | Database Schema

### Collections الرئيسية:

1. **Users** - بيانات المستخدمين
2. **Products** - المنتجات والخدمات
3. **Bookings** - الطلبات
4. **Payments** - المدفوعات
5. **Reviews** - التقييمات

---

## معايير الأمان | Security Standards

- ✅ تشفير كلمات المرور بـ bcryptjs
- ✅ مصادقة JWT آمنة
- ✅ التحقق من صحة الإدخال
- ✅ حماية CORS
- ✅ استخدام Helmet للرؤوس الآمنة
- ✅ دوران التوكن في الجلسات الطويلة
