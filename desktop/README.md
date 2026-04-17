# RentIT Desktop

هذا المجلد يحتوي نسخة سطح المكتب من المشروع باستخدام Electron.
المسار المعتمد الآن هو:

- تطبيق سطح مكتب لـ Linux Mint و Windows 11
- دخول الجوال عبر المتصفح على `kumeelalnahab.com`
- لا يوجد مسار APK/Android داخل المستودع بعد الآن

## التشغيل المحلي

```bash
cd desktop
npm install
npm run start
```

## بناء نسخة لينكس مينت

```bash
cd desktop
npm install
npm run dist:linux
```

سيتم حفظ الملف داخل:

`desktop/release/`

## بناء نسخة ويندوز

```bash
cd desktop
npm install
npm run dist:win
```

ملاحظة: بناء ملف ويندوز النهائي من لينكس قد يحتاج أدوات إضافية مثل `wine`. إذا لم تتوفر، يبقى إعداد البناء جاهزًا ويمكن تشغيله على ويندوز مباشرة.
