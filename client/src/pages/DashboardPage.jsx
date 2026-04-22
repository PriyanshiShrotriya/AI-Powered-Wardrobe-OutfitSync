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
    <div className="min-h-screen bg-gradient-to-br from-[var(--base-bg)] via-[var(--card)] to-[var(--base-bg)]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-16 md:px-8">
        {/* Hero Section with Enhanced Visual Appeal */}
        <section className="fade-in mb-16">
          <div className="relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--accent-soft)]/20 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[var(--accent)]/10 rounded-full blur-3xl opacity-40"></div>
            
            <div className="relative z-10">
              <div className="inline-block mb-4">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--accent)] bg-[var(--accent-soft)]/40 px-4 py-2 rounded-full">
                  ✨ Welcome to Your Personal Stylist
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-[var(--ink)] leading-tight mb-4 tracking-tight">
                Your <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/60 bg-clip-text text-transparent">Perfect</span> Style Awaits
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-medium">
                Unlock your unique fashion sense with AI-powered outfit recommendations. Smart styling, simplified.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
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
        <div className="grid gap-6 lg:gap-8 md:grid-cols-3 mb-16">
          {/* Wardrobe Stats Card */}
          <div className="group stat-card">
            <div className="stat-card-inner">
              <div className="stat-icon-wrapper">
                <span className="stat-icon">👔</span>
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Total Items</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-bold text-[var(--ink)]">
                    {isLoading ? <span className="animate-pulse">...</span> : itemCount}
                  </h3>
                  <span className="text-sm text-slate-600">pieces</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--accent-soft)] to-[var(--accent)]/10 flex items-center justify-center text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                ✓
              </div>
            </div>
            <div className="mt-4 h-1 bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </div>

          {/* Quick Action: Add Items */}
          <Link to="/wardrobe" className="group quick-action-card accent">
            <div className="quick-action-inner">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">Quick Action</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">Add Items</h3>
                </div>
                <div className="text-4xl transform group-hover:scale-125 group-hover:rotate-12 transition-transform">
                  ➕
                </div>
              </div>
              <p className="text-sm text-slate-800 mb-4">Build your wardrobe by uploading clothing items</p>
              <div className="flex items-center text-[var(--ink)] text-sm font-medium group-hover:text-[var(--accent)] transition">
                Go now <span className="ml-2 transform group-hover:translate-x-1 transition">→</span>
              </div>
            </div>
          </Link>

          {/* Quick Action: Get Suggestions */}
          <Link to="/outfits" className="group quick-action-card primary">
            <div className="quick-action-inner">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-700 font-bold mb-1">AI Magic</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-[var(--ink)]">Get Outfit Ideas</h3>
                </div>
                <div className="text-4xl transform group-hover:scale-125 group-hover:-rotate-12 transition-transform">
                  ✨
                </div>
              </div>
              <p className="text-sm text-slate-800 mb-4">Discover personalized outfit combinations powered by AI</p>
              <div className="flex items-center text-[var(--ink)] text-sm font-medium group-hover:text-[var(--accent)] transition">
                Generate <span className="ml-2 transform group-hover:translate-x-1 transition">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features / How It Works */}
        <section className="mb-16">
          <div className="mb-10">
            <div className="inline-block mb-3">
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-[var(--accent)]">The Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--ink)] mb-2">How OutfitSync Works</h2>
            <p className="text-slate-600 text-lg max-w-2xl">Get started in three simple steps to unlock your personal style</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
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
                <div className="text-4xl mb-4">{step.icon}</div>
                <h4 className="text-xl font-bold text-[var(--ink)] mb-2">{step.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="benefit-card left">
              <div className="text-5xl mb-6">⏱️</div>
              <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">Save Time</h3>
              <p className="text-slate-600 leading-relaxed">
                Spend less time deciding what to wear and more time looking fabulous. Instant outfit combinations based on your mood and weather.
              </p>
            </div>
            <div className="benefit-card right">
              <div className="text-5xl mb-6">🎨</div>
              <h3 className="text-2xl font-bold text-[var(--ink)] mb-3">Express Style</h3>
              <p className="text-slate-600 leading-relaxed">
                Discover your unique fashion identity with AI recommendations tailored to your personal taste and occasions.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="fade-in">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-16 bg-gradient-to-br from-[var(--ink)] via-[var(--ink)]/95 to-[var(--ink)]/90 text-white">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent-soft)]/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
            
            <div className="relative z-10 text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-4">Ready to Elevate Your Style?</h3>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
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
