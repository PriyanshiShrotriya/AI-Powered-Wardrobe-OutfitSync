const axios = require('axios');

const DEFAULT_RECOMMENDATION_TIMEOUT_MS = 12000;
const AI_UNAVAILABLE_ERROR_CODES = new Set([
  'ECONNABORTED',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
]);

const getRecommendationTimeoutMs = (rawValue = process.env.AI_RECOMMEND_TIMEOUT_MS) => {
  if (rawValue === undefined || rawValue === '') {
    return DEFAULT_RECOMMENDATION_TIMEOUT_MS;
  }

  const timeoutMs = Number(rawValue);
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error('AI_RECOMMEND_TIMEOUT_MS must be a positive integer');
  }

  return timeoutMs;
};

const isAiUnavailableError = (error) => AI_UNAVAILABLE_ERROR_CODES.has(error?.code);

const isValidRecommendation = (recommendation) => (
  recommendation &&
  typeof recommendation === 'object' &&
  recommendation.top &&
  recommendation.bottom &&
  recommendation.shoes &&
  typeof recommendation.reasoning === 'string' &&
  typeof recommendation.style_score === 'number'
);

const getAiRecommendation = async (outfitRequest) => {
  const aiServiceBaseUrl = process.env.AI_SERVICE_URL;
  const recommendationTimeoutMs = getRecommendationTimeoutMs();

  if (!aiServiceBaseUrl) {
    throw new Error('AI_SERVICE_URL is not configured');
  }

  const response = await axios.post(
    `${aiServiceBaseUrl}/recommend`,
    outfitRequest,
    {
      timeout: recommendationTimeoutMs,
    }
  );

  const recommendation = response.data;
  if (!isValidRecommendation(recommendation)) {
    const error = new Error('AI service returned an invalid recommendation shape');
    error.code = 'ERR_AI_MALFORMED_RESPONSE';
    throw error;
  }

  return recommendation;
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
  getRecommendationTimeoutMs,
  isAiUnavailableError,
  isValidRecommendation,
  analyzeClothingImage,
  createClothingImageAnalysisJob,
  getClothingImageAnalysisJob,
};
