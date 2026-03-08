<!-- Copilot Customization for RentIT Project -->

# RentIT Project Customization Instructions

## Project Overview
مشروع RentIT هو منصة تأجير شاملة تتضمن:
- Backend API (Node.js + Express)
- Web Frontend (React)
- Mobile App (React Native)
- Database (MongoDB)

## Code Standards

### Language
- استخدم التعليقات بالعربية والإنجليزية
- أسماء المتغيرات والدوال بالإنجليزية
- الرسائل للمستخدمين بالعربية

### File Organization
```
backend/src/
  ├── models/         # Mongoose Schemas
  ├── controllers/    # Business Logic
  ├── routes/         # API Routes
  ├── middleware/     # Custom Middleware
  ├── services/       # External Services
  ├── utils/          # Helper Functions
  └── config/         # Configuration Files

frontend/src/
  ├── components/     # Reusable Components
  ├── pages/          # Page Components
  ├── context/        # State Management
  ├── services/       # API Integration
  └── utils/          # Helper Functions
```

### Naming Conventions
- Models: `User.js`, `Product.js` (PascalCase)
- Controllers: `userController.js` (camelCase)
- Routes: `authRoutes.js` (camelCase + Routes suffix)
- Components: `UserCard.jsx` (PascalCase)
- Functions: `getUserById()` (camelCase)
- Constants: `MAX_PRICE = 10000` (UPPER_SNAKE_CASE)

### Security Requirements
- ✅ Validate all inputs on Backend
- ✅ Use JWT for authentication
- ✅ Hash passwords with bcryptjs
- ✅ Use CORS properly
- ✅ Sanitize user input
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting

### Database Schema Rules
- ✅ Use Mongoose for MongoDB
- ✅ Add timestamps to all schemas
- ✅ Use proper indexes
- ✅ Implement soft deletes when needed
- ✅ Use references for relationships

## API Development Guidelines

### Route Naming Convention
```
GET    /api/products              # List all
GET    /api/products/:id          # Get one
POST   /api/products              # Create
PUT    /api/products/:id          # Update
DELETE /api/products/:id          # Delete
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
- Token should be JWT with userId and role
- Token expiration: 7 days

## Frontend Development Guidelines

### Component Structure
- Use Functional Components with Hooks
- Use React Context for global state
- Use Zustand for complex state
- Implement proper error boundaries

### Styling
- Use Tailwind CSS utility classes
- Custom CSS in separate `.module.css` files
- Mobile-first responsive design

## Mobile Development Guidelines

- Use React Native standards
- Test on both iOS and Android emulators
- Use Firebase for push notifications
- Implement proper error handling

## Testing Requirements
- Write unit tests for utilities
- Write integration tests for APIs
- Minimum 70% code coverage
- All tests must pass before push

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

## Team Communication
- Use GitHub Issues for bug reports
- Use GitHub Discussions for feature requests
- Comment complex logic clearly
- Update documentation when changing APIs

---

**Last Updated:** March 8, 2024
