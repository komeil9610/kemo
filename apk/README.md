# Tarkeeb Pro APK

هذا المسار يغلّف واجهة `frontend` الحالية داخل تطبيق Android باستخدام Capacitor، مع دعم Flavor للمسؤول والفني.

## الأوامر

```bash
cd apk
npm install
npm run check:build-env
npm run sync:admin
npm run build:apk:admin
npm run build:apk:technician
npm run build:apk
```

## GitHub Actions

تمت إضافة Workflow جاهز في:

`/.github/workflows/build-android-apk.yml`

طريقة العمل:

- عند `push` إلى `main` مع تغييرات داخل `apk/` أو `frontend/` سيتم بناء APK تلقائياً.
- يمكن تشغيله يدوياً من تبويب `Actions` واختيار:
  - `all`
  - `admin`
  - `technician`
- بعد انتهاء التنفيذ ستجد ملفات التحميل داخل `Artifacts`:
  - `tarkeeb-pro-admin-apk`
  - `tarkeeb-pro-technician-apk`

يعتمد الـ workflow على:

- `Node.js 20`
- `Java 17`
- `Android SDK platform 35`
- بناء واجهة `frontend/` ثم مزامنتها مع `Capacitor`
- إنتاج APK منفصل لكل flavor

من جذر المشروع يمكنك تنفيذ النشر والبناء معاً:

```bash
npm run deploy:cloudflare
```

## مكان ملف الـ APK

بعد نجاح البناء ستجد الملفات النهائية عادة هنا:

`apk/dist/`

## ملاحظات

- يلزم وجود Java JDK و Android SDK/Gradle للبناء النهائي.
- اسم التطبيق والأيقونة معرفان داخل `AndroidManifest.xml` وموارد `mipmap`، مع أسماء مخصصة لكل Flavor من خلال `productFlavors` في `apk/android/app/build.gradle`.
- أمر `npm run check:build-env` يتحقق من:
  - وجود `frontend/node_modules`
  - وجود `apk/node_modules`
  - Java 17 أو أحدث
  - Android SDK مع `platforms;android-35` و `platform-tools`
- أمر البناء `npm run build:apk:admin` أو `npm run build:apk:technician` يحاول الآن اكتشاف مسار Android SDK تلقائياً من `ANDROID_SDK_ROOT` أو `ANDROID_HOME` أو من المسارات الشائعة، ثم يكتب `android/local.properties` إذا كان الملف غير موجود.
- التطبيق الآن يرسل طلبات الـ API إلى `/api` داخل نفس Worker، لذلك يبقى الـ APK مربوطاً مباشرة بـ Cloudflare عند النشر.
- إذا أردت تغيير عنوان Worker الذي يفتح عليه الـ APK، اضبط `CAPACITOR_SERVER_ORIGIN` أو `APP_ORIGIN` قبل تشغيل `npm run use:admin` أو `npm run use:technician`.
- من جذر المشروع يمكنك أيضاً ضبط `CLOUDFLARE_APP_ORIGIN` و `CLOUDFLARE_API_ORIGIN` ثم تشغيل `npm run deploy:cloudflare`.
- إذا لم يتم العثور على SDK، أنشئ `android/local.properties` يدوياً وضع فيه `sdk.dir=/path/to/Android/Sdk`.
- لو كانت بعض حزم SDK ناقصة، ثبّتها عبر:
  - `sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"`
- التطبيق الإداري يفتح:
  - `/mobile/admin`
- تطبيق الفني يفتح:
  - `/mobile/technician`
- الواجهة تُبنى من `frontend/` مع ربطها بالـ API المنشور.
- طبقة الجوال الحالية مبنية على `Capacitor` فعلاً، وبها صلاحيات `INTERNET` و`CAMERA` و`POST_NOTIFICATIONS`. إذا أردت اهتزازات ولمسات Native أو إشعارات محلية أو Push كامل فذلك يحتاج إضافة Plugins `Capacitor` المناسبة على خطوة لاحقة.
