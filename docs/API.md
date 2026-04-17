# API Documentation

## Base URLs

- التطوير المحلي: `http://127.0.0.1:8787/api`
- الواجهة العامة المحمية: `https://kumeelalnahab.com`
- الـ API المباشر: `https://api.kumeelalnahab.com/api`
- الفحص الأبسط بعد النشر: `https://kumeelalnahab.com/api/health`

في الإنتاج يفضل أن تستدعي الواجهة `/api/*` على نفس الدومين.

## Authentication

### `POST /api/auth/login`

يسجل الدخول ويعيد المستخدم مع `workspaceRoles`.

مثال:

```json
{
  "email": "bobmorgann2@gmail.com",
  "password": "Komeil9610@@@"
}
```

## Operations

### `GET /api/operations/dashboard`

يعيد بيانات اللوحة التشغيلية الرئيسية.

### `GET /api/operations/summary`

يعيد الملخص اليومي والإحصاءات السريعة.

### `POST /api/operations/orders`

ينشئ طلبًا يدويًا من خدمة العملاء.

### `PUT /api/operations/orders/:id/status`

يحدّث حالة الطلب. هذا هو أحد المسارين اللذين ينشئان إشعارات لمدير العمليات.

### `PUT /api/operations/orders/:id`

تحديث بيانات الطلب.

### `POST /api/operations/orders/import`

استيراد دفعة أوامر بعد تجهيز المعاينة.

## Excel Import

### `POST /api/operations/excel-import/preview-upload`

يرفع ملف Excel ويعيد:

- `summary`
- `orders`
- `invalidRows`

### `POST /api/operations/excel-import/upload`

يستورد البيانات النهائية بعد مراجعة المعاينة.

## Notifications

### `GET /api/notifications`

يعيد إشعارات المستخدم حسب المساحة الحالية.

### `PUT /api/notifications/read-all`

يعلّم كل إشعارات المساحة الحالية كمقروءة.

### `PUT /api/notifications/:id/read`

يعلّم إشعارًا واحدًا كمقروء.

## Workspace Role Header

عند استخدام الحساب المشترك يجب إرسال:

```text
X-Workspace-Role: customer_service
```

أو:

```text
X-Workspace-Role: operations_manager
```

حتى يتم تفسير الطلبات والإشعارات ضمن المساحة الصحيحة.
