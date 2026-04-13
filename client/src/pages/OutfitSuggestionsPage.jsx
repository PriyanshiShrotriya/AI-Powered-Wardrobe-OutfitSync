import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const OutfitSuggestionsPage = () => {
  const [city, setCity] = useState('');
  const [showCityFallback, setShowCityFallback] = useState(false);
  const [weather, setWeather] = useState('mild');
  const [occasion, setOccasion] = useState('casual');
  const [loading, setLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [result, setResult] = useState(null);

  const fetchLiveWeatherByCoordinates = async (latitude, longitude) => {
    setWeatherLoading(true);
    setError('');

    try {
      const response = await api.get('/outfit/weather', {
        params: { latitude, longitude },
      });
      setWeatherInfo(response.data);
      setWeather(response.data.weatherCategory);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to fetch live weather.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchLiveWeatherByCity = async () => {
    const normalizedCity = city.trim();
    if (!normalizedCity) {
      setError('Please enter a city name.');
      return;
    }

    setWeatherLoading(true);
    setError('');

    try {
      const response = await api.get('/outfit/weather', {
        params: { city: normalizedCity },
      });
      setWeatherInfo(response.data);
      setWeather(response.data.weatherCategory);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to fetch weather for this city.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchLiveWeather = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      setShowCityFallback(true);
      return;
    }

    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchLiveWeatherByCoordinates(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        setError('Location access denied. Please allow location permission.');
        setShowCityFallback(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/outfit/recommend', { weather, occasion });
      setResult(response.data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to generate suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const recommendation = result?.recommendation;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <section className="card-surface fade-in rounded-3xl p-6">
          <h2 className="text-4xl text-[var(--ink)]">Outfit Suggestions</h2>
          <p className="mt-2 text-slate-700">
            Select weather and occasion to generate AI-assisted combinations from your wardrobe.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-[auto]">
            <button
              type="button"
              onClick={fetchLiveWeather}
              disabled={weatherLoading}
              className="rounded-xl bg-[var(--ink)] px-5 py-2.5 font-semibold text-white disabled:opacity-60"
            >
              {weatherLoading ? 'Fetching weather...' : 'Use My Location Weather'}
            </button>
          </div>
          {showCityFallback ? (
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Enter city (fallback)"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              />
              <button
                type="button"
                onClick={fetchLiveWeatherByCity}
                disabled={weatherLoading}
                className="rounded-xl bg-slate-700 px-5 py-2.5 font-semibold text-white disabled:opacity-60"
              >
                {weatherLoading ? 'Fetching weather...' : 'Fetch by City'}
              </button>
            </div>
          ) : null}
          {weatherInfo ? (
            <p className="mt-3 text-sm text-slate-700">
              Live weather in {weatherInfo.city}, {weatherInfo.country}: {weatherInfo.temperature}C, precipitation {weatherInfo.precipitation} mm.
              Mapped category: <strong>{weatherInfo.weatherCategory}</strong>
            </p>
          ) : null}
          <form className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={onSubmit}>
            <select
              value={weather}
              onChange={(event) => setWeather(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
            >
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="mild">Mild</option>
              <option value="cold">Cold</option>
              <option value="rainy">Rainy</option>
            </select>
            <select
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2"
            >
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="sport">Sport</option>
              <option value="party">Party</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Generating...' : 'Suggest Outfit'}
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>

        {recommendation ? (
          <section className="fade-in mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">Source: {result.source}</span>
              <span className="rounded-full bg-white px-3 py-1">Strategy: {recommendation.strategy}</span>
            </div>
            <p className="mb-4 text-slate-700">{recommendation.notes}</p>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendation.items?.map((item, index) => (
                <article key={`${item._id || item.type}-${index}`} className="card-surface rounded-2xl p-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.type} className="h-40 w-full rounded-xl object-cover" />
                  ) : null}
                  <h3 className="mt-3 text-2xl text-[var(--ink)]">{item.type}</h3>
                  <p className="text-sm text-slate-700">Color: {item.color}</p>
                  <p className="text-sm text-slate-700">Season: {item.season}</p>
                  <p className="text-sm text-slate-700">Occasion: {item.occasion}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default OutfitSuggestionsPage;
