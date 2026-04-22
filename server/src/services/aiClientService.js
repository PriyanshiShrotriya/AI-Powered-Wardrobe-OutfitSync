const axios = require('axios');

const getAiRecommendation = async (outfitRequest) => {
  const aiServiceBaseUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceBaseUrl) {
    throw new Error('AI_SERVICE_URL is not configured');
  }

  const response = await axios.post(
    `${aiServiceBaseUrl}/recommend`,
    outfitRequest,
    {
      timeout: 30000, // Increased timeout for AI processing
    }
  );

  return response.data;
};

const analyzeClothingImage = async ({ imageBase64 }) => {
  const aiServiceBaseUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceBaseUrl) {
    throw new Error('AI_SERVICE_URL is not configured');
  }

  const response = await axios.post(
    `${aiServiceBaseUrl}/analyze-item`,
    {
      image_base64: imageBase64,
    },
    {
      timeout: 120000,
    }
  );

  return response.data;
};

const createClothingImageAnalysisJob = async ({ imageBase64 }) => {
  const aiServiceBaseUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceBaseUrl) {
    throw new Error('AI_SERVICE_URL is not configured');
  }

  const response = await axios.post(
    `${aiServiceBaseUrl}/analyze-item/jobs`,
    {
      image_base64: imageBase64,
    },
    {
      timeout: 10000,
    }
  );

  return response.data;
};

const getClothingImageAnalysisJob = async ({ jobId }) => {
  const aiServiceBaseUrl = process.env.AI_SERVICE_URL;

  if (!aiServiceBaseUrl) {
    throw new Error('AI_SERVICE_URL is not configured');
  }

  const response = await axios.get(`${aiServiceBaseUrl}/analyze-item/jobs/${jobId}`, {
    timeout: 10000,
  });

  return response.data;
};

module.exports = {
  getAiRecommendation,
  analyzeClothingImage,
  createClothingImageAnalysisJob,
  getClothingImageAnalysisJob,
};
