# Edge API

واجهة الـ API الحالية تعمل محليًا أثناء التطوير على جهازك، مع بقاء الكود متوافقًا مع `Cloudflare Workers + D1` عند الحاجة.

## المسار المدعوم

- `POST /api/auth/login`
- `GET /api/operations/dashboard`
- `GET /api/operations/summary`
- `POST /api/operations/orders`
- `PUT /api/operations/orders/:id`
- `PUT /api/operations/orders/:id/status`
- `POST /api/operations/excel-import/preview-upload`
- `POST /api/operations/excel-import/upload`
- `GET /api/notifications`
- `PUT /api/notifications/read-all`
- `PUT /api/notifications/:id/read`

## Bindings

- `DB` ربط `D1`
- `SEND_EMAIL` ربط Cloudflare Email Routing لإرسال تنبيه عند استقبال بريد جديد
- `JWT_SECRET` سر JWT
- `CORS_ALLOWED_ORIGINS` قائمة Origins المحلية
- `WEB_PUSH_PUBLIC_KEY` المفتاح العام للإشعارات
- `WEB_PUSH_CONTACT_EMAIL` بريد الجهة المرسلة للإشعارات
- `INBOUND_EMAIL_ALLOWED_TO` قائمة صناديق الاستقبال المسموح للـ Worker بمعالجتها
- `INBOUND_EMAIL_FORWARD_TO` قائمة بريد مفصولة بفواصل لتحويل البريد الوارد إليها
- `INBOUND_EMAIL_ALERT_TO` قائمة بريد مفصولة بفواصل لإرسال ملخص عن الرسائل الواردة

## التشغيل المحلي

```bash
cd edge-api
npm install
npm run dev
```

المسار المحلي الافتراضي:

- `http://127.0.0.1:8787/api`

للتطوير المحلي:

- ملف `.env` الحالي يكفي لتشغيل `JWT_SECRET` المحلي.
- `npm run dev` يشغّل `scripts/start-local-backend.mjs`.
- إذا احتجت تشغيل Wrangler مباشرة ما زال متاحًا عبر `npm run dev:wrangler`.

إذا أردت استقبال رفع Excel من الموقع العام على هذا الخادم المحلي:

- اجعل `JWT_SECRET` المحلي مساويًا لسر الإنتاج حتى تقبل التوكنات القادمة من المستخدمين المسجلين على `kumeelalnahab.com`.
- انشر هذا الخادم بعنوان عام ثابت، ثم استخدم هذا العنوان في `EXCEL_UPLOAD_ORIGIN` داخل [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml:1).

## المايغريشن

```bash
npm run db:migrate:local
npm run db:migrate:remote
```

مايغريشن الحساب المشترك والأدوار:

- `migrations/0024_shared_internal_workspace_roles.sql`

## ملاحظات

- `D1` هي القاعدة الوحيدة المعتمدة.
- الواجهة ترسل الدور الفعال عبر `X-Workspace-Role`.
- الوصول المباشر الإنتاجي إلى الـ API يعتمد على تسجيل الدخول الداخلي وصلاحيات الدور.
- الواجهة التطويرية مربوطة مباشرة بهذا الخادم عبر [frontend/.env.development](/home/bobby/Desktop/rentit/frontend/.env.development:1).
- الصناديق الافتراضية المسموحة حاليًا: `hashimaldrweish@kumeelalnahab.com`, `bookings@kumeelalnahab.com`, `customerservice@kumeelalnahab.com`, `info@kumeelalnahab.com`.
- التحويل الافتراضي الحالي للبريد الوارد يتجه إلى `kumeelalnahab@gmail.com`.
- معالج `email()` في [src/index.js](/home/bobby/Desktop/rentit/edge-api/src/index.js) يرفض الرسائل إذا لم يتم ضبط `INBOUND_EMAIL_FORWARD_TO` أو `INBOUND_EMAIL_ALERT_TO`.
