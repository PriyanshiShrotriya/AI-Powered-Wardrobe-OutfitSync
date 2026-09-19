import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';

const initialForm = {
  type: '',
  category: 'upperwear',
  color: '',
  season: 'summer',
  occasion: 'casual',
  imageUrl: '',
};

const CONFIDENCE_THRESHOLDS = {
  type: 0.45,
  category: 0.45,
  color: 0.35,
  season: 0.4,
  occasion: 0.4,
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const WardrobePage = () => {
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    const response = await api.get('/wardrobe');
    setItems(response.data);
  };

  useEffect(() => {
    fetchItems().catch(() => setError('Unable to load wardrobe items.'));
  }, []);

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const base64 = await fileToBase64(file);
    setForm((prev) => ({ ...prev, imageUrl: base64 }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/wardrobe', form);
      setForm(initialForm);
      setAnalysis(null);
      await fetchItems();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to add item.');
    } finally {
      setLoading(false);
    }
  };

  const onAnalyzeImage = async () => {
    if (!form.imageUrl) {
      setError('Upload an image first to auto-fill details.');
      return;
    }

    setError('');
    setAnalyzing(true);
    try {
      const startResponse = await api.post('/wardrobe/analyze', { imageUrl: form.imageUrl });
      const jobId = startResponse.data?.job_id;

      if (!jobId) {
        throw new Error('Analysis job could not be created.');
      }

      let finalResult = null;
      for (let attempts = 0; attempts < 60; attempts += 1) {
        const statusResponse = await api.get(`/wardrobe/analyze/${jobId}`);
        const { status, result, error: jobError } = statusResponse.data;

        if (status === 'completed' && result) {
          finalResult = result;
          break;
        }

        if (status === 'failed') {
          throw new Error(jobError || 'Image analysis failed.');
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!finalResult) {
        throw new Error('Image analysis is taking longer than expected. Please try again.');
      }

      const { type, category, color, season, occasion, confidence } = finalResult;
      const safeCategory = category === 'footwear' ? 'bottomwear' : category;
      setForm((prev) => ({
        ...prev,
        type: confidence?.type >= CONFIDENCE_THRESHOLDS.type && type ? type : prev.type,
        category: confidence?.category >= CONFIDENCE_THRESHOLDS.category && safeCategory ? safeCategory : prev.category,
        color: confidence?.color >= CONFIDENCE_THRESHOLDS.color && color ? color : prev.color,
        season: confidence?.season >= CONFIDENCE_THRESHOLDS.season && season ? season : prev.season,
        occasion: confidence?.occasion >= CONFIDENCE_THRESHOLDS.occasion && occasion ? occasion : prev.occasion,
      }));

      const lowConfidenceFields = Object.entries(confidence || {})
        .filter(([field, score]) => score < (CONFIDENCE_THRESHOLDS[field] || 0))
        .map(([field]) => field);

      setAnalysis({
        ...finalResult,
        lowConfidenceFields,
      });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to analyze image right now.');
    } finally {
      setAnalyzing(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/wardrobe/${id}`);
      await fetchItems();
    } catch {
      setError('Unable to delete item.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--base-bg)] to-[#ece6da]">
      <Navbar />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-[360px_1fr] md:px-8 md:py-12">
        <section className="card-surface fade-in h-fit rounded-3xl p-6 md:p-7">
          <span className="premium-pill">Wardrobe Intake</span>
          <h2 className="mt-3 text-[1.8rem] text-[var(--ink)]">Add Clothing Item</h2>
          <p className="mt-2 text-sm text-slate-600">Upload an image and let AI pre-fill details, then save to your collection.</p>
          <form className="mt-6 space-y-3.5" onSubmit={onSubmit}>
            <div>
              <label className="ui-label" htmlFor="wardrobe-type">Type</label>
              <input id="wardrobe-type" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))} placeholder="Shirt, pants, shoes..." className="ui-field" required />
            </div>
            <div>
              <label className="ui-label" htmlFor="wardrobe-category">Category</label>
              <select id="wardrobe-category" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} className="ui-field">
                <option value="upperwear">Upperwear</option>
                <option value="bottomwear">Bottomwear</option>
              </select>
            </div>
            <div>
              <label className="ui-label" htmlFor="wardrobe-color">Color</label>
              <input id="wardrobe-color" value={form.color} onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))} placeholder="Color" className="ui-field" required />
            </div>
            <div>
              <label className="ui-label" htmlFor="wardrobe-season">Season</label>
              <select id="wardrobe-season" value={form.season} onChange={(event) => setForm((prev) => ({ ...prev, season: event.target.value }))} className="ui-field">
                <option value="summer">Summer</option>
                <option value="winter">Winter</option>
                <option value="spring">Spring</option>
                <option value="fall">Fall</option>
              </select>
            </div>
            <div>
              <label className="ui-label" htmlFor="wardrobe-occasion">Occasion</label>
              <select id="wardrobe-occasion" value={form.occasion} onChange={(event) => setForm((prev) => ({ ...prev, occasion: event.target.value }))} className="ui-field">
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="sport">Sport</option>
                <option value="party">Party</option>
              </select>
            </div>
            <div>
              <label className="ui-label" htmlFor="wardrobe-image">Image</label>
              <input id="wardrobe-image" type="file" accept="image/*" onChange={onFileChange} className="ui-field" />
            </div>
            <button
              type="button"
              onClick={onAnalyzeImage}
              disabled={!form.imageUrl || analyzing}
              className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {analyzing ? <LoadingState label="Analyzing image..." /> : 'Auto Fill Details From Image'}
            </button>
            {analysis ? (
              <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/45 p-3 text-sm text-[var(--ink)]">
                <p className="font-semibold">Review the suggested fields before saving.</p>
                <p className="mt-1">
                  Suggested: {analysis.type} / {analysis.category} / {analysis.color} / {analysis.season} / {analysis.occasion}
                </p>
                <p className="mt-1 text-xs text-slate-700">
                  Confidence: type {Math.round((analysis.confidence?.type || 0) * 100)}%, category {Math.round((analysis.confidence?.category || 0) * 100)}%, color {Math.round((analysis.confidence?.color || 0) * 100)}%, season {Math.round((analysis.confidence?.season || 0) * 100)}%, occasion {Math.round((analysis.confidence?.occasion || 0) * 100)}%
                </p>
                <p className="mt-1">Low confidence fields: {analysis.lowConfidenceFields.length ? analysis.lowConfidenceFields.join(', ') : 'none'}</p>
              </div>
            ) : null}
            {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? <LoadingState label="Saving..." /> : 'Save Item'}
            </button>
          </form>
        </section>

        <section className="fade-in">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <span className="premium-pill">Collection</span>
              <h2 className="mt-2 text-[1.8rem] text-[var(--ink)]">Wardrobe Grid</h2>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              {items.length} Items
            </span>
          </div>
          {items.length ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
              <article key={item._id} className="card-surface rounded-2xl p-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.type}
                    className="h-44 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center rounded-xl bg-white text-sm text-slate-500">
                    No image
                  </div>
                )}
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p><strong>Type:</strong> {item.type}</p>
                  <p><strong>Category:</strong> {item.category || 'n/a'}</p>
                  <p><strong>Color:</strong> {item.color}</p>
                  <p><strong>Season:</strong> {item.season}</p>
                  <p><strong>Occasion:</strong> {item.occasion}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(item._id)}
                  className="btn-secondary mt-3 w-full"
                >
                  Delete
                </button>
              </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your wardrobe is empty"
              description="Add your first clothing item to start building personalized outfit suggestions."
              action={<a href="#wardrobe-type" className="btn-primary">Add your first item</a>}
            />
          )}
        </section>
      </main>
    </div>
  );
};

export default WardrobePage;
