# تركيب برو الداخلي
## Tarkeeb Pro Internal Workflow

هذا المشروع لم يعد منصة عامة لإدارة منتجات أو فنيين متعددين، بل أصبح نظاماً داخلياً مخصصاً لتسهيل رحلة:

- خدمة العملاء
- مدير العمليات

فكرة النظام بسيطة وواضحة:
خدمة العملاء تنشئ الطلب، ثم ينتقل الطلب حصراً إلى مدير العمليات ليقوم بجدولته وتحريك حالته حتى الإغلاق. الهدف من ذلك هو جعل إدارة الطلبات الهائلة أكثر سلاسة، وأقل تشتتاً، وأسهل في المتابعة اليومية.

---

## ما الذي يقدمه النظام؟

- نموذج سريع لإدخال طلبات الزامل
- تفاصيل مكيفات متعددة داخل نفس الطلب
- لوحة `Kanban` بصرية لفرز الطلبات
- أربع حالات تشغيل واضحة:
  - `pending`
  - `scheduled`
  - `in_transit`
  - `completed`
- إشعارات مباشرة تعود إلى خدمة العملاء عند:
  - انتقال الطلب إلى `in_transit`
  - انتقال الطلب إلى `completed`

---

## الأدوار

### خدمة العملاء

- إنشاء الطلب
- متابعة حالة الطلب
- استقبال الإشعارات
- لا تستطيع تعديل حالة الطلب بعد الإرسال

### مدير العمليات

- مشاهدة جميع الطلبات
- تحديث حالة الطلب
- إدارة تدفق الطلبات الكبير من لوحة واحدة

---

## بنية المشروع

```text
rentit/
├── edge-api/      # Cloudflare Worker API + D1
├── frontend/      # React frontend for the internal workflow
├── backend/       # Legacy backend files kept in repo
├── mobile/        # Legacy mobile files kept in repo
├── docs/          # Existing documentation set
└── apk/           # Legacy Android packaging files
```

---

## التشغيل المحلي

### الواجهة

```bash
cd frontend
npm install
npm start
```

### بناء الواجهة

```bash
cd frontend
npm run build
```

### فحص الخادم

```bash
node --check edge-api/src/index.js
```

---

## حسابات التشغيل

لا توجد بيانات دخول تجريبية ثابتة داخل المستودع. أنشئ حسابات التشغيل الفعلية عبر أداة SQL ثم نفّذ الناتج على `Cloudflare D1`.

```bash
cd edge-api
npm run admin:sql -- "مسؤول تركيب برو" "admin@tarkeebpro.sa" "your-strong-password" admin
npm run admin:sql -- "خدمة العملاء" "customer-service@tarkeebpro.sa" "your-strong-password" customer_service
npm run admin:sql -- "مدير العمليات" "operations@tarkeebpro.sa" "your-strong-password" operations_manager
```

---

## قاعدة البيانات والنشر

إذا كنت تستخدم `Cloudflare D1` فعليك تطبيق المايجريشن الخاصة بالأدوار الداخلية الجديدة:

```bash
edge-api/migrations/0013_internal_ticket_roles.sql
```

هذه المايجريشن تضيف أو تحدّث حسابي خدمة العملاء ومدير العمليات ليتوافقا مع النظام الجديد.

---

## ملاحظة مهمة

ما زالت بعض المجلدات القديمة موجودة داخل المستودع لأغراض الرجوع أو التوافق، لكن الواجهة الفعلية الحالية والرحلة الأساسية للموقع أصبحت متمحورة حول إدارة الطلبات الداخلية بين خدمة العملاء ومدير العمليات فقط.
