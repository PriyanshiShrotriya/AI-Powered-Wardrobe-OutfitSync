const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['upperwear', 'bottomwear'],
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    season: {
      type: String,
      required: true,
      trim: true,
    },
    occasion: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ClothingItem', clothingItemSchema);
