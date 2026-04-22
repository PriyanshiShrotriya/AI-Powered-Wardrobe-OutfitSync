const ClothingItem = require('../models/ClothingItem');
const { getRuleBasedRecommendation } = require('../services/outfitService');
const { getAiRecommendation } = require('../services/aiClientService');
const { getLiveWeather: getLiveWeatherData } = require('../services/weatherService');

const WEATHER_CONDITION_BY_CATEGORY = {
  hot: 'sunny',
  warm: 'sunny',
  mild: 'cloudy',
  cold: 'windy',
  rainy: 'rainy',
};

const DEFAULT_TEMPERATURE_BY_CATEGORY = {
  hot: 32,
  warm: 26,
  mild: 20,
  cold: 10,
  rainy: 18,
};

const recommendOutfit = async (req, res, next) => {
  try {
    const {
      weather,
      occasion,
      temperature_celsius,
      weather_condition,
      style_preference,
      formality_level,
      avoid_colors,
    } = req.body;

    const normalizedWeather = (weather || '').toString().trim().toLowerCase();
    const resolvedTemperature =
      temperature_celsius ?? DEFAULT_TEMPERATURE_BY_CATEGORY[normalizedWeather] ?? 20;
    const resolvedWeatherCondition =
      weather_condition || WEATHER_CONDITION_BY_CATEGORY[normalizedWeather] || 'cloudy';

    // Validate required fields from request body
    if (!occasion) {
      return res.status(400).json({
        message: 'occasion is required',
      });
    }

    // Fetch user's full wardrobe from MongoDB
    const wardrobeItems = await ClothingItem.find({ userId: req.user.userId });

    if (!wardrobeItems.length) {
      return res.status(400).json({
        message: 'No wardrobe items available for recommendation',
      });
    }

    // Map MongoDB documents to plain objects matching OutfitRequest wardrobe schema
    // MongoDB fields: _id, userId, type, category, color, season, occasion, imageUrl, timestamps
    // Map to: id, name, category, colors (as list), style_tags, occasion_tags, weather_suitability, fabric, fit
    const mappedWardrobe = wardrobeItems.map((item) => ({
      id: item._id.toString(),
      name: item.type, // Use MongoDB 'type' as item name
      category: item.category,
      colors: [item.color], // MongoDB stores single color; wrap in array
      style_tags: [], // Not available in current MongoDB schema; default to empty
      occasion_tags: item.occasion ? [item.occasion] : [], // Wrap MongoDB occasion field
      weather_suitability: item.season ? [item.season] : [], // Map season to weather_suitability
      fabric: null, // Not stored in current schema
      fit: null, // Not stored in current schema
    }));

    // Build the OutfitRequest payload for AI service
    const aiServicePayload = {
      user_id: req.user.userId,
      wardrobe: mappedWardrobe,
      occasion,
      temperature_celsius: Number(resolvedTemperature),
      weather_condition: resolvedWeatherCondition,
      style_preference: style_preference || 'casual',
      formality_level: formality_level || 3,
      avoid_colors: avoid_colors || [],
    };

    // Call AI service POST /recommend endpoint
    const aiResponse = await getAiRecommendation(aiServicePayload);

    // Return AI recommendation directly to client
    return res.json(aiResponse);
  } catch (error) {
    // Handle AI service errors specifically
    if (error.response && error.response.status === 422) {
      // Forward 422 (Unprocessable Entity) errors from AI service
      return res.status(422).json({
        message: error.response.data.detail || 'Unable to assemble outfit',
      });
    }

    // Forward other HTTP errors or handle connection failures
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'AI service error',
      });
    }

    // Pass unexpected errors to middleware
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
