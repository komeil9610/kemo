# RentIT Desktop

هذا المجلد يحتوي نسخة سطح المكتب من المشروع باستخدام Electron.

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
