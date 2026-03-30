# دليل النشر | Deployment Guide

## المعمارية المعتمدة الآن

- `frontend`: React app منشور عبر `Cloudflare Workers Static Assets`
- `edge-api`: Cloudflare Worker يحتوي API والمصادقة
- `D1`: قاعدة البيانات الرئيسية للمستخدمين والمنتجات والطلبات
- `Service Binding`: الواجهة تستدعي `EDGE_API` داخليًا

## 1. المتطلبات

- حساب Cloudflare
- تسجيل دخول Wrangler:
  - `npx wrangler login`
- Node.js و npm

## 2. إعداد قاعدة D1

```bash
cd edge-api
npx wrangler d1 create tarkeeb_pro_db
```

انسخ `database_id` الناتج إلى [edge-api/wrangler.toml](/home/bobby/Desktop/rentit/edge-api/wrangler.toml).

ثم نفّذ المخطط:

```bash
cd edge-api
npm install
npm run db:migrate:remote
```

## 3. إعداد السرّ الخاص بالمصادقة

```bash
cd edge-api
npx wrangler secret put JWT_SECRET
```

استخدم قيمة قوية وطويلة.

## 3.1 Variables and Secrets

### Secrets

- `JWT_SECRET`: secret داخل `edge-api` لتوقيع JWT

### Variables

- `CORS_ALLOWED_ORIGINS`: موجود في [edge-api/wrangler.toml](/home/bobby/Desktop/rentit/edge-api/wrangler.toml)
- `ACCESS_AUD`: موجود في [edge-api/wrangler.toml](/home/bobby/Desktop/rentit/edge-api/wrangler.toml) إذا كان الـ edge API محميًا عبر Cloudflare Access
- `ACCESS_JWKS_URL`: موجود في [edge-api/wrangler.toml](/home/bobby/Desktop/rentit/edge-api/wrangler.toml) للتحقق من توقيع Cloudflare Access JWT
- `API_ORIGIN`: موجود في [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml)
- `DB`: binding قاعدة D1 داخل [edge-api/wrangler.toml](/home/bobby/Desktop/rentit/edge-api/wrangler.toml)

### القيم الحالية المقترحة

- `JWT_SECRET`: اتركه Secret داخل Cloudflare ولا تضعه في الملف
- `CORS_ALLOWED_ORIGINS`: أضف دومين الواجهة النهائي بعد النشر إذا كان مخصصًا
- `ACCESS_AUD`: طابقه مع Audience الخاص بتطبيق Cloudflare Access الذي يحمي رابط الـ edge API المباشر
- `API_ORIGIN`: استخدم رابط الـ edge-api المنشور أو دومين `api` المخصص

## 4. إنشاء حسابات التشغيل

ولّد SQL آمنًا من نفس منطق التشفير المستخدم داخل الـ Worker. الصيغة تدعم الدور كوسيط رابع:

```bash
cd edge-api
npm run admin:sql -- "مسؤول تركيب برو" "admin@tarkeebpro.sa" "your-strong-password" admin
npm run admin:sql -- "خدمة العملاء" "customer-service@tarkeebpro.sa" "your-strong-password" customer_service
npm run admin:sql -- "مدير العمليات" "operations@tarkeebpro.sa" "your-strong-password" operations_manager
```

انسخ ناتج SQL ثم نفّذه على D1:

```bash
npx wrangler d1 execute tarkeeb_pro_db --remote --command "<PASTE_SQL_HERE>"
```

بديل يدوي:
- سجّل حسابًا عاديًا من الواجهة
- ثم حدّث دوره في D1 إلى `admin`

## 5. تشغيل محلي

### Edge API

```bash
cd edge-api
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run cf:dev
```

مهم:
- الواجهة في Cloudflare المحلي تستخدم `/api`
- إذا أردت تشغيل React التقليدي فقط، استخدم `REACT_APP_API_URL`

## 6. النشر

### Edge API

```bash
cd edge-api
npm run deploy
```

### Frontend

```bash
cd frontend
npm run cf:deploy
```

## 7. التحقق بعد النشر

- افتح `https://tarkeeb-pro-frontend.bobkumeel.workers.dev/api/health`
- أنشئ حساب عميل
- سجّل دخول
- أضف منتجًا من حساب أدمن
- أضف منتجًا إلى السلة
- أكمل الطلب
- تأكد من ظهور الطلب في `/orders`
- تأكد من ظهوره في لوحة الأدمن

## 8. ما الذي يعتمد عليك؟

- Cloudflare account جاهز
- `database_id` الحقيقي لـ D1
- قيمة `JWT_SECRET`
- بيانات أول Admin: الاسم، الإيميل، كلمة المرور
- إذا كان لديك دومين مخصص، اسم الدومين الذي تريد ربطه بالمشروع

## 9. ملاحظات مهمة

- ملف [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml) يستخدم `EDGE_API` كـ `Service Binding`
- ملف [frontend/cloudflare/worker.js](/home/bobby/Desktop/rentit/frontend/cloudflare/worker.js) يحتوي fallback على `API_ORIGIN`
- رابط [edge-api](https://tarkeeb-pro-edge-api.bobkumeel.workers.dev/) المباشر قد يرجع خطأ Access إذا كان محميًا في Cloudflare، وهذا متوقع؛ المسار العام المقصود للمتصفح هو `/api` عبر الواجهة
- ملف [edge-api/migrations/schema.sql](/home/bobby/Desktop/rentit/edge-api/migrations/schema.sql) هو المخطط الكامل الحالي
