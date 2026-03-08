# تطبيق RentIT - نظام تأجير الأجهزة والملابس التنكرية والخدمات
## RentIT Application - Device & Costume Rental System

منصة موثوقة وآمنة لتأجير الأجهزة والملابس التنكرية والخدمات المختلفة في المنطقة الشرقية.

---

## 🎯 المميزات الرئيسية | Key Features

- ✅ **نظام المستخدمين** - تسجيل وتحقق آمن
- ✅ **سلة التسوق والحجوزات** - إدارة سهلة للطلبات
- ✅ **نظام الدفع** - دفع آمن وموثوق
- ✅ **إدارة المنتجات** - عرض وتصنيف المنتجات
- ✅ **نظام التقييمات** - تقييمات المستخدمين
- ✅ **لوحة التحكم** - لإدارة المشروع
- ✅ **تطبيق موبايل** - متوفر على iOS و Android

---

## 📁 بنية المشروع | Project Structure

```
rentit/
├── backend/              # Node.js + Express API Server
├── frontend/             # React Web Application
├── mobile/               # React Native Mobile App
├── database/             # MongoDB Schemas & Migrations
├── docs/                 # Project Documentation
└── .github/              # GitHub & Config Files
```

---

## 🚀 البدء | Getting Started

### المتطلبات | Requirements
- Node.js v16+ 
- npm أو yarn
- MongoDB
- Git

### الإعداد | Setup

#### 1. استنساخ المشروع | Clone the repository
```bash
git clone <repository-url>
cd rentit
```

#### 2. تثبيت البيئة | Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

**Mobile:**
```bash
cd ../mobile
npm install
```

#### 3. إعداد متغيرات البيئة | Configure environment variables
```bash
# في كل مجلد انسخ .env.example إلى .env
cp .env.example .env
```

#### 4. تشغيل المشروع | Run the project

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

**Mobile (iOS/Android Emulator):**
```bash
cd mobile
npm start
```

---

## 📚 التوثيق | Documentation

- [Backend API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 🏗️ بنية قاعدة البيانات | Database Structure

- **Users** - بيانات المستخدمين
- **Products** - المنتجات للتأجير
- **Bookings** - الحجوزات
- **Payments** - معاملات الدفع
- **Reviews** - التقييمات
- **Categories** - تصنيفات المنتجات

---

## 👥 المساهمة | Contributing

نرحب بمساهماتك! يرجى اتباع خطوات المساهمة في [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

---

## 📄 الترخيص | License

هذا المشروع مرخص تحت MIT License

---

## 📞 التواصل | Contact

للأسئلة والدعم، يرجى فتح issue على GitHub.

**تم الإنشاء بـ ❤️ في المنطقة الشرقية**
