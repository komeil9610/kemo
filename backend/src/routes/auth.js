const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const {
  validateEmail,
  validatePassword,
  validatePhone,
  handleValidationErrors,
  normalizeSaudiPhoneNumber,
} = require('../middleware/validators');

const router = express.Router();

const buildSafeUser = (user, technician = null) => {
  const technicianId = user.technicianId || technician?.id || user._id.toString();
  const isFieldRole = ['technician', 'regional_dispatcher'].includes(user.role);

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone,
    role: user.role,
    technicianId: isFieldRole ? technicianId : user.technicianId || null,
    region: user.region || technician?.region || null,
    notes: user.notes || technician?.notes || null,
    isActive: user.isActive,
  };
};

router.post(
  '/login',
  [
    validateEmail,
    body('password').isString().withMessage('Password is required'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');

      const user = await User.findOne({ email }).select('+password');
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid login details' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid login details' });
      }

      const technician = ['technician', 'regional_dispatcher'].includes(user.role)
        ? {
            id: user.technicianId || user._id.toString(),
            name: `${user.firstName} ${user.lastName}`.trim(),
            region: user.region || 'Eastern Province',
            zone: user.region || 'Eastern Province',
            phone: user.phone,
            email: user.email,
            notes: user.notes || '',
          }
        : null;

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          role: user.role,
          email: user.email,
          technicianId: ['technician', 'regional_dispatcher'].includes(user.role) ? user.technicianId || user._id.toString() : null,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(200).json({
        token,
        user: {
          ...buildSafeUser(user, technician),
          technician,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    validateEmail,
    validatePhone,
    validatePassword,
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, phone, password } = req.body;
      const existingUser = await User.findOne({ email: String(email).toLowerCase() });

      if (existingUser) {
        return res.status(409).json({ message: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: String(email).trim().toLowerCase(),
        phone: normalizeSaudiPhoneNumber(phone),
        password: hashedPassword,
        role: 'user',
      });

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          role: user.role,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.status(201).json({
        token,
        user: buildSafeUser(user),
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
