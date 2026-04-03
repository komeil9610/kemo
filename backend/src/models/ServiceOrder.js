const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    url: String,
    uploadedAt: Date,
  },
  { _id: false }
);

const serviceItemSchema = new mongoose.Schema(
  {
    id: String,
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const serviceOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    acType: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: '',
    },
    scheduledDate: {
      type: String,
      required: true,
    },
    technicianId: {
      type: String,
      default: '',
    },
    technicianName: {
      type: String,
      default: 'Unassigned',
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'in_transit', 'en_route', 'in_progress', 'completed', 'suspended', 'canceled'],
      default: 'pending',
    },
    extras: {
      copperMeters: {
        type: Number,
        default: 0,
      },
      baseIncluded: {
        type: Boolean,
        default: false,
      },
      totalPrice: {
        type: Number,
        default: 0,
      },
    },
    serviceItems: {
      type: [serviceItemSchema],
      default: [],
    },
    photos: {
      type: [photoSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ServiceOrder', serviceOrderSchema);
