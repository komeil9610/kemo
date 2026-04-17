<!-- Copilot Customization for RentIT Project -->

# RentIT Project Customization Instructions

## Project Overview
مشروع RentIT الحالي هو نظام داخلي لإدارة الطلبات بين خدمة العملاء ومدير العمليات، ويعمل عبر:
- Frontend React
- Cloudflare Workers
- Cloudflare D1
- Electron Desktop App

## Code Standards

### Language
- استخدم التعليقات بالعربية والإنجليزية
- أسماء المتغيرات والدوال بالإنجليزية
- الرسائل للمستخدمين بالعربية

### File Organization
```
edge-api/src/
  ├── index.js        # Worker routes and business logic
  └── excelImport.js  # Excel parsing and normalization

frontend/src/
  ├── components/     # Reusable Components
  ├── pages/          # Page Components
  ├── context/        # State Management
  ├── services/       # API Integration
  └── utils/          # Helper Functions
```

### Naming Conventions
- Components: `UserCard.jsx` (PascalCase)
- Functions: `getUserById()` (camelCase)
- Constants: `MAX_PRICE = 10000` (UPPER_SNAKE_CASE)

### Security Requirements
- ✅ Validate all inputs on the Worker API
- ✅ Use JWT for authentication
- ✅ Hash passwords before storing them in D1
- ✅ Use CORS properly
- ✅ Sanitize user input
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting
- ✅ Keep Cloudflare Access enabled in production

### Database Schema Rules
- ✅ Keep D1 as the only operational database
- ✅ Apply schema changes through migrations
- ✅ Add indexes for role, status, and routing-heavy fields

## API Development Guidelines

### Route Naming Convention
```
GET    /api/operations/dashboard
POST   /api/operations/orders
PUT    /api/operations/orders/:id/status
GET    /api/notifications
```

### Response Format
```javascript
// Success
{ 
  status: 'success',
  message: 'Operation successful',
  data: { ... }
}

// Error
{
  status: 'error',
  message: 'Error message',
  code: 'ERROR_CODE'
}
```

### Authentication
- Use Bearer tokens in Authorization header
- Token should be JWT with user id and workspace roles
- Token expiration: 7 days

## Frontend Development Guidelines

### Component Structure
- Use Functional Components with Hooks
- Use React Context for auth and language state
- Preserve shared-account role switching via `X-Workspace-Role`
- Implement proper error boundaries

### Styling
- Use Tailwind CSS utility classes
- Custom CSS in separate `.module.css` files
- Mobile-first responsive design

## Testing Requirements
- Write unit tests for utilities
- Write integration tests for APIs
- Run build and smoke checks before shipping

## Commit Message Format
```
feat:     إضافة ميزة جديدة
fix:      إصلاح مشكلة (حل الـ Issue #123)
docs:     تحديث التوثيق
style:    تنسيق الكود فقط
refactor: إعادة هيكلة الكود
test:     إضافة أو تحديث الاختبارات
chore:    تحديثات البناء والتبعيات
```

## Prohibited Practices
- ❌ Never store passwords in plain text
- ❌ Don't commit .env files
- ❌ Don't mix Arabic and English inconsistently
- ❌ Never use var, always use const/let
- ❌ Don't commit node_modules
- ❌ Avoid callback hell, use async/await
- ❌ Do not reintroduce MongoDB, Supabase, Streamlit, or React Native into the active path

## Team Communication
- Use GitHub Issues for bug reports
- Use GitHub Discussions for feature requests
- Comment complex logic clearly
- Update documentation when changing APIs

---

**Last Updated:** April 5, 2026
