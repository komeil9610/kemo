# RentIT Internal Operations

هذا المستودع يدير المسار الداخلي فقط بين:

- خدمة العملاء
- مدير العمليات

المنصة الحالية تعمل عبر:

- `frontend/` واجهة React
- `frontend/cloudflare/worker.js` بوابة الواجهة والنطاقات
- `edge-api/` واجهة API محلية أثناء التطوير، مع كود متوافق أيضًا مع Cloudflare Worker
- `D1` كقاعدة البيانات الوحيدة
- `desktop/` تطبيق Electron لـ Linux Mint و Windows 11
- `data/data.xlsx` ملف Excel المرجعي للاستيراد والمعاينة

الدومينات المعتمدة:

- `https://kumeelalnahab.com`
- `https://www.kumeelalnahab.com`
- `https://api.kumeelalnahab.com`

## المسار التشغيلي

1. خدمة العملاء تنشئ الطلب أو تستورده من Excel.
2. مدير العمليات يستقبل الطلبات الجديدة ويحدّث حالاتها.
3. الإشعارات التشغيلية تذهب فقط عند:
   - إضافة طلب جديد
   - تحديث حالة طلب
4. كل البيانات تحفظ في `Cloudflare D1`.

## الحساب المعتمد

- البريد: `bobmorgann2@gmail.com`
- كلمة المرور: `Komeil9610@@@`

الحساب نفسه يملك مساحتين داخليتين:

- `customer_service`
- `operations_manager`

## التشغيل المحلي السريع

### الواجهة

```bash
cd frontend
npm install
npm start
```

### فحص وتحضير نسخة سطح المكتب

```bash
cd desktop
npm install
npm run build:desktop
```

### تشغيل الـ API محليًا

```bash
cd edge-api
npm install
npm run dev
```

الخادم المحلي يعمل على:

- `http://127.0.0.1:8787/api`

والواجهة التطويرية مربوطة به عبر [frontend/.env.development](/home/bobby/Desktop/rentit/frontend/.env.development:1).

وإذا أردت إبقاء الموقع عامًا على `kumeelalnahab.com` مع تمرير رفع Excel فقط إلى جهازك، استخدم `EXCEL_UPLOAD_ORIGIN` في [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml:1) لربط مسارات رفع الإكسل بخادمك العام.

## قاعدة البيانات

القاعدة الوحيدة المعتمدة هي `D1`. عند تجهيز بيئة جديدة:

```bash
cd edge-api
npm run db:migrate:remote
```

ولكي يتم تفعيل الحساب المشترك والأدوار الداخلية المحدثة، تأكد من تطبيق:

```bash
edge-api/migrations/0024_shared_internal_workspace_roles.sql
```

## النشر

```bash
cd frontend
npm run cf:deploy

cd ../edge-api
npm run deploy
```

مهم:

- النشر على Cloudflare ما زال متاحًا إذا احتجته لاحقًا.
- في التطوير المحلي لم يعد الـ frontend يحتاج backend منشورًا على Cloudflare.

## ملاحظات مهمة

- لا يوجد Android أو APK أو React Native ضمن المسار الحالي.
- لا يوجد MongoDB أو Supabase أو Streamlit ضمن التشغيل المعتمد.
- الحماية الإنتاجية الحالية تعتمد على تسجيل الدخول الداخلي + CSP + تعطيل source maps الإنتاجية.
