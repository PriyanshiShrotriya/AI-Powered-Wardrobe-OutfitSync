import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const initialForm = {
  type: '',
  category: 'upperwear',
  color: '',
  season: 'summer',
  occasion: 'casual',
  imageUrl: '',
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
      await fetchItems();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to add item.');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 md:grid-cols-[340px_1fr] md:px-8">
        <section className="card-surface fade-in h-fit rounded-3xl p-6">
          <h2 className="text-3xl text-[var(--ink)]">Add Clothing Item</h2>
          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <input
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
              placeholder="Type (shirt, pants, shoes...)"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              required
            />
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
            >
              <option value="upperwear">Upperwear</option>
              <option value="bottomwear">Bottomwear</option>
            </select>
            <input
              value={form.color}
              onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
              placeholder="Color"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              required
            />
            <select
              value={form.season}
              onChange={(event) => setForm((prev) => ({ ...prev, season: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
            >
              <option value="summer">Summer</option>
              <option value="winter">Winter</option>
              <option value="spring">Spring</option>
              <option value="fall">Fall</option>
            </select>
            <select
              value={form.occasion}
              onChange={(event) => setForm((prev) => ({ ...prev, occasion: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
            >
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="sport">Sport</option>
              <option value="party">Party</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </form>
        </section>

        <section className="fade-in">
          <h2 className="text-3xl text-[var(--ink)]">Wardrobe Grid</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default WardrobePage;
