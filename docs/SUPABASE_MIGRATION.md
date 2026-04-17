# Supabase Migration

## Current Status

المشروع الحالي لم يتحول بعد إلى Supabase في وقت التشغيل.

الحالة الفعلية الآن:

- الباكند الحالي: `Cloudflare Worker`
- قاعدة البيانات الحالية: `Cloudflare D1`
- ملفات Supabase المضافة هنا: scaffold فقط للانتقال المرحلي

هذا الفصل مهم لأن ملف [edge-api/src/index.js](/home/bobby/Desktop/rentit/edge-api/src/index.js) يحتوي مئات استدعاءات `env.DB.prepare(...)` المباشرة إلى D1، لذلك لا يمكن الادعاء بأن التحويل تم بدون إعادة كتابة طبقة البيانات كاملة.

## What Was Added

- `supabase/config.toml`
- `supabase/seed.sql`
- `supabase/migrations/20260417000000_zamil_orders.sql`
- `supabase/migrations/20260417000001_import_jobs.sql`
- سكربتات تشغيل Supabase في [package.json](/home/bobby/Desktop/rentit/package.json)
- متغيرات Supabase في [.env.example](/home/bobby/Desktop/rentit/.env.example)

## Recommended Migration Path

1. أنشئ مشروع Supabase واربطه محليًا:

```bash
npx supabase link --project-ref <project-ref>
```

2. شغّل Supabase محليًا عند الحاجة:

```bash
npm run supabase:start
```

3. ادفع migrations الأولية:

```bash
npm run supabase:db:push
```

4. افصل طبقة قاعدة البيانات في `edge-api` إلى adapter بدلاً من استخدام `env.DB.prepare(...)` مباشرة داخل كل endpoint.

5. انقل الجداول الأساسية التالية أولاً قبل أي cutover:

- `users`
- `user_workspace_roles`
- `service_orders`
- `technicians`
- `notifications`
- `service_order_photos`
- `service_order_archives`
- `service_time_standards`
- `internal_area_clusters`
- `push_subscriptions`

6. بعد اكتمال طبقة adapter، يتم استبدال D1 runtime تدريجيًا بـ Supabase/Postgres endpoint-by-endpoint.

## Why This Is Staged

- D1 الحالي يستخدم SQL ولهجات SQLite.
- Supabase يعتمد على Postgres.
- التحويل الصحيح ليس مجرد تغيير connection string، بل:
  - تحويل schema
  - مراجعة الفهارس
  - تحويل JSON storage إلى `jsonb`
  - مراجعة الأنواع الزمنية إلى `timestamptz`
  - إعادة كتابة الوصول للبيانات
  - اختبار كل endpoint

## Official References

- Supabase CLI config:
  https://supabase.com/docs/guides/cli/config
- Database migrations:
  https://supabase.com/docs/guides/deployment/database-migrations
- Migrating to Supabase:
  https://supabase.com/docs/guides/platform/migrating-to-supabase
