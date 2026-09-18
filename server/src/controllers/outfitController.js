const ClothingItem = require('../models/ClothingItem');
const { getRuleBasedRecommendation } = require('../services/outfitService');
const {
  getAiRecommendation,
  isAiUnavailableError,
} = require('../services/aiClientService');
const { getLiveWeather: getLiveWeatherData } = require('../services/weatherService');
const {
  normalizeClothingType,
  isShoeType,
  getClothingGroup,
} = require('../utils/clothingClassification');

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

const SEASON_TO_WEATHER_SUITABILITY = {
  summer: ['hot', 'warm'],
  spring: ['mild', 'warm'],
  fall: ['mild', 'cold'],
  autumn: ['mild', 'cold'],
  winter: ['cold'],
  rainy: ['rainy', 'mild'],
};

const normalize = normalizeClothingType;

const resolveAiCategory = (item) => {
  const normalizedType = normalize(item.type);
  const normalizedCategory = normalize(item.category);

  if (isShoeType(normalizedType)) {
    return 'shoes';
  }

  if (normalizedCategory === 'upperwear') {
    return 'top';
  }

  if (normalizedCategory === 'bottomwear') {
    return 'bottom';
  }

  return 'top';
};

const resolveWeatherSuitability = (season) => {
  const normalizedSeason = normalize(season);
  return SEASON_TO_WEATHER_SUITABILITY[normalizedSeason] || ['mild'];
};

const mapWardrobeItemForAi = (item) => ({
  id: item._id.toString(),
  name: item.type,
  category: resolveAiCategory(item),
  colors: [item.color],
  style_tags: item.occasion ? [normalize(item.occasion)] : [],
  occasion_tags: item.occasion ? [item.occasion] : [],
  weather_suitability: resolveWeatherSuitability(item.season),
  fabric: null,
  fit: null,
  image_url: item.imageUrl || '',
});

const mapWardrobeItemForSuggestion = (item) => {
  if (!item) {
    return null;
  }

  return {
    id: item._id?.toString?.() || item.id,
    name: item.type || item.name || 'Item',
    category: item.category,
    colors: item.colors || (item.color ? [item.color] : []),
    style_tags: item.style_tags || [],
    occasion_tags: item.occasion_tags || (item.occasion ? [item.occasion] : []),
    weather_suitability: item.weather_suitability || resolveWeatherSuitability(item.season),
    fabric: item.fabric || null,
    fit: item.fit || null,
    image_url: item.image_url || item.imageUrl || '',
  };
};

const buildFallbackSuggestion = ({ fallback, weather, occasion }) => {
  const fallbackItems = fallback?.items || [];
  const top = fallbackItems.find((item) => normalize(item.category) === 'upperwear') || null;
  const bottom = fallbackItems.find((item) => normalize(item.category) === 'bottomwear') || null;
  const shoes = fallbackItems.find((item) => getClothingGroup(item) === 'shoes') || null;

  const selectedCount = [top, bottom, shoes].filter(Boolean).length;
  const styleScoreByCoverage = {
    0: 0,
    1: 0.25,
    2: 0.45,
    3: 0.65,
  };

  return {
    strategy: 'rule-based-fallback',
    fallback_reason: fallback?.notes || 'AI recommendation was unavailable.',
    reasoning: fallback?.notes || `Fallback match for ${occasion || 'occasion'} in ${weather || 'current'} weather.`,
    style_score: styleScoreByCoverage[selectedCount] ?? 0.35,
    top: mapWardrobeItemForSuggestion(top),
    bottom: mapWardrobeItemForSuggestion(bottom),
    shoes: mapWardrobeItemForSuggestion(shoes),
    outerwear: null,
    accessory: null,
    items: fallbackItems.map(mapWardrobeItemForSuggestion),
  };
};

const recommendOutfit = async (req, res, next) => {
  let wardrobeItems = [];

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
    wardrobeItems = await ClothingItem.find({ userId: req.user.userId });

    if (!wardrobeItems.length) {
      return res.status(400).json({
        message: 'No wardrobe items available for recommendation',
      });
    }

    // Map MongoDB documents to plain objects matching OutfitRequest wardrobe schema
    // MongoDB fields: _id, userId, type, category, color, season, occasion, imageUrl, timestamps
    // Map to: id, name, category, colors (as list), style_tags, occasion_tags, weather_suitability, fabric, fit
    const mappedWardrobe = wardrobeItems.map(mapWardrobeItemForAi);

    const categorySet = new Set(mappedWardrobe.map((item) => item.category));
    if (!categorySet.has('top') || !categorySet.has('bottom') || !categorySet.has('shoes')) {
      const fallback = getRuleBasedRecommendation({
        wardrobeItems,
        weather: normalizedWeather,
        occasion,
      });

      return res.status(200).json({
        message: 'Add at least one top, bottom, and shoes item for full AI outfit assembly.',
        ...buildFallbackSuggestion({
          fallback,
          weather: normalizedWeather,
          occasion,
        }),
      });
    }

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

    // If AI service times out or is temporarily unavailable, return a fast fallback.
    if (isAiUnavailableError(error)) {
      const fallback = getRuleBasedRecommendation({
        wardrobeItems,
        weather: req.body.weather,
        occasion: req.body.occasion,
      });

      return res.status(200).json({
        message: 'AI recommendation timed out, showing best available instant match.',
        ...buildFallbackSuggestion({
          fallback,
          weather: req.body.weather,
          occasion: req.body.occasion,
        }),
      });
    }

    if (error.code === 'ERR_AI_MALFORMED_RESPONSE') {
      return res.status(502).json({
        message: 'AI service returned an invalid recommendation.',
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
  buildFallbackSuggestion,
};
