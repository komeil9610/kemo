# Database

## Runtime Database

قاعدة البيانات الوحيدة المعتمدة هي `Cloudflare D1`.

الملف المرجعي الكامل:

- `edge-api/migrations/schema.sql`

## الجداول الأساسية

- `users`
  يخزن الحسابات الأساسية وتجزئة كلمة المرور والحالة.

- `user_workspace_roles`
  يربط المستخدم الواحد بأكثر من مساحة داخلية مثل `customer_service` و`operations_manager`.

- `service_orders`
  الجدول الرئيسي لطلبات التشغيل الداخلية.

- `technicians`
  بيانات الفنيين وحالتهم التشغيلية.

- `notifications`
  إشعارات النظام مع `target_role` لتوجيهها إلى المساحة الصحيحة.

- `service_order_photos`
  صور الطلب المرتبطة بالطلبات.

- `service_order_archives`
  نسخة أرشيفية لبعض بيانات الطلبات عند الحاجة.

- `service_time_standards`
  معايير الوقت الافتراضي للخدمات.

- `internal_area_clusters`
  تقسيمات المناطق الداخلية المستخدمة في التشغيل.

- `push_subscriptions`
  اشتراكات متصفح الإشعارات.

## المايغريشن المهمة

- `schema.sql`
  يبني القاعدة الكاملة من الصفر.

- `0024_shared_internal_workspace_roles.sql`
  يفعّل الحساب المشترك `bobmorgann2@gmail.com` ويضيف جدول أدوار المساحات وعمود توجيه الإشعارات.

## ملاحظات تشغيلية

- لا يوجد MongoDB أو Mongoose في المسار الحالي.
- لا يوجد Supabase كقاعدة تشغيلية معتمدة حتى الآن، لكن تم إضافة scaffold migration في:
  - `supabase/config.toml`
  - `supabase/migrations/`
  - `docs/SUPABASE_MIGRATION.md`
- أي تحديث فعلي لبيئة الإنتاج يجب أن يطبّق عبر `wrangler d1 execute`.
