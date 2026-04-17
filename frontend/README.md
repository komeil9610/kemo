# Frontend

واجهة React الحالية تدير المسار الداخلي بين خدمة العملاء ومدير العمليات فقط.

## التشغيل

```bash
cd frontend
npm install
npm start
```

## البناء

```bash
npm run build
```

أثناء `prestart` و `prebuild` يتم توليد ملف المعاينة من:

- `../data/data.xlsx`

وينتج عنه:

- `public/excel-import/orders.json`

## النشر

```bash
npm run cf:deploy
```

قبل النشر الإنتاجي:

- اضبط `API_ORIGIN` الصحيح في [frontend/wrangler.toml](/home/bobby/Desktop/rentit/frontend/wrangler.toml)
- البناء الإنتاجي يعطل source maps

## الصفحات الأساسية

- `src/pages/Home.jsx`
- `src/pages/Login.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/InternalDailyTasks.jsx`
- `src/pages/InternalWeeklyTasks.jsx`
- `src/pages/InternalMonthlyTasks.jsx`
- `src/pages/OperationsDatePage.jsx`

## الدخول

الحساب المعتمد:

- `bobmorgann2@gmail.com`
- `Komeil9610@@@`

والواجهة تدعم التبديل بين:

- `customer_service`
- `operations_manager`
