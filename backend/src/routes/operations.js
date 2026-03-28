const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param } = require('express-validator');
const ServiceOrder = require('../models/ServiceOrder');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { validateEmail, validatePassword, validatePhone, handleValidationErrors } = require('../middleware/validators');

const router = express.Router();

const calculateExtrasTotal = (copperMeters, baseIncluded, pricing = {}) => {
  const meters = Math.max(0, Number(copperMeters) || 0);
  const copperPrice = pricing.copperPricePerMeter || 85;
  const basePrice = pricing.basePrice || 180;
  return meters * copperPrice + (baseIncluded ? basePrice : 0);
};

const buildTechnicianView = (user, activeOrders = []) => {
  const technicianId = user.technicianId || user._id.toString();
  const hasActiveWork = activeOrders.some((order) => ['en_route', 'in_progress'].includes(order.status));

  return {
    id: technicianId,
    userId: user._id.toString(),
    name: `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    region: user.region || 'Eastern Province',
    zone: user.region || 'Eastern Province',
    status: hasActiveWork ? 'busy' : 'available',
    notes: user.notes || '',
  };
};

const buildSummary = (orders, technicians) => {
  const totals = orders.reduce(
    (acc, order) => ({
      extrasRevenue: acc.extrasRevenue + (order.extras?.totalPrice || 0),
      copperMeters: acc.copperMeters + (Number(order.extras?.copperMeters) || 0),
      basesCount: acc.basesCount + (order.extras?.baseIncluded ? 1 : 0),
    }),
    { extrasRevenue: 0, copperMeters: 0, basesCount: 0 }
  );

  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    activeOrders: orders.filter((order) => ['en_route', 'in_progress'].includes(order.status)).length,
    completedOrders: orders.filter((order) => order.status === 'completed').length,
    availableTechnicians: technicians.filter((tech) => tech.status === 'available').length,
    ...totals,
  };
};

const serializeOrder = (order) => ({
  id: order.orderNumber,
  numericId: Number(String(order.orderNumber || '').replace(/[^\d]/g, '')) || Date.now(),
  customerName: order.customerName,
  phone: order.phone,
  address: order.address,
  acType: order.acType,
  status: order.status,
  scheduledDate: order.scheduledDate,
  notes: order.notes || '',
  technicianId: order.technicianId || '',
  technicianName: order.technicianName || 'Unassigned',
  createdAt: order.createdAt,
  extras: order.extras || { copperMeters: 0, baseIncluded: false, totalPrice: 0 },
  photos: order.photos || [],
});

const findOrderByIdentifier = async (identifier) => {
  const value = String(identifier || '').trim();
  if (!value) {
    return null;
  }

  return ServiceOrder.findOne({
    $or: [
      { orderNumber: value },
      { orderNumber: value.startsWith('ORD-') ? value : `ORD-${value}` },
      { _id: value },
    ],
  });
};

router.get('/dashboard', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const [users, orders] = await Promise.all([
      User.find({ role: 'technician' }).sort({ createdAt: -1 }),
      ServiceOrder.find().sort({ createdAt: -1 }),
    ]);

    const technicians = users.map((user) => buildTechnicianView(
      user,
      orders.filter((order) => String(order.technicianId) === String(user.technicianId || user._id.toString()))
    ));

    return res.status(200).json({
      users: users.map((user) => ({
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone,
        role: user.role,
        technicianId: user.technicianId || user._id.toString(),
        region: user.region || null,
        notes: user.notes || null,
      })),
      technicians,
      orders: orders.map(serializeOrder),
      pricing: {
        includedCopperMeters: 3,
        copperPricePerMeter: 85,
        basePrice: 180,
      },
      summary: buildSummary(orders, technicians),
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/technicians',
  authenticate,
  authorize(['admin']),
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    validateEmail,
    validatePhone,
    validatePassword,
    body('region').trim().notEmpty().withMessage('Region is required'),
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, phone, password, region, notes } = req.body;
      const normalizedEmail = String(email).trim().toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ message: 'This email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: normalizedEmail,
        phone: String(phone).trim(),
        password: hashedPassword,
        role: 'technician',
        region: String(region).trim(),
        notes: String(notes || '').trim(),
      });

      user.technicianId = user._id.toString();
      await user.save();

      return res.status(201).json({
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          phone: user.phone,
          role: user.role,
          technicianId: user.technicianId,
          region: user.region,
          notes: user.notes,
        },
        technician: buildTechnicianView(user),
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/orders', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { customerName, phone, address, acType, scheduledDate, technicianId, notes } = req.body;
    const assignedTechnician = technicianId
      ? await User.findOne({
          $or: [
            { technicianId: String(technicianId) },
            { _id: technicianId },
          ],
          role: 'technician',
        })
      : null;

    const order = await ServiceOrder.create({
      orderNumber: `ORD-${Date.now()}`,
      customerName,
      phone,
      address,
      acType,
      scheduledDate,
      notes,
      technicianId: assignedTechnician ? (assignedTechnician.technicianId || assignedTechnician._id.toString()) : '',
      technicianName: assignedTechnician ? `${assignedTechnician.firstName} ${assignedTechnician.lastName}`.trim() : 'Unassigned',
      extras: { copperMeters: 0, baseIncluded: false, totalPrice: 0 },
      photos: [],
    });

    return res.status(201).json({ order: serializeOrder(order) });
  } catch (error) {
    return next(error);
  }
});

router.put(
  '/orders/:orderId',
  authenticate,
  authorize(['admin']),
  [param('orderId').notEmpty().withMessage('Order id is required')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const order = await findOrderByIdentifier(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (req.body.technicianId) {
        const technician = await User.findOne({
          $or: [
            { technicianId: String(req.body.technicianId) },
            { _id: req.body.technicianId },
          ],
          role: 'technician',
        });

        order.technicianId = technician ? (technician.technicianId || technician._id.toString()) : String(req.body.technicianId);
        order.technicianName = technician ? `${technician.firstName} ${technician.lastName}`.trim() : 'Unassigned';
      }

      if (req.body.status) {
        order.status = req.body.status;
      }

      if (req.body.notes !== undefined) {
        order.notes = String(req.body.notes || '');
      }

      await order.save();
      return res.status(200).json({ order: serializeOrder(order) });
    } catch (error) {
      return next(error);
    }
  }
);

router.get('/technician/orders', authenticate, authorize(['technician', 'admin']), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    const technicianId = user.technicianId || user._id.toString();
    const orders = await ServiceOrder.find({ technicianId }).sort({ createdAt: -1 });
    const technician = buildTechnicianView(user, orders);

    return res.status(200).json({
      technician,
      pricing: {
        includedCopperMeters: 3,
        copperPricePerMeter: 85,
        basePrice: 180,
      },
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    return next(error);
  }
});

router.put('/orders/:orderId/status', authenticate, authorize(['technician', 'admin']), async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status || order.status;
    await order.save();
    return res.status(200).json({ order: serializeOrder(order) });
  } catch (error) {
    return next(error);
  }
});

router.put('/orders/:orderId/extras', authenticate, authorize(['technician', 'admin']), async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const copperMeters = Number(req.body.copperMeters) || 0;
    const baseIncluded = Boolean(req.body.baseIncluded);

    order.extras = {
      copperMeters,
      baseIncluded,
      totalPrice: calculateExtrasTotal(copperMeters, baseIncluded),
    };
    await order.save();

    return res.status(200).json({ order: serializeOrder(order) });
  } catch (error) {
    return next(error);
  }
});

router.post('/orders/:orderId/photos', authenticate, authorize(['technician', 'admin']), async (req, res, next) => {
  try {
    const order = await ServiceOrder.findOne({ orderNumber: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.photos.push({
      id: `photo-${Date.now()}`,
      name: req.body.name || 'photo',
      url: req.body.url,
      uploadedAt: new Date(),
    });

    await order.save();
    return res.status(200).json({ order: serializeOrder(order) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
