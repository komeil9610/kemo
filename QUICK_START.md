# Quick Start

هذا الدليل يجهز المشروع على المسار الحالي فقط: `Local backend + Frontend + D1 + Desktop/Web`.

## 1. تثبيت الحزم

```bash
cd /home/bobby/Desktop/rentit
npm install
cd frontend && npm install
cd ../edge-api && npm install
cd ../desktop && npm install
```

## 2. تجهيز قاعدة D1

```bash
cd /home/bobby/Desktop/rentit/edge-api
npm run db:migrate:local
```

عند النشر أو العمل على القاعدة الحقيقية:

```bash
npm run db:migrate:remote
```

## 3. تشغيل الواجهة محليًا

```bash
cd /home/bobby/Desktop/rentit/frontend
npm start
```

الواجهة المحلية تعمل عادة على:

- `http://localhost:3000`

## 4. تشغيل الـ backend محليًا

```bash
cd /home/bobby/Desktop/rentit/edge-api
npm run dev
```

هذا يشغّل الخادم المحلي على `http://127.0.0.1:8787/api`.

## ربط الـ Backend مع الـ Frontend (Local Link)

1. تأكد أن `edge-api` يعمل على `http://127.0.0.1:8787`.
2. تأكد أن `frontend/.env.development` يحتوي:

```bash
REACT_APP_API_URL=http://127.0.0.1:8787/api
```

3. شغّل الواجهة:

```bash
cd /home/bobby/Desktop/rentit/frontend
npm start
```

الآن الواجهة تستخدم الـ backend المحلي مباشرة عبر `http://127.0.0.1:8787/api`.

## 5. بناء نسخة سطح المكتب

```bash
cd /home/bobby/Desktop/rentit/desktop
npm run build:desktop
```

## 6. التحقق السريع

```bash
cd /home/bobby/Desktop/rentit
node --check edge-api/src/index.js
node --check edge-api/src/excelImport.js
node --check edge-api/scripts/import-excel-orders-to-d1.mjs
node --check scripts/generate-excel-import-asset.mjs
cd frontend && npm run build
cd ../desktop && npm run prepare:assets
```

## نقاط العمل الحالية

- ملف Excel المرجعي: `data/data.xlsx`
- معاينة الاستيراد الجاهزة للواجهة: `frontend/public/excel-import/orders.json`
- الحساب المشترك:
  - `bobmorgann2@gmail.com`
  - `Komeil9610@@@`

## إذا ظهرت مشكلة

- إذا فشل `npm run build` في `frontend` فابدأ بمراجعـة الاستيرادات غير المستخدمة أو مسارات الملفات المحذوفة.
- إذا لم يعمل الـ backend المحلي فتأكد من وجود [edge-api/.env](/home/bobby/Desktop/rentit/edge-api/.env:1) ومن نجاح `npm run dev` داخل `edge-api`.
- إذا لم تعمل الأدوار المشتركة على القاعدة الحقيقية فطبّق المايغريشن `0024_shared_internal_workspace_roles.sql`.
