# 🚀 دليل البدء السريع | Quick Start Guide

اتبع هذه الخطوات للبدء الفوري مع المشروع.

---

## الخطوة 1️⃣: إعداد المشروع

### 1.1 استنساخ البيانات الأساسية
```bash
cd /home/bobby/Desktop/rentit
ls -la  # تحقق من أن جميع الملفات موجودة
```

### 1.2 إنشاء ملف .env
```bash
cp .env.example .env
# الآن عدّل الملف بـ بيانات حقيقية
```

---

## الخطوة 2️⃣: بدء Backend

```bash
# الدخول إلى مجلد Backend
cd backend

# تثبيت الحزم
npm install

# إعداد البيئة (اختياري - معظم الإعدادات موجودة)
# يمكنك تشغيل الخادم مباشرة

# تشغيل الخادم
npm run dev

# ستشاهد: 🚀 Server running on http://localhost:5000
# واختبر: curl http://localhost:5000/api/health
```

---

## الخطوة 3️⃣: بدء Frontend

**في terminal جديد:**
```bash
cd /home/bobby/Desktop/rentit/frontend

# تثبيت الحزم
npm install

# إنشاء ملف .env.local
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# تشغيل التطبيق
npm start

# سيفتح: http://localhost:3000 تلقائياً
```

---

## الخطوة 4️⃣: اختبار الاتصال

### 4.1 اختبر Health Check
```bash
curl http://localhost:5000/api/health
# استجابة متوقعة:
# {"message":"🟢 Server is running","timestamp":"..."}
```

### 4.2 اختبر في Postman
```
Method: GET
URL: http://localhost:5000/api/health

نتيجة: 200 OK
```

---

## 📚 الملفات المهمة للدراسة

### اقرأ بهذا الترتيب:
1. `README.md` - نظرة عامة شاملة
2. `PROJECT_SUMMARY.md` - ملخص المشروع
3. `docs/ARCHITECTURE.md` - فهم التصميم
4. `docs/DATABASE.md` - فهم البيانات
5. `docs/API.md` - مسارات الـ API

---

## 🔧 المهام الأولى للتطوير

### قائمة المهام الأولية:
```
Week 1:
  [ ] أكمل قراءة التوثيق
  [ ] شغّل المشروع محلياً
  [ ] أضف باقي Models إلى قاعدة البيانات
  [ ] اكتب Controllers الأولى
  
Week 2:
  [ ] بناء جميع مسارات الـ API
  [ ] ربط Stripe للدفع
  [ ] إضافة Firebase للإشعارات
  [ ] كتابة أول اختبار
```

---

## 🐛 إذا واجهت مشاكل

### المشكلة: MongoDB لا يتصل
```bash
# التحقق من تثبيت MongoDB
mongod --version

# تشغيل MongoDB
mongod

# إذا لم يكن مثبتاً، ثبّت من: https://docs.mongodb.com/manual/installation/
```

### المشكلة: Port 5000 مشغول
```bash
# ابحث عن البروسيس
lsof -i :5000

# احذفه
kill -9 <PID>

# أو غيّر الـ Port في .env
PORT=5001
```

### المشكلة: npm install بطيء
```bash
# استخدم cache cleaner
npm cache clean --force

# أو استخدم yarn
yarn install
```

---

## 📲 الملفات الموصى بها للقراءة الأولى

### For Backend Developers:
1. `backend/README.md` ⭐ ابدأ هنا
2. `docs/DATABASE.md` - فهم البيانات
3. `docs/API.md` - جميع المسارات
4. `backend/src/middleware/auth.js` - كيفية المصادقة

### For Frontend Developers:
1. `frontend/README.md` ⭐ ابدأ هنا
2. `docs/ARCHITECTURE.md` - البنية
3. `frontend/src/services/api.js` - الاتصال بـ API
4. `frontend/src/context/AuthContext.jsx` - الحالة

### For Mobile Developers:
1. `mobile/README.md` ⭐ ابدأ هنا
2. `docs/ARCHITECTURE.md` - البنية
3. `docs/API.md` - المسارات

---

## 🎯 الهدف من هذا الإعداد

✅ **توفر الوقت:**
- لا حاجة لإعادة تصميم الهيكل
- معايير موحدة من البداية
- توثيق شامل

✅ **احترافية:**
- تنظيم احترافي
- أمان من الأساس
- قابلية للتوسع

✅ **تعاون سهل:**
- معايير واضحة
- كود منظم
- توثيق شامل

---

## 💡 نصائح ذهبية

1. **استخدم Git بشكل صحيح:**
   ```bash
   git add .
   git commit -m "feat: أضف ميزة جديدة"
   ```

2. **اختبر الـ API بـ Postman:**
   - يمكنك اختبار جميع المسارات قبل كتابة الكود

3. **الللفات السرية:**
   - لا تضع .env في Git أبداً
   - استخدم .env.example دائماً

4. **اقرأ الكود القديم:**
   - هناك أمثلة جاهزة في `backend/src/`
   - اتبع نفس الأسلوب

---

## ✨ معلومات إضافية

- **الإصدار:** 1.0.0 (Development)
- **آخر تحديث:** 8 مارس 2024
- **الحالة:** 🟢 جاهز للتطوير

---

## 🔗 الروابط المهمة

- [Git Guide](https://guides.github.com/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [MongoDB](https://docs.mongodb.com/)
- [Stripe](https://stripe.com/docs/)

---

## 👋 استعداد للبدء؟

```bash
# 1. أغلق أي terminals مفتوحة
# 2. شغّل: cd /home/bobby/Desktop/rentit
# 3. اتبع الخطوات أعلاه
# 4. اسأل أي سؤال في الـ GitHub Issues

npm install && npm run dev  # اختصار لـ Backend
```

**الحظ الموفق! 🎉**

---

**للمزيد من المساعدة، راجع:**
- [دليل التطوير](docs/DEVELOPMENT.md)
- [الأسئلة الشائعة](docs/FAQ.md) (سيتم إضافته لاحقاً)
