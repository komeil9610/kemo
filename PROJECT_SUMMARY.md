# Project Summary

## الحالة الحالية

المشروع لم يعد منصة تأجير عامة. النسخة الحالية نظام داخلي خاص لإدارة طلبات الزامل بين خدمة العملاء ومدير العمليات.

## البنية المعتمدة

```text
rentit/
├── data/        # ملف Excel المرجعي للاستيراد
├── edge-api/    # Cloudflare Worker API + D1 schema/migrations
├── frontend/    # React web app + Cloudflare frontend worker
├── desktop/     # Electron wrapper for Linux Mint and Windows 11
└── docs/        # توثيق المسار الحالي
```

## ما هو منجز الآن

- اعتماد `D1` كقاعدة البيانات الوحيدة.
- تشغيل الواجهة وواجهة الـ API مباشرة على Cloudflare Workers مع سياسات أمنية صارمة داخل التطبيق.
- حذف مسار Android/APK.
- دعم حساب واحد يملك مساحتي `customer_service` و`operations_manager`.
- تحسين استيراد Excel ليغطي منطقًا أقرب لبيانات `Zamil`.
- حصر إشعارات مدير العمليات في الطلبات الجديدة وتحديثات الحالة فقط.

## الأولويات الحالية للتطوير

- تحسين تجربة الاستيراد والمعاينة عند ملفات Excel الكبيرة.
- زيادة اختبارات الـ smoke وعمليات التحقق بعد البناء.
- تقليل الملفات والمسارات غير المستخدمة في الواجهة.
- الحفاظ على تطابق نسخة `desktop/app` مع أحدث بناء للواجهة.

## تشغيل الإنتاج

- الواجهة: `kumeelalnahab.com`
- الـ API: `api.kumeelalnahab.com`
- الأجهزة المستهدفة:
  - Linux Mint
  - Windows 11
  - الجوال عبر المتصفح فقط

## ملاحظة تنفيذية

أي مسار قديم قائم على MongoDB أو Supabase أو Streamlit أو React Native لم يعد ضمن التشغيل المعتمد لهذا المشروع.
