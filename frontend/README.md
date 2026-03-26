# RentIT Frontend Application

## 🚀 البدء السريع | Quick Start

### المتطلبات | Requirements
- Node.js v16+
- npm أو yarn

### التثبيت والتشغيل | Installation & Setup

```bash
# تثبيت الحزم
npm install

# إعداد المتغيرات
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# تشغيل التطبيق
npm start

# بناء للإنتاج
npm run build
```

للنشر على Cloudflare Workers Static Assets:

```bash
npm run cf:deploy
```

---

## 📁 بنية المشروع | Project Structure

```
frontend/
├── src/
│   ├── components/       # مكونات قابلة لإعادة الاستخدام
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   └── BookingForm.jsx
│   ├── pages/            # صفحات التطبيق
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── BookingDetail.jsx
│   │   ├── Profile.jsx
│   │   └── Checkout.jsx
│   ├── context/          # State Management
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   ├── services/         # API Integration
│   │   └── api.js
│   ├── App.jsx
│   └── index.js
├── package.json
└── .env.example
```

---

## 🎨 المكونات الرئيسية | Main Components

### المصادقة | Authentication
- تسجيل جديد
- تسجيل دخول
- استعادة كلمة المرور

### المنتجات | Products
- عرض جميع المنتجات
- البحث والتصفية
- تفاصيل المنتج

### الحجوزات | Bookings
- عرض الحجوزات
- إنشاء حجز جديد
- إلغاء الحجز

### الدفع | Payment
- نموذج بطاقة الائتمان
- معالجة الدفع
- تأكيد الدفع

---

## 🔗 التكامل مع الـ Backend | Backend Integration

```javascript
// استخدام API Service
import { authService, productService, bookingService } from './services/api';

// تسجيل الدخول
const login = async (email, password) => {
  const response = await authService.login(email, password);
  localStorage.setItem('authToken', response.data.token);
};

// الحصول على المنتجات
const getProducts = async () => {
  const response = await productService.getAll({ category: 'device' });
  return response.data.products;
};
```

---

## 🎯 الميزات | Features

- ✅ واجهة مستخدم حديثة ومستجيبة
- ✅ نظام مصادقة آمن
- ✅ عرض ديناميكي للمنتجات
- ✅ سلة التسوق الذكية
- ✅ نظام الدفع الآمن
- ✅ الملف الشخصي

---

## 🛠️ أدوات التطوير | Development Tools

- **React**: مكتبة UI
- **React Router**: التوجيه (Routing)
- **Zustand**: إدارة الحالة
- **React Hook Form**: إدارة النماذج
- **Tailwind CSS**: التصميم

---

## 🚀 النشر | Deployment

### نشر على Cloudflare

هذا المشروع مجهز الآن للنشر عبر `Cloudflare Workers Static Assets`.

```bash
# أول مرة فقط
npm install

# تسجيل الدخول إلى Cloudflare
npx wrangler login

# نشر الواجهة
npm run cf:deploy
```

الواجهة تستخدم نفس الدومين للـ API في الإنتاج عبر proxy داخل Worker:

- المتصفح يطلب `/api/...`
- Worker يمرر الطلب إلى `API_ORIGIN`
- لا تحتاج إعداد `CORS` في المتصفح بين الـ frontend والـ backend

---

## 📖 الوثائق | Documentation

- [API Documentation](../../docs/API.md)
- [Architecture](../../docs/ARCHITECTURE.md)
- [Development Guide](../../docs/DEVELOPMENT.md)

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### الخادم لا يستجيب
```bash
# تحقق من أن Backend يعمل على port 5000
# تحقق من REACT_APP_API_URL في .env.local
```

### مشاكل البحث
```bash
# امسح الـ LocalStorage والـ Cache
# Ctrl + Shift + Delete
```

---

## 📝 الخطوات التالية | Next Steps

- [ ] إضافة المزيد من المكونات
- [ ] تطبيق التصفية المتقدمة
- [ ] إضافة الخريطة والموقع
- [ ] تحسين الأداء
- [ ] إضافة الاختبارات
- [ ] نشر على الويب

---

للمزيد من المعلومات، راجع [دليل التطوير](../../docs/DEVELOPMENT.md).
