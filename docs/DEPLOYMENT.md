# دليل النشر | Deployment Guide

## المعمارية الحالية

- `frontend`: React app منشور عبر Cloudflare Workers Static Assets
- `edge-api`: Cloudflare Worker يحتوي المصادقة والطلبات والإشعارات
- `backend`: Node/Express لبيئة التطوير أو التكاملات المحلية
- `D1`: قاعدة البيانات المعتمدة للحسابات والطلبات داخل Cloudflare
- `Service Binding`: الواجهة تستدعي `EDGE_API` داخليًا عبر `/api`

## الحسابات المعتمدة فقط

لا يوجد بعد الآن:
- حساب إدارة عام
- حساب فني مستقل
- صفحة إدارة قديمة
- صفحة فني قديمة

الحسابات المعتمدة هي فقط:
- 4 حسابات مناطق بدور `regional_dispatcher`
- حساب `customer_service`
- حساب `operations_manager`

## 1. المتطلبات

- حساب Cloudflare مفعل
- تسجيل دخول Wrangler:
  - `npx wrangler login`
- Node.js و npm

## 2. إعداد D1

إذا لم تكن قاعدة `tarkeeb_pro_db` موجودة:

```bash
cd edge-api
npx wrangler d1 create tarkeeb_pro_db
```

ثم حدّث `database_id` داخل [edge-api/wrangler.toml](/home/bobby/Desktop/rentit/edge-api/wrangler.toml).

## 3. تنفيذ المخطط وتهيئة الحسابات

نفّذ المخطط الأساسي:

```bash
cd edge-api
npm install
npx wrangler d1 execute tarkeeb_pro_db --remote --file=./migrations/schema.sql
```

ثم امسح الطلبات القديمة والحسابات القديمة وابقِ فقط الحسابات المعتمدة:

```bash
cd edge-api
npx wrangler d1 execute tarkeeb_pro_db --remote --file=./migrations/0017_clear_legacy_service_orders.sql
npx wrangler d1 execute tarkeeb_pro_db --remote --file=./migrations/0018_reset_internal_accounts.sql
```

## 4. Secrets و Vars

### داخل `edge-api`

Secret مطلوب:
- `JWT_SECRET`

Secret مستحسن للإشعارات:
- `WEB_PUSH_PRIVATE_KEY`

Vars موجودة أو مطلوبة:
- `CORS_ALLOWED_ORIGINS`
- `ACCESS_AUD`
- `ACCESS_JWKS_URL`
- `WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_CONTACT_EMAIL`

أوامر الإعداد:

```bash
cd edge-api
npx wrangler secret put JWT_SECRET
npx wrangler secret put WEB_PUSH_PRIVATE_KEY
```

### داخل `frontend`

Vars:
- `API_ORIGIN`
- `EDGE_API` كـ Service Binding

## 5. PWA والإشعارات

الواجهة تدعم الآن:
- `Add to Home Screen`
- `manifest.webmanifest`
- `service worker`
- Push notifications عبر `/api/notifications/subscribe`

لكي تعمل الإشعارات على Cloudflare بشكل كامل:
- تأكد من وجود `WEB_PUSH_PRIVATE_KEY`
- تأكد من بقاء `WEB_PUSH_PUBLIC_KEY` مطابقًا له
- اسمح بالإشعارات من الجوال بعد تسجيل الدخول

## 6. التشغيل المحلي

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

### Backend

```bash
cd backend
npm install
npm run dev
```

## 7. النشر

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

## 8. التحقق بعد النشر

- افتح `/login`
- سجّل الدخول بحساب منطقة أو خدمة العملاء أو مدير العمليات
- فعّل `Add to Home Screen` من الجوال
- فعّل الإشعارات من الشريط العلوي داخل التطبيق
- غيّر حالة طلب وتأكد من وصول التنبيه
- تأكد أن حسابات المناطق تدخل إلى `/regions`
- تأكد أن خدمة العملاء تدخل إلى `/customer-service`
- تأكد أن مدير العمليات يدخل إلى `/operations-manager`

## 9. ملاحظات مهمة

- ملف [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml) يربط الواجهة مباشرة مع `EDGE_API`
- ملف [frontend/cloudflare/worker.js](/home/bobby/Desktop/rentit/frontend/cloudflare/worker.js) يحتوي fallback إلى `API_ORIGIN`
- ملف [edge-api/migrations/0018_reset_internal_accounts.sql](/home/bobby/Desktop/rentit/edge-api/migrations/0018_reset_internal_accounts.sql) هو إعادة الضبط المعتمدة للحسابات الداخلية
- ملف [edge-api/src/index.js](/home/bobby/Desktop/rentit/edge-api/src/index.js) أصبح يرسل إشعارات push مباشرة للمستخدم المستهدف عند إنشاء notification

## 10. D1 أم Supabase؟

- `D1` هو الخيار الأفضل للنظام التشغيلي الحالي داخل Cloudflare لأن الـ Worker يتعامل معه محليًا تقريبًا وبدون طبقة شبكة إضافية.
- إذا كانت لديكم قاعدة قديمة أكبر حجماً أو تتوقعون نموًا يتجاوز سعة قاعدة تشغيل صغيرة، فالأفضل نقل البيانات الكبيرة أو التاريخية إلى `Supabase Postgres`.
- لا أنصح بجعل التطبيق يكتب إلى `D1` و `Supabase` مباشرة في كل طلب الآن، لأن ذلك يضيف تعقيدًا واحتمالات تعارض بدون حاجة واضحة.
- المسار المعتمد في هذا المستودع الآن هو:
  - إبقاء `D1` كقاعدة التشغيل الأساسية.
  - استخدام `Supabase` كمسار هجرة أو نسخة أكبر للبيانات عند الحاجة.
  - استخدام أرشفة `JSONB` داخل Supabase للقاعدة القديمة إذا كانت أكبر أو غير متوافقة بالكامل مع المخطط التشغيلي الحالي.

### إعداد Supabase كوجهة للهجرة

نفّذ مخطط Supabase أولاً داخل مشروع Supabase:

```bash
psql "$SUPABASE_DB_URL" -f ./edge-api/migrations/supabase_schema.sql
```

أو انسخ محتوى [edge-api/migrations/supabase_schema.sql](/home/bobby/Desktop/rentit/edge-api/migrations/supabase_schema.sql) إلى SQL Editor داخل Supabase.

ثم اضبط المتغيرات التالية:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_SCHEMA=public
SUPABASE_SYNC_BATCH_SIZE=500
D1_DATABASE_NAME=tarkeeb_pro_db
D1_SYNC_REMOTE=true
```

ثم شغّل مزامنة من `D1` إلى Supabase:

```bash
cd edge-api
npm run db:sync:supabase
```

مزامنة جزئية:

```bash
cd edge-api
node ./scripts/sync-d1-to-supabase.mjs --table=users,products,service_orders
```

فحص بدون رفع بيانات:

```bash
cd edge-api
node ./scripts/sync-d1-to-supabase.mjs --dry-run
```

### أرشفة القاعدة القديمة من MongoDB إلى Supabase

هذا هو الخيار الأفضل إذا كانت البيانات القديمة كبيرة أو متنوعة ولا تريدون المجازفة بتحويلها فورًا إلى الجداول التشغيلية الحالية.

السكربت يحفظ كل مستند MongoDB كما هو داخل جداول `legacy_mongo_*` بصيغة `JSONB` داخل Supabase، وبذلك:

- لا نخسر أي حقل قديم.
- لا نعطل النظام الحالي على `D1`.
- يمكننا لاحقًا تحويل البيانات المهمة فقط إلى الجداول التشغيلية الجديدة.

شغّل الأرشفة الكاملة:

```bash
cd backend
npm run db:archive:supabase
```

أرشفة مجموعات محددة فقط:

```bash
cd backend
node ./scripts/archive-mongodb-to-supabase.mjs --collection=users,products,bookings
```

فحص بدون رفع:

```bash
cd backend
node ./scripts/archive-mongodb-to-supabase.mjs --dry-run
```

الجداول التي يستقبلها هذا المسار موجودة داخل [edge-api/migrations/supabase_schema.sql](/home/bobby/Desktop/rentit/edge-api/migrations/supabase_schema.sql):

- `legacy_mongo_users`
- `legacy_mongo_products`
- `legacy_mongo_bookings`
- `legacy_mongo_payments`
- `legacy_mongo_reviews`
- `legacy_mongo_service_orders`
- `legacy_mongo_subscriptions`
