// التحقق من صحة الإدخالات | Input Validation Middleware
const { body, validationResult } = require('express-validator');
const { isSaudiPhoneNumber, normalizeSaudiPhoneNumber } = require('../utils/phone');

const validateEmail = body('email')
  .isEmail()
  .withMessage('البريد الإلكتروني غير صحيح');

const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');

const validatePhone = body('phone')
  .custom((value) => isSaudiPhoneNumber(value))
  .withMessage('رقم الهاتف غير صحيح');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  handleValidationErrors,
  normalizeSaudiPhoneNumber,
};
