import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const DashboardPage = () => {
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/wardrobe');
        setItemCount(response.data.length);
      } catch {
        setItemCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--base-bg)] to-[#ece6da]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col space-y-16 px-6 pb-20 pt-14 md:space-y-20 md:px-8 md:pt-18">
        {/* Hero Section with Enhanced Visual Appeal */}
        <section className="fade-in">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-white/45 p-7 md:p-10">
            {/* Decorative Background Elements */}
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[var(--accent-soft)]/35 blur-3xl opacity-55"></div>
            
            <div className="relative z-10">
              <div className="mb-3 inline-block">
                <span className="premium-pill">
                  ✨ Welcome to Your Personal Stylist
                </span>
              </div>
              <h1 className="mb-4 max-w-[16ch] text-[2rem] font-bold leading-tight tracking-tight text-[var(--ink)] md:text-[2.8rem]">
                Your <span className="bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent)] bg-clip-text text-transparent">Perfect</span> Style Awaits
              </h1>
              <p className="max-w-[56ch] text-[0.9rem] leading-relaxed text-slate-600">
                Unlock your unique fashion sense with AI-powered outfit recommendations. Smart styling, simplified.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/wardrobe" className="btn-primary">
                  <span>📦 Explore Your Wardrobe</span>
                </Link>
                <Link to="/outfits" className="btn-secondary">
                  <span>✨ Get Outfit Ideas</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Stats & Quick Actions Grid */}
        <section className="pt-1">
          <div className="grid gap-5 md:grid-cols-3">
          {/* Wardrobe Stats Card */}
          <div className="group stat-card flex h-full min-h-[208px] flex-col justify-between">
            <div className="stat-card-inner">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">👔</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Total Items</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-[var(--ink)]">
                    {isLoading ? <span className="animate-pulse">...</span> : itemCount}
                  </h3>
                  <span className="text-xs text-slate-600">pieces</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-soft)] to-[var(--accent)]/10 text-xl opacity-0 transition-opacity group-hover:opacity-100">
                ✓
              </div>
            </div>
            <div className="mt-5 h-1 origin-left scale-x-0 rounded-full bg-gradient-to-r from-[var(--accent-strong)] via-[var(--accent)]/50 to-transparent transition-transform duration-300 group-hover:scale-x-100"></div>
          </div>

          {/* Quick Action: Add Items */}
          <Link to="/wardrobe" className="group quick-action-card accent flex h-full min-h-[208px] flex-col justify-between">
            <div className="quick-action-inner">
              <div className="mb-2.5 flex items-start justify-between">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Quick Action</p>
                  <h3 className="text-[1.2rem] font-bold">Add Items</h3>
                </div>
                <div className="text-3xl transition-transform group-hover:scale-125 group-hover:rotate-12">
                  ➕
                </div>
              </div>
              <p className="mb-3 text-[0.82rem]">Build your wardrobe by uploading clothing items</p>
              <div className="flex items-center text-[0.75rem] font-medium text-white transition">
                Go now <span className="ml-2 transform group-hover:translate-x-1 transition">→</span>
              </div>
            </div>
          </Link>

          {/* Quick Action: Get Suggestions */}
          <Link to="/outfits" className="group quick-action-card primary flex h-full min-h-[208px] flex-col justify-between">
            <div className="quick-action-inner">
              <div className="mb-2.5 flex items-start justify-between">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">AI Magic</p>
                  <h3 className="text-[1.2rem] font-bold">Get Outfit Ideas</h3>
                </div>
                <div className="text-3xl transition-transform group-hover:scale-125 group-hover:-rotate-12">
                  ✨
                </div>
              </div>
              <p className="mb-3 text-[0.82rem]">Discover personalized outfit combinations powered by AI</p>
              <div className="flex items-center text-[0.75rem] font-medium text-white transition">
                Generate <span className="ml-2 transform group-hover:translate-x-1 transition">→</span>
              </div>
            </div>
          </Link>
          </div>
        </section>

        {/* Features / How It Works */}
        <section>
          <div className="mb-10">
            <div className="inline-block mb-3">
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--accent)]">The Process</span>
            </div>
            <h2 className="mb-2 text-[1.8rem] font-bold text-[var(--ink)]">How OutfitSync Works</h2>
            <p className="max-w-2xl text-[0.9rem] text-slate-600">Get started in three simple steps to unlock your personal style</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: 1,
                title: 'Build Your Closet',
                desc: 'Upload photos and details of your clothing items in one convenient place',
                icon: '📷'
              },
              {
                step: 2,
                title: 'AI Learns Your Style',
                desc: 'Our intelligent system analyzes preferences and creates your style profile',
                icon: '🧠'
              },
              {
                step: 3,
                title: 'Perfect Daily Outfits',
                desc: 'Get weather-aware outfit suggestions that match your unique taste',
                icon: '👗'
              }
            ].map((step) => (
              <div key={step.step} className="feature-card">
                <div className="feature-step-badge">{step.step}</div>
                <div className="mb-3 text-3xl">{step.icon}</div>
                <h4 className="mb-2 text-[1.1rem] font-bold text-[var(--ink)]">{step.title}</h4>
                <p className="text-[0.9rem] leading-relaxed text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="benefit-card left">
              <div className="mb-4 text-4xl">⏱️</div>
              <h3 className="mb-2 text-[1.35rem] font-bold text-[var(--ink)]">Save Time</h3>
              <p className="text-[0.9rem] leading-relaxed text-slate-600">
                Spend less time deciding what to wear and more time looking fabulous. Instant outfit combinations based on your mood and weather.
              </p>
            </div>
            <div className="benefit-card right">
              <div className="mb-4 text-4xl">🎨</div>
              <h3 className="mb-2 text-[1.35rem] font-bold text-[var(--ink)]">Express Style</h3>
              <p className="text-[0.9rem] leading-relaxed text-slate-600">
                Discover your unique fashion identity with AI recommendations tailored to your personal taste and occasions.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="fade-in pb-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--ink)] via-[var(--ink)]/95 to-[var(--ink)]/90 p-8 text-white md:p-12">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent-soft)]/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
            
            <div className="relative z-10 text-center">
              <h3 className="mb-3 text-[1.8rem] font-bold">Ready to Elevate Your Style?</h3>
              <p className="mx-auto mb-7 max-w-xl text-[0.9rem] leading-relaxed text-white/80">
                Join thousands of users who are transforming their wardrobe and simplifying their daily style routine.
              </p>
              <Link to="/wardrobe" className="btn-primary-alt">
                <span>Start Your Journey Today</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
