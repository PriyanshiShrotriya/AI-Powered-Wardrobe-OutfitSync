const axios = require('axios');

const getAiRecommendation = async ({ wardrobeItems, weather, occasion }) => {
  const aiServiceBaseUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceBaseUrl) {
    throw new Error('AI_SERVICE_URL is not configured');
  }

  const response = await axios.post(
    `${aiServiceBaseUrl}/recommend`,
    {
      wardrobe: wardrobeItems,
      weather,
      occasion,
    },
    {
      timeout: 5000,
    }
  );

  return response.data;
};

module.exports = {
  getAiRecommendation,
};
