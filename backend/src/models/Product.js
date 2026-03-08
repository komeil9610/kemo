const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'وصف المنتج مطلوب'],
    },
    category: {
      type: String,
      enum: ['device', 'costume', 'service', 'other'],
      required: true,
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'السعر اليومي مطلوب'],
      min: 0,
    },
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },
    location: {
      city: String,
      region: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number],
      },
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair'],
      default: 'good',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
