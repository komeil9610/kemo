# دليل النشر | Deployment Guide

## خوادم الإنتاج | Production Servers

### الخوادم الموصى بها | Recommended Hosting

- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Mobile**: Google Play Store, Apple App Store
- **Database**: MongoDB Atlas, AWS DocumentDB

---

## نشر Backend على Heroku

### الخطوات | Steps

```bash
# 1. تثبيت Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# 2. تسجيل الدخول
heroku login

# 3. إنشاء Heroku App
heroku create rentit-backend

# 4. إضافة متغيرات البيئة
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set STRIPE_SECRET_KEY=your_stripe_key

# 5. إضافة Procfile
echo "web: npm start" > Procfile

# 6. دفع الكود
git push heroku main
```

### ملف Procfile

```
web: node src/server.js
```

---

## نشر Frontend على Vercel

### الخطوات | Steps

```bash
# 1. تثبيت Vercel CLI
npm install -g vercel

# 2. نشر المشروع
vercel

# 3. التكوين
# اختر المجلد: frontend
# اختر الفريموورك: React
# اختر الإخراج: build

# 4. متغيرات البيئة
# أضف على Vercel Dashboard:
# REACT_APP_API_URL = https://your-backend.herokuapp.com/api
```

### ملف vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "REACT_APP_API_URL": "@react_app_api_url"
  }
}
```

---

## نشر Mobile على App Stores

### Google Play Store

```bash
# 1. بناء APK
cd mobile
eas build --platform android

# 2. اختبار التطبيق
# ثم ارفعه على Google Play Console
```

### Apple App Store

```bash
# 1. بناء IPA
eas build --platform ios

# 2. اختبار عبر TestFlight
# ثم ارفعه على App Store Connect
```

---

## التوسع والمراقبة | Scaling & Monitoring

### استخدام CDN

```javascript
// في Backend
const express = require('express');
const cloudinary = require('cloudinary');

app.use(express.static('public'));
// صور Cloudinary

// في Frontend
<img src="https://res.cloudinary.com/..." />
```

### المراقبة | Monitoring

```bash
# استخدم PM2 للمراقبة
npm install -g pm2

# بدء التطبيق
pm2 start src/server.js --name rentit

# المراقبة
pm2 monit
pm2 logs
```

---

## النسخ الاحتياطية | Backups

### MongoDB Atlas

```bash
# تفعيل النسخ الاحتياطية التلقائية
# في MongoDB Atlas Dashboard > Backup
```

### النسخ اليدوية

```bash
# نسخ احتياطي
mongodump --uri "mongodb+srv://..." --archive=rentit_backup.archive

# استعادة
mongorestore --uri "mongodb+srv://..." --archive=rentit_backup.archive
```

---

## شهادات SSL | SSL Certificates

### Heroku (مجاني)

```bash
# تفعيل HTTPS تلقائياً
heroku config:set DISABLE_COLLECTSTATIC=1
```

### Vercel (مجاني)

```bash
# HTTPS مُفعّل افتراضياً
# لا تحتاج إلى أي إجراء إضافي
```

---

## متغيرات الإنتاج | Production Environment Variables

```bash
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rentit_db
JWT_SECRET=very_long_random_secret_key_min_32_chars
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLIC_KEY=pk_live_...
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=app_password
FIREBASE_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=rentit-production

# Frontend
REACT_APP_API_URL=https://your-backend.com/api
REACT_APP_STRIPE_KEY=pk_live_...

# Mobile
REACT_NATIVE_API_URL=https://your-backend.com/api
```

---

## فحص قبل النشر | Pre-Deployment Checklist

- ✅ اختبار جميع المسارات (Routes)
- ✅ التحقق من الأخطاء والـ Logs
- ✅ اختبار Payments مع Stripe
- ✅ اختبار المصادقة (Authentication)
- ✅ اختبار الإشعارات (Firebase)
- ✅ التحقق من متغيرات البيئة
- ✅ اختبار الأداء والسرعة
- ✅ اختبار على أجهزة آلية (Mobile)
- ✅ نسخ احتياطية من قاعدة البيانات
- ✅ إعداد المراقبة والـ Logs

---

## مراقبة الأخطاء | Error Tracking

### استخدام Sentry

```javascript
const Sentry = require("@sentry/node");

Sentry.init({ dsn: "your-sentry-dsn" });

app.use(Sentry.Handlers.errorHandler());
```

---

## الأداء | Performance

### استخدام Firebase Cloud Functions

```javascript
// للعمليات الثقيلة
const functions = require('firebase-functions');

exports.processBooking = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    // معالجة الحجز
  });
```
