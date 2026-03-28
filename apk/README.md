# Tarkeeb Pro APK

هذا المسار يغلّف واجهة `frontend` الحالية داخل تطبيق Android باستخدام Capacitor، مع دعم Flavor للمسؤول والفني.

## الأوامر

```bash
cd apk
npm install
npm run sync:admin
npm run build:apk:admin

# أو للفني
npm run sync:technician
npm run build:apk:technician
```

## مكان ملف الـ APK

بعد نجاح البناء ستجده عادة هنا:

`apk/android/app/build/outputs/apk/debug/app-debug.apk`

## ملاحظات

- يلزم وجود Java JDK و Android SDK/Gradle للبناء النهائي.
- التطبيق الإداري يفتح:
  - `/mobile/admin`
- تطبيق الفني يفتح:
  - `/mobile/technician`
- الواجهة تُبنى من `frontend/` مع ربطها بالـ API المنشور.
