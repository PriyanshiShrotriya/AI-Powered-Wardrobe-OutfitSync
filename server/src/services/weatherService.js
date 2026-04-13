const axios = require('axios');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const toWeatherCategory = ({ temperature, precipitation }) => {
  if (precipitation >= 0.2) {
    return 'rainy';
  }

  if (temperature >= 30) {
    return 'hot';
  }

  if (temperature >= 24) {
    return 'warm';
  }

  if (temperature >= 16) {
    return 'mild';
  }

  return 'cold';
};

const getWeatherByCoordinates = async ({ latitude, longitude }) => {
  const weatherResponse = await axios.get(FORECAST_URL, {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,precipitation,weather_code',
      timezone: 'auto',
    },
    timeout: 5000,
  });

  const current = weatherResponse.data?.current || {};
  const temperature = Number(current.temperature_2m || 0);
  const precipitation = Number(current.precipitation || 0);

  return {
    latitude,
    longitude,
    temperature,
    precipitation,
    weatherCode: current.weather_code,
    weatherCategory: toWeatherCategory({ temperature, precipitation }),
  };
};

const getLiveWeather = async ({ city, latitude, longitude }) => {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
    const weather = await getWeatherByCoordinates({ latitude: lat, longitude: lon });

    return {
      city: 'Current Location',
      country: 'Detected via GPS',
      ...weather,
    };
  }

  const normalizedCity = (city || '').trim();
  if (!normalizedCity) {
    const error = new Error('Provide either city or latitude and longitude');
    error.statusCode = 400;
    throw error;
  }

  const geocodeResponse = await axios.get(GEOCODING_URL, {
    params: {
      name: normalizedCity,
      count: 1,
      language: 'en',
      format: 'json',
    },
    timeout: 5000,
  });

  const place = geocodeResponse.data?.results?.[0];
  if (!place) {
    const error = new Error('City not found');
    error.statusCode = 404;
    throw error;
  }

  const weather = await getWeatherByCoordinates({
    latitude: place.latitude,
    longitude: place.longitude,
  });

  return {
    city: place.name,
    country: place.country,
    ...weather,
  };
};

module.exports = {
  getLiveWeather,
};
