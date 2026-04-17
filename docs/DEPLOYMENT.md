# دليل النشر | Deployment Guide

## المعمارية الحالية

- `frontend`: React app منشور عبر Cloudflare Workers Static Assets
- `edge-api`: Cloudflare Worker يحتوي المصادقة والطلبات والإشعارات
- `D1`: قاعدة البيانات الوحيدة المعتمدة للحسابات والطلبات داخل Cloudflare
- `Service Binding`: الواجهة تستدعي `EDGE_API` داخليًا عبر `/api`

ملاحظة:

- للتطوير المحلي لم يعد مطلوبًا نشر الـ backend على Cloudflare.
- شغّل [edge-api/package.json](/home/bobby/Desktop/rentit/edge-api/package.json:1) عبر `npm run dev` ليعمل محليًا على `http://127.0.0.1:8787/api`.

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
- `WEB_PUSH_PUBLIC_KEY`
- `WEB_PUSH_CONTACT_EMAIL`
- `INBOUND_EMAIL_ALLOWED_TO`
- `INBOUND_EMAIL_FORWARD_TO`
- `INBOUND_EMAIL_ALERT_TO`

Bindings إضافية:
- `SEND_EMAIL` داخل [edge-api/wrangler.toml](/home/bobby/Desktop/rentit/edge-api/wrangler.toml)

أوامر الإعداد:

```bash
cd edge-api
npx wrangler secret put JWT_SECRET
npx wrangler secret put WEB_PUSH_PRIVATE_KEY
```

للبريد عبر Cloudflare Email Routing:

- فعّل `Email Routing` على نفس الدومين داخل Cloudflare.
- أضف عنوانًا أو أكثر كـ verified destination addresses.
- أنشئ Email Worker route يوجّه عنوانًا مثل `support@kumeelalnahab.com` إلى هذا Worker.
- الصناديق المعتمدة حاليًا في المشروع: `hashimaldrweish@kumeelalnahab.com`, `bookings@kumeelalnahab.com`, `customerservice@kumeelalnahab.com`, `info@kumeelalnahab.com`.
- الوجهة الحالية للتحويل: `kumeelalnahab@gmail.com`.
- اضبط `INBOUND_EMAIL_FORWARD_TO` إذا كنت تريد تحويل الرسالة الأصلية إلى صندوق بريد فعلي.
- اضبط `INBOUND_EMAIL_ALERT_TO` إذا كنت تريد إرسال رسالة تنبيه مختصرة باستخدام binding `SEND_EMAIL`.
- الإرسال التلقائي يستخدم `message.to` كمرسل، لذلك يجب أن يكون عنوان الاستقبال على نفس الدومين المفعّل في Email Routing.

### داخل `frontend`

Vars:
- `API_ORIGIN`
- `EXCEL_UPLOAD_ORIGIN`
- `EDGE_API` كـ Service Binding

إذا أردت أن يبقى الموقع عامًا على `kumeelalnahab.com` لكن تمر طلبات رفع Excel عبر جهازك:

- اترك `API_ORIGIN` و`EDGE_API` كما هما لبقية النظام.
- اضبط `EXCEL_UPLOAD_ORIGIN` على عنوان عام يصل إلى جهازك مثل `https://excel-upload.kumeelalnahab.com`.
- هذا العنوان يجب أن يوجّه إلى `edge-api` العامل على جهازك محليًا.
- المسارات التي ستنتقل إلى جهازك فقط هي:
  - `/api/operations/excel-import/preview-upload`
  - `/api/operations/excel-import/upload`
- بقية الطلبات ستبقى على Cloudflare كالمعتاد.

## 5. إعداد الدومين `kumeelalnahab.com`

ملفات التهيئة أصبحت مهيأة على النطاقات التالية:

- `https://kumeelalnahab.com` للواجهة
- `https://www.kumeelalnahab.com` كاسم إضافي للواجهة
- `https://api.kumeelalnahab.com` للـ API المباشر

بعد ذلك داخل Cloudflare:

- اربط الدومين أو الـ zone الخاصة بـ `kumeelalnahab.com`
- تأكد أن Worker الواجهة مربوط على الدومينين:
  - `kumeelalnahab.com`
  - `www.kumeelalnahab.com`
- تأكد أن Worker الـ API مربوط على:
  - `api.kumeelalnahab.com`
- إذا كانت هناك سياسة `Cloudflare Access` أو `Zero Trust Access` على `kumeelalnahab.com` أو `api.kumeelalnahab.com` فقم بتعطيلها من لوحة Cloudflare حتى يصبح الوصول مباشرًا

## 6. PWA والإشعارات

الواجهة تدعم الآن:
- `Add to Home Screen`
- `manifest.webmanifest`
- `service worker`
- Push notifications عبر `/api/notifications/subscribe`

لكي تعمل الإشعارات على Cloudflare بشكل كامل:
- تأكد من وجود `WEB_PUSH_PRIVATE_KEY`
- تأكد من بقاء `WEB_PUSH_PUBLIC_KEY` مطابقًا له
- اسمح بالإشعارات من الجوال بعد تسجيل الدخول

## 7. التشغيل المحلي

### Edge API

```bash
cd edge-api
npm run dev
```

إذا كان هذا الخادم سيستقبل رفع Excel من المستخدمين عبر الموقع العام:

- اجعل `JWT_SECRET` في [edge-api/.env](/home/bobby/Desktop/rentit/edge-api/.env:1) مطابقًا لسر الإنتاج حتى تُقبل توكنات تسجيل الدخول القادمة من `kumeelalnahab.com`.
- انشره بعنوان عام عبر Tunnel أو reverse proxy ثم ضع هذا العنوان في `EXCEL_UPLOAD_ORIGIN` داخل [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml:1) قبل نشر الواجهة.

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

## 8. النشر

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

## 9. التحقق بعد النشر

- افتح `/login`
- افتح `https://kumeelalnahab.com/api/health` وتأكد أن الرد `ok`
- سجّل الدخول بحساب منطقة أو خدمة العملاء أو مدير العمليات
- فعّل `Add to Home Screen` من الجوال
- فعّل الإشعارات من الشريط العلوي داخل التطبيق
- غيّر حالة طلب وتأكد من وصول التنبيه
- تأكد أن حسابات المناطق تدخل إلى `/regions`
- تأكد أن خدمة العملاء تدخل إلى `/customer-service`
- تأكد أن مدير العمليات يدخل إلى `/operations-manager`

## 10. ملاحظات مهمة

- ملف [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml) يربط الواجهة مباشرة مع `EDGE_API`
- ملف [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml) يدعم الآن `EXCEL_UPLOAD_ORIGIN` لتوجيه رفع Excel فقط إلى خادم عام على جهازك
- ملف [frontend/cloudflare/worker.js](/home/bobby/Desktop/rentit/frontend/cloudflare/worker.js) يحتوي fallback إلى `API_ORIGIN`
- ملف [frontend/cloudflare/worker.js](/home/bobby/Desktop/rentit/frontend/cloudflare/worker.js) يوجّه مسارات رفع Excel فقط إلى `EXCEL_UPLOAD_ORIGIN` عندما يكون مضبوطًا
- ملف [frontend/cloudflare/worker.js](/home/bobby/Desktop/rentit/frontend/cloudflare/worker.js) يمرر طلبات الواجهة والـ API ويضيف رؤوس أمان صارمة
- ملف [edge-api/migrations/0018_reset_internal_accounts.sql](/home/bobby/Desktop/rentit/edge-api/migrations/0018_reset_internal_accounts.sql) هو إعادة الضبط المعتمدة للحسابات الداخلية
- ملف [edge-api/src/index.js](/home/bobby/Desktop/rentit/edge-api/src/index.js) أصبح يرسل إشعارات push مباشرة للمستخدم المستهدف عند إنشاء notification
- النشر الإنتاجي المعتمد في هذا المستودع أصبح مبنيًا على `Cloudflare Workers + D1` فقط
- أي تكاملات قديمة مع قواعد أخرى تعتبر خارج المسار التشغيلي الحالي وليست جزءًا من الإعداد المعتمد
