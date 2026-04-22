const ClothingItem = require('../models/ClothingItem');
const {
  analyzeClothingImage,
  createClothingImageAnalysisJob,
  getClothingImageAnalysisJob,
} = require('../services/aiClientService');

const addClothingItem = async (req, res, next) => {
  try {
    const {
      type,
      category,
      color,
      season,
      occasion,
      imageUrl,
      autoFillFromImage,
    } = req.body;

    let resolvedType = type;
    let resolvedCategory = category;
    let resolvedColor = color;
    let resolvedSeason = season;
    let resolvedOccasion = occasion;

    if (autoFillFromImage && imageUrl) {
      try {
        const analyzed = await analyzeClothingImage({ imageBase64: imageUrl });
        resolvedType = resolvedType || analyzed.type;
        resolvedCategory = resolvedCategory || analyzed.category;
        resolvedColor = resolvedColor || analyzed.color;
        resolvedSeason = resolvedSeason || analyzed.season;
        resolvedOccasion = resolvedOccasion || analyzed.occasion;
      } catch {
        // Keep request flow working with user-provided fields if AI service is unavailable.
      }
    }

    if (resolvedCategory === 'footwear') {
      resolvedCategory = 'bottomwear';
    }

    if (!resolvedType || !resolvedCategory || !resolvedColor || !resolvedSeason || !resolvedOccasion) {
      return res.status(400).json({
        message: 'type, category, color, season, and occasion are required',
      });
    }

    if (!['upperwear', 'bottomwear'].includes(resolvedCategory)) {
      return res.status(400).json({
        message: 'category must be upperwear or bottomwear',
      });
    }

    const item = await ClothingItem.create({
      userId: req.user.userId,
      type: resolvedType,
      category: resolvedCategory,
      color: resolvedColor,
      season: resolvedSeason,
      occasion: resolvedOccasion,
      imageUrl: imageUrl || '',
    });

    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
};

const analyzeWardrobeItem = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'imageUrl is required' });
    }

    const job = await createClothingImageAnalysisJob({ imageBase64: imageUrl });
    return res.status(202).json(job);
  } catch (error) {
    return next(error);
  }
};

const getWardrobeAnalysisJob = async (req, res, next) => {
  try {
    const job = await getClothingImageAnalysisJob({ jobId: req.params.jobId });
    return res.json(job);
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
  analyzeWardrobeItem,
  getWardrobeAnalysisJob,
  getWardrobeItems,
  deleteClothingItem,
};
