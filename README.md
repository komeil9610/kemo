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
├── backend/              # Legacy Node.js + Express API Server
├── edge-api/             # Cloudflare Worker API + D1
├── frontend/             # React app + Workers Static Assets frontend worker
├── mobile/               # React Native Mobile App
├── database/             # Legacy database notes
├── docs/                 # Project Documentation
└── .github/              # GitHub & Config Files
```

---

## 🚀 البدء | Getting Started

### المتطلبات | Requirements
- Node.js v16+ 
- npm أو yarn
- Cloudflare account + Wrangler
- Git

### الإعداد | Setup

#### 1. استنساخ المشروع | Clone the repository
```bash
git clone <repository-url>
cd rentit
```

#### 2. تثبيت البيئة | Install dependencies

**Edge API:**
```bash
cd edge-api
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

**Legacy Backend:**
```bash
cd backend
npm install
```

**Mobile:**
```bash
cd mobile
npm install
```

#### 3. إعداد متغيرات البيئة | Configure environment variables
```bash
# في كل مجلد انسخ .env.example إلى .env
cp .env.example .env
```

#### 4. إعداد Cloudflare | Cloudflare setup

**D1 Database**
```bash
cd edge-api
npx wrangler d1 create rentit_db
npm run db:migrate:remote
```

**JWT Secret**
```bash
cd edge-api
npx wrangler secret put JWT_SECRET
```

**أول حساب أدمن**
```bash
cd edge-api
npm run admin:sql -- "RentIT Admin" "admin@rentit.com" "your-strong-password"
# ثم نفّذ SQL الناتج على D1 عبر wrangler d1 execute
```

#### 5. تشغيل المشروع | Run the project

**Edge API Worker**
```bash
cd edge-api
npm run dev
```

**Frontend Worker + Static Assets**
```bash
cd frontend
npm run cf:dev
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

## ☁️ البنية الحالية | Current Cloudflare Architecture

- `Workers Static Assets`: الواجهة الأمامية React مع Worker يقدّم الملفات الثابتة ويتعامل مع SPA fallback
- `Service Bindings`: الواجهة تستدعي `EDGE_API` مباشرة عند توفر الربط
- `D1 Database`: تخزين المستخدمين، المنتجات، والحجوزات/الطلبات
- `Auth`: تسجيل جديد وتسجيل دخول عبر JWT داخل Worker
- `Orders`: صفحة طلبات مستقلة للعملاء عبر `/orders`

## 📊 الصلاحيات | Roles

**Admin**

- إضافة وتعديل وحذف المنتجات
- إدارة المستخدمين
- متابعة الطلبات وتحديث حالتها
- لوحة تحكم كاملة

**Customer**

- تسجيل جديد وتسجيل دخول
- عرض المنتجات
- إضافة منتجات إلى السلة
- إتمام الطلب من السلة
- الاطلاع على الطلبات وإلغاء المعلق منها

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
