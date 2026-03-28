# دليل التطوير | Development Guide

## إعداد بيئة التطوير | Setting Up Development Environment

### المتطلبات الأساسية | Prerequisites

```bash
# تحقق من الإصدارات
node --version  # v16 أو أعلى
npm --version   # v8 أو أعلى
mongod --version # v5 أو أعلى
```

### الإعداد الأولي | Initial Setup

```bash
# 1. استنساخ المشروع
git clone <repository-url>
cd tarkeeb-pro

# 2. تثبيت الحزم
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../mobile && npm install

# 3. إعداد المتغيرات
cp .env.example .env
# ثم عدل .env برقم سري قوي

# 4. بدء MongoDB
mongod

# 5. تشغيل التطبيق
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start

# Terminal 3 - Mobile
cd mobile && npm start
```

---

## معايير الكود | Code Standards

### تسمية الملفات | File Naming

```
Models:        User.js, Product.js (PascalCase)
Controllers:   userController.js, productController.js (camelCase)
Routes:        authRoutes.js, productRoutes.js (camelCase)
Components:    UserCard.jsx, ProductList.jsx (PascalCase)
Utilities:     helpers.js, validators.js (camelCase)
```

### معايير العمل | Best Practices

- ✅ استخدم **async/await** بدلاً من callbacks
- ✅ اكتب **تعليقات واضحة** بالعربية والإنجليزية
- ✅ استخدم **try/catch** للأخطاء
- ✅ اتبع **Clean Code** principles
- ✅ اختبر الكود قبل الـ Push

### مثال على الدالة الجيدة | Good Function Example

```javascript
/**
 * الحصول على منتج حسب الـ ID
 * @param {string} id - معرّف المنتج
 * @returns {Promise<Object>} بيانات المنتج
 */
async function getProductById(id) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid product ID');
    }
    
    const product = await Product.findById(id).populate('owner', 'firstName lastName email');
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  } catch (error) {
    console.error('Error fetching product:', error.message);
    throw error;
  }
}
```

---

## سمات الأمان | Security Features

### JWT Token Management

```javascript
// إصدار التوكن
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE }
);

// التحقق من التوكن
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### تشفير كلمات المرور | Password Hashing

```javascript
const hashedPassword = await bcrypt.hash(password, 10);
const isPasswordValid = await bcrypt.compare(inputPassword, hashedPassword);
```

---

## سير عمل Git | Git Workflow

```bash
# إنشاء فرع جديد
git checkout -b feature/feature-name

# إضافة التغييرات
git add .

# Commit بـ رسالة واضحة
git commit -m "feat: أضف ميزة جديدة"

# دفع التغييرات
git push origin feature/feature-name

# عمل Pull Request
```

### نماذج الـ Commit | Commit Message Format

```
feat:     إضافة ميزة جديدة
fix:      إصلاح مشكلة
docs:     تحديث التوثيق
style:    تنسيق الكود
refactor: إعادة هيكلة الكود
test:     إضافة اختبارات
```

---

## الاختبار | Testing

```bash
# اختبار المجموعة
npm test

# اختبار ملف معين
npm test User.test.js

# اختبار مع التغطية
npm test -- --coverage
```

---

## استكشاف الأخطاء | Debugging

### استخدام VS Code Debugger

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/backend/src/server.js"
    }
  ]
}
```

### استخدام Console Logs

```javascript
console.log('🟢 Success:', data);
console.warn('🟡 Warning:', message);
console.error('🔴 Error:', error);
```

---

## مشاكل شائعة | Common Issues

### MongoDB غير متصل
```bash
# تحقق من وجود MongoDB
mongod --version

# شغل MongoDB
mongod
```

### Port مشغول
```bash
# ابحث عن البروسيس
lsof -i :5000

# قتل البروسيس
kill -9 <PID>
```

### تصادم المكتبات
```bash
# حذف وإعادة تثبيت
rm -rf node_modules
npm install
```
