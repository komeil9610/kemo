const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param } = require('express-validator');
const ServiceOrder = require('../models/ServiceOrder');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { loadExcelOrdersPreview } = require('../utils/excelOrders');
const {
  validateEmail,
  validatePassword,
  validatePhone,
  handleValidationErrors,
  normalizeSaudiPhoneNumber,
} = require('../middleware/validators');

const router = express.Router();

const calculateExtrasTotal = (copperMeters, baseIncluded, pricing = {}) => {
  const meters = Math.max(0, Number(copperMeters) || 0);
  const copperPrice = pricing.copperPricePerMeter || 85;
  const basePrice = pricing.basePrice || 180;
  return meters * copperPrice + (baseIncluded ? basePrice : 0);
};

const catalogById = {
  rubber_pads: { description: 'توريد وتركيب قواعد مطاطية للوحدات الخارجية', price: 45, unit: 'لكل مجموعة' },
  drain_pipes: { description: 'توريد وتركيب أنابيب تصريف المياه', price: 30, unit: 'لكل متر' },
  electric_socket: { description: 'توريد وتركيب مقبس كهربائي', price: 40, unit: 'لكل قطعة' },
  electric_cable: { description: 'توريد وتركيب كابل كهربائي مع غلاف واق', price: 25, unit: 'لكل متر' },
  copper_asian: { description: 'توريد وتركيب أنابيب نحاسية - نحاس (اسيوي)', price: 70, unit: 'لكل متر' },
  copper_american: { description: 'توريد وتركيب أنابيب نحاسية - نحاس (امريكي)', price: 100, unit: 'لكل متر' },
  copper_welding: { description: 'لحام أنابيب نحاسية جديدة مع الأنابيب القديمة (بمقاسات مختلفة)', price: 30, unit: 'لكل متر' },
  window_frame: { description: 'توريد وتركيب إطار خشبي لوحدة تكييف الشباك', price: 30, unit: 'لكل إطار' },
  split_removal: { description: 'رسوم إزالة وحدة تكييف سبليت قديمة', price: 100, unit: 'لكل وحدة' },
  window_removal: { description: 'رسوم إزالة وحدة تكييف شباك قديمة', price: 50, unit: 'لكل وحدة' },
  bracket_u24: { description: 'توريد وتركيب حامل جداري لوحدات تكييف بسعات 12K / 18K / 24K BTU', price: 60, unit: 'لكل حامل' },
  bracket_gt24: { description: 'توريد وتركيب حامل جداري للوحدات التي تزيد سعتها عن 24K BTU', price: 80, unit: 'لكل حامل' },
  scaffold_one: { description: 'سقالة دور واحد', price: 100, unit: 'ثابت' },
  scaffold_two: { description: 'سقالة دورين', price: 200, unit: 'ثابت' },
};

const normalizeServiceItems = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const catalogItem = catalogById[item?.id] || null;
      const description = String(item?.description || catalogItem?.description || '').trim();
      const price = Number(item?.price ?? catalogItem?.price ?? 0) || 0;
      const unit = String(item?.unit || catalogItem?.unit || '').trim();
      const quantity = Math.max(0, Number(item?.quantity) || 1);
      const totalPrice = Number(item?.totalPrice ?? price * quantity) || 0;

      if (!description || !price) {
        return null;
      }

      return {
        id: String(item?.id || ''),
        description,
        price,
        unit,
        quantity,
        totalPrice,
      };
    })
    .filter(Boolean);

const calculateServiceItemsTotal = (items = []) =>
  normalizeServiceItems(items).reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

const buildTechnicianView = (user, activeOrders = []) => {
  const technicianId = user.technicianId || user._id.toString();
  const hasActiveWork = activeOrders.some((order) => ['scheduled', 'in_transit', 'en_route', 'in_progress'].includes(order.status));

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
    activeOrders: orders.filter((order) => ['scheduled', 'in_transit', 'en_route', 'in_progress'].includes(order.status)).length,
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
  serviceItems: normalizeServiceItems(order.serviceItems || []),
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

const isFinalizedOrder = (order) => ['completed', 'canceled'].includes(order?.status);

const technicianOwnsOrder = (order, user) => {
  const technicianId = String(user?.technicianId || user?.userId || '');
  return String(order?.technicianId || '') === technicianId;
};

const canTechnicianChangeOrder = (order, user) => technicianOwnsOrder(order, user) && !isFinalizedOrder(order);

router.get('/excel-import/preview', async (req, res, next) => {
  try {
    const preview = await loadExcelOrdersPreview(req.query.fileName || 'data.xlsx');
    return res.status(200).json(preview);
  } catch (error) {
    return next(error);
  }
});

router.get('/dashboard', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const [users, orders] = await Promise.all([
      User.find({ role: { $in: ['technician', 'regional_dispatcher'] } }).sort({ createdAt: -1 }),
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
        phone: normalizeSaudiPhoneNumber(phone),
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
    const { customerName, phone, address, acType, scheduledDate, technicianId, notes, serviceItems } = req.body;
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
      phone: normalizeSaudiPhoneNumber(phone),
      address,
      acType,
      scheduledDate,
      notes,
      technicianId: assignedTechnician ? (assignedTechnician.technicianId || assignedTechnician._id.toString()) : '',
      technicianName: assignedTechnician ? `${assignedTechnician.firstName} ${assignedTechnician.lastName}`.trim() : 'Unassigned',
      extras: { copperMeters: 0, baseIncluded: false, totalPrice: calculateServiceItemsTotal(serviceItems) },
      serviceItems: normalizeServiceItems(serviceItems),
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
  authorize(['admin', 'regional_dispatcher']),
  [param('orderId').notEmpty().withMessage('Order id is required')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const order = await findOrderByIdentifier(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (req.user.role === 'regional_dispatcher') {
        const ownTechnicianId = req.user.technicianId || req.user.userId;
        if (String(order.technicianId || '') !== String(ownTechnicianId || '')) {
          return res.status(403).json({ message: 'ليس لديك صلاحية على هذا الطلب' });
        }

        if (req.body.scheduledDate !== undefined) {
          order.scheduledDate = String(req.body.scheduledDate || order.scheduledDate);
        }

        if (req.body.status !== undefined) {
          if (!['scheduled', 'completed'].includes(String(req.body.status))) {
            return res.status(400).json({ message: 'الحالة غير مسموحة لحساب المنطقة' });
          }
          order.status = req.body.status;
        }

        if (req.body.coordinationNote !== undefined || req.body.notes !== undefined) {
          const note = String(req.body.coordinationNote || req.body.notes || '').trim();
          if (note) {
            order.notes = order.notes ? `${order.notes}\n\n${note}` : note;
          }
        }

        await order.save();
        return res.status(200).json({ order: serializeOrder(order) });
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

      if (req.body.serviceItems !== undefined) {
        order.serviceItems = normalizeServiceItems(req.body.serviceItems);
        order.extras.totalPrice =
          calculateExtrasTotal(order.extras?.copperMeters || 0, Boolean(order.extras?.baseIncluded)) +
          calculateServiceItemsTotal(order.serviceItems);
      }

      await order.save();
      return res.status(200).json({ order: serializeOrder(order) });
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
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

      const requestedStatus = String(req.body.status || '').trim();
      const status = requestedStatus === 'rescheduled' ? 'scheduled' : requestedStatus;

      if (!['completed', 'rescheduled'].includes(requestedStatus)) {
        return res.status(400).json({ message: 'Invalid compact order status' });
      }

      if (order.status === 'canceled') {
        return res.status(409).json({ message: 'Canceled orders cannot be updated from the compact table' });
      }

      order.status = status;
      await order.save();

      return res.status(200).json({ order: serializeOrder(order) });
    } catch (error) {
      return next(error);
    }
  }
);

router.post('/orders/:orderId/cancel', authenticate, authorize(['technician', 'admin']), async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'technician' && !canTechnicianChangeOrder(order, req.user)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لإلغاء هذا الطلب' });
    }

    if (isFinalizedOrder(order)) {
      return res.status(409).json({ message: 'لا يمكن إلغاء الطلب بعد اكتماله أو إلغائه' });
    }

    const reason = String(req.body?.reason || '').trim();
    order.status = 'canceled';
    if (reason) {
      order.notes = order.notes ? `${order.notes}\n\nإلغاء الطلب: ${reason}` : `إلغاء الطلب: ${reason}`;
    }

    await order.save();
    return res.status(200).json({ order: serializeOrder(order) });
  } catch (error) {
    return next(error);
  }
});

router.get('/technician/orders', authenticate, authorize(['technician', 'regional_dispatcher', 'admin']), async (req, res, next) => {
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

router.put('/orders/:orderId/status', authenticate, authorize(['technician', 'regional_dispatcher', 'admin']), async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'technician' && !canTechnicianChangeOrder(order, req.user)) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لتعديل هذا الطلب' });
    }

    if (req.user.role === 'technician' && isFinalizedOrder(order)) {
      return res.status(409).json({ message: 'لا يمكن تعديل الطلب بعد اكتماله أو إلغائه' });
    }

    const requestedStatus = String(req.body.status || '').trim();
    if (req.user.role === 'technician' && !['completed', 'rescheduled'].includes(requestedStatus)) {
      return res.status(400).json({ message: 'الحالة غير مدعومة من شاشة الفني المبسطة' });
    }

    order.status = requestedStatus === 'rescheduled' ? 'suspended' : requestedStatus || order.status;
    if (requestedStatus === 'rescheduled') {
      const reason = String(req.body.suspensionReason || 'طلب إعادة جدولة من الفني').trim();
      order.notes = order.notes ? `${order.notes}\n\n${reason}` : reason;
    }
    await order.save();
    return res.status(200).json({ order: serializeOrder(order) });
  } catch (error) {
    return next(error);
  }
});

router.put('/orders/:orderId/extras', authenticate, authorize(['admin']), async (req, res, next) => {
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
    if (req.body.serviceItems !== undefined) {
      order.serviceItems = normalizeServiceItems(req.body.serviceItems);
    }
    order.extras.totalPrice += calculateServiceItemsTotal(order.serviceItems || []);
    await order.save();

    return res.status(200).json({ order: serializeOrder(order) });
  } catch (error) {
    return next(error);
  }
});

router.post('/orders/:orderId/photos', authenticate, authorize(['technician', 'admin']), async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'technician' && !canTechnicianChangeOrder(order, req.user)) {
      return res.status(403).json({ message: 'لا يمكن رفع صور على طلب مكتمل أو غير تابع لك' });
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
