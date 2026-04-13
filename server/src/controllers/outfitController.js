const ClothingItem = require('../models/ClothingItem');
const { getRuleBasedRecommendation } = require('../services/outfitService');
const { getAiRecommendation } = require('../services/aiClientService');
const { getLiveWeather: getLiveWeatherData } = require('../services/weatherService');

const recommendOutfit = async (req, res, next) => {
  try {
    const { wardrobeItems, weather, occasion } = req.body;

    if (!weather || !occasion) {
      return res.status(400).json({
        message: 'weather and occasion are required',
      });
    }

    let userWardrobeItems = wardrobeItems;
    if (!Array.isArray(userWardrobeItems) || userWardrobeItems.length === 0) {
      userWardrobeItems = await ClothingItem.find({ userId: req.user.userId });
    }

    if (!userWardrobeItems.length) {
      return res.status(400).json({
        message: 'No wardrobe items available for recommendation',
      });
    }

    try {
      const aiResponse = await getAiRecommendation({
        wardrobeItems: userWardrobeItems,
        weather,
        occasion,
      });

      return res.json({
        source: 'ai-service',
        recommendation: aiResponse,
      });
    } catch (aiError) {
      const fallback = getRuleBasedRecommendation({
        wardrobeItems: userWardrobeItems,
        weather,
        occasion,
      });

      return res.json({
        source: 'rule-based-fallback',
        recommendation: fallback,
        warning: `AI service unavailable: ${aiError.message}`,
      });
    }
  } catch (error) {
    return next(error);
  }
};

const getLiveWeather = async (req, res, next) => {
  try {
    const weatherData = await getLiveWeatherData({
      city: req.query.city,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    });
    return res.json(weatherData);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
};

module.exports = {
  recommendOutfit,
  getLiveWeather,
};
