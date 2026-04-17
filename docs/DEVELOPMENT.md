# Development Guide

## Prerequisites

```bash
node --version
npm --version
```

يفضل أيضًا وجود:

- `wrangler`

## Local Workflow

### الواجهة

```bash
cd frontend
npm install
npm start
```

### الـ API المحلي

```bash
cd edge-api
npm install
npm run dev
```

المسار المحلي الافتراضي:

- `http://127.0.0.1:8787/api`

والواجهة تقرأه من [frontend/.env.development](/home/bobby/Desktop/rentit/frontend/.env.development:1).

### سطح المكتب

```bash
cd desktop
npm install
npm run start
```

## مهمات الصيانة اليومية

### إعادة توليد معاينة Excel

```bash
node scripts/generate-excel-import-asset.mjs
```

### فحوص سريعة قبل الاعتماد

```bash
node --check edge-api/src/index.js
node --check edge-api/src/excelImport.js
node --check edge-api/scripts/import-excel-orders-to-d1.mjs
node --check scripts/generate-excel-import-asset.mjs
cd frontend && npm run build
cd ../desktop && npm run prepare:assets
```

## قواعد التطوير الحالية

- اكتب أي منطق جديد حول الطلبات داخل `edge-api/src/index.js` أو ملفات مساعدة قريبة منه.
- حافظ على `D1` كالمخزن الوحيد للبيانات.
- أي تغيير في صلاحيات الوصول يجب أن يراعي تسجيل الدخول الداخلي و`X-Workspace-Role`.
- إذا غيّرت الواجهة، حدّث `desktop/app` عبر `desktop/scripts/prepare-web-assets.mjs`.
- للتطوير اليومي، شغّل الـ backend محليًا من `edge-api` بدل الاعتماد على API منشور على Cloudflare.

## ما يجب تجنبه

- عدم إعادة إدخال MongoDB أو Supabase أو React Native في المسار الحالي.
- عدم نشر source maps في الإنتاج.
- عدم ترك توثيق قديم يصف مسارات لم تعد موجودة.
