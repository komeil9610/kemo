// مصادقة JWT | JWT Authentication Middleware
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'لا يوجد رمز حماية، يرجى تسجيل الدخول',
        code: 'NO_TOKEN',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'رمز الحماية غير صالح',
      code: 'INVALID_TOKEN',
    });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'ليس لديك صلاحية للقيام بهذا الإجراء',
        code: 'FORBIDDEN',
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
