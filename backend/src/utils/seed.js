const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ServiceOrder = require('../models/ServiceOrder');
const { normalizeSaudiPhoneNumber } = require('./phone');

const seedUsers = [
  {
    firstName: 'Bob',
    lastName: 'Kumeel',
    email: 'bobkumeel@gmail.com',
    phone: '0500000001',
    password: 'Kom123asd@',
    role: 'admin',
  },
  {
    firstName: 'Kumeel',
    lastName: 'Alnahab',
    email: 'kumeelalnahab@gmail.com',
    phone: '0500000002',
    password: 'Komeil@123',
    role: 'technician',
    technicianId: 'tech-1',
    region: 'Eastern Province',
    notes: 'Eastern region coverage across Saudi Arabia.',
  },
];

const seedOrders = [
  {
    orderNumber: 'ORD-1001',
    customerName: 'Abu Khaled',
    phone: '0555000111',
    address: 'Al Yasmin District - Riyadh',
    acType: 'Split AC 24,000 BTU',
    notes: 'Second floor - elevator available',
    scheduledDate: '2026-03-29',
    technicianId: 'tech-1',
    technicianName: 'Eastern Technician',
    status: 'pending',
    extras: {
      copperMeters: 2,
      baseIncluded: true,
      totalPrice: 350,
    },
    photos: [],
  },
];

async function seedDemoData() {
  const adminCount = await User.countDocuments({ email: 'bobkumeel@gmail.com' });
  const technicianCount = await User.countDocuments({ email: 'kumeelalnahab@gmail.com' });

  if (!adminCount || !technicianCount) {
    const hashedUsers = await Promise.all(
      seedUsers.map(async (item) => ({
        ...item,
        phone: normalizeSaudiPhoneNumber(item.phone),
        password: await bcrypt.hash(item.password, 10),
      }))
    );

    for (const user of hashedUsers) {
      // Upsert by email keeps the seed idempotent without overwriting local changes.
      await User.findOneAndUpdate(
        { email: user.email },
        { $setOnInsert: user },
        { upsert: true, new: true }
      );
    }
  }

  const existingOrder = await ServiceOrder.countDocuments({ orderNumber: 'ORD-1001' });
  if (!existingOrder) {
    await ServiceOrder.insertMany(seedOrders);
  }
}

module.exports = {
  seedDemoData,
};
