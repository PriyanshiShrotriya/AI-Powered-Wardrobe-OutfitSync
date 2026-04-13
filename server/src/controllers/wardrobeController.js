const ClothingItem = require('../models/ClothingItem');

const addClothingItem = async (req, res, next) => {
  try {
    const { type, category, color, season, occasion, imageUrl } = req.body;

    if (!type || !category || !color || !season || !occasion) {
      return res.status(400).json({
        message: 'type, category, color, season, and occasion are required',
      });
    }

    if (!['upperwear', 'bottomwear'].includes(category)) {
      return res.status(400).json({
        message: 'category must be upperwear or bottomwear',
      });
    }

    const item = await ClothingItem.create({
      userId: req.user.userId,
      type,
      category,
      color,
      season,
      occasion,
      imageUrl: imageUrl || '',
    });

    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
};

const getWardrobeItems = async (req, res, next) => {
  try {
    const items = await ClothingItem.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    return res.json(items);
  } catch (error) {
    return next(error);
  }
};

const deleteClothingItem = async (req, res, next) => {
  try {
    const deletedItem = await ClothingItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    return res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addClothingItem,
  getWardrobeItems,
  deleteClothingItem,
};
