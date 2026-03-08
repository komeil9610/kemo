# RentIT Mobile Application

## 🚀 البدء السريع | Quick Start

### المتطلبات | Requirements
- Node.js v16+
- Expo CLI
- iOS Simulator أو Android Emulator

### التثبيت والتشغيل | Installation & Setup

```bash
# تثبيت الحزم
npm install

# إعداد المتغيرات
echo "REACT_NATIVE_API_URL=http://localhost:5000/api" > .env.local

# تشغيل على Android
npm run android

# تشغيل على iOS
npm run ios

# تشغيل بـ Expo
npm start
```

---

## 📁 بنية المشروع | Project Structure

```
mobile/
├── src/
│   ├── screens/          # الشاشات الرئيسية
│   │   ├── HomeScreen.js
│   │   ├── ProductsScreen.js
│   │   ├── BookingScreen.js
│   │   ├── ProfileScreen.js
│   │   └── CheckoutScreen.js
│   ├── components/       # المكونات المستخدمة في الشاشات
│   │   ├── ProductCard.js
│   │   ├── BookingForm.js
│   │   └── PaymentMethod.js
│   ├── navigation/       # التوجيه (Navigation)
│   ├── services/         # API Integration
│   ├── context/          # State Management
│   ├── App.js
│   └── index.js
├── app.json
├── package.json
└── .env.example
```

---

## 📱 الشاشات الرئيسية | Main Screens

### Home Screen
- عرض المنتجات المميزة
- البحث السريع
- الفئات

### Products Screen
- عرض المنتجات بـ Grid
- البحث والتصفية
- الفرز حسب السعر

### Booking Screen
- تاريخ البداية والنهاية
- كمية المنتج
- الخيارات الإضافية

### Profile Screen
- بيانات المستخدم
- حجوزاتي
- المدفوعات
- التقييمات

### Checkout Screen
- مراجعة الطلب
- اختيار طريقة الدفع
- تأكيد الدفع

---

## 🔗 التكامل مع الـ Backend | Backend Integration

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_NATIVE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة Token في الطلبات
apiClient.interceptors.request.use((config) => {
  const token = AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 🎯 الميزات | Features

- ✅ تطبيق محلي بدون اتصال
- ✅ الإشعارات الفورية
- ✅ الدفع الآمن عبر Apple Pay و Google Pay
- ✅ البحث الجغرافي
- ✅ الملف الشخصي
- ✅ التقييمات والمراجعات

---

## 🛠️ أدوات التطوير | Development Tools

- **React Native**: إطار العمل
- **Expo**: الأدوات والقيثارة
- **React Navigation**: التوجيه
- **Firebase**: الإشعارات والمصادقة
- **Stripe SDK**: معالجة الدفع

---

## 📦 البناء والنشر | Build & Deployment

### بناء APK (Android)

```bash
eas build --platform android --type apk
```

### بناء IPA (iOS)

```bash
eas build --platform ios
```

### نشر على Google Play Store

```bash
eas submit --platform android
```

### نشر على Apple App Store

```bash
eas submit --platform ios
```

---

## 📖 الوثائق | Documentation

- [API Documentation](../../docs/API.md)
- [Architecture](../../docs/ARCHITECTURE.md)
- [Development Guide](../../docs/DEVELOPMENT.md)

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### الجهاز الوهمي لا يبدأ
```bash
# أعد تشغيل Expo
npm start

# امسح الذاكرة النقطية
npm start -- -c
```

### مشاكل الاتصال بالخادم
```bash
# تأكد من أن Backend يعمل
# تحقق من IP Address
# استخدم LocalHost إذا كان على نفس الجهاز
```

---

## 📝 الخطوات التالية | Next Steps

- [ ] إضافة المزيد من الشاشات
- [ ] تطبيق الخرائط
- [ ] إضافة الكاميرا للصور
- [ ] تحسين الأداء
- [ ] إضافة الاختبارات
- [ ] نشر على App Stores

---

للمزيد من المعلومات، راجع [دليل التطوير](../../docs/DEVELOPMENT.md).
