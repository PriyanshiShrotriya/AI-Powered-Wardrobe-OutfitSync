import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const DashboardPage = () => {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/wardrobe');
        setItemCount(response.data.length);
      } catch {
        setItemCount(0);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <section className="card-surface fade-in rounded-3xl p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Style Command Center</p>
          <h2 className="mt-2 text-4xl text-[var(--ink)]">Your Wardrobe Overview</h2>
          <p className="mt-3 max-w-2xl text-slate-700">
            Keep your closet structured, then generate weather-aware outfit suggestions in one click.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-5">
              <p className="text-sm text-slate-600">Saved Items</p>
              <p className="mt-1 text-3xl font-semibold text-[var(--ink)]">{itemCount}</p>
            </div>
            <Link to="/wardrobe" className="rounded-2xl bg-[var(--ink)] p-5 text-white transition hover:brightness-110">
              <p className="text-sm text-slate-200">Manage Closet</p>
              <p className="mt-1 text-2xl font-semibold">Add / Remove Items</p>
            </Link>
            <Link to="/outfits" className="rounded-2xl bg-[var(--accent)] p-5 text-white transition hover:brightness-95">
              <p className="text-sm text-orange-100">Instant Suggestions</p>
              <p className="mt-1 text-2xl font-semibold">Generate Outfit</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
