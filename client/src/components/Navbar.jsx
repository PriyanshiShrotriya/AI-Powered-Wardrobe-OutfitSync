import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/wardrobe', label: 'Wardrobe' },
  { to: '/outfits', label: 'Outfit Suggestions' },
];

const Navbar = () => {
  const location = useLocation();
  const { auth, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(245,241,232,0.84)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2.5 px-6 py-2 md:flex-nowrap md:px-8 md:py-1.5">
        <div className="min-w-[170px]">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">OutfitSync</p>
          <h1 className="text-lg leading-none text-[var(--ink)]">Studio</h1>
        </div>
        <nav className="order-3 flex w-full items-center gap-1.5 overflow-x-auto pb-1 md:order-2 md:w-auto md:justify-center md:pb-0">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? 'bg-[var(--ink)] text-white shadow-md shadow-[rgba(24,39,59,0.22)]'
                    : 'bg-white/70 text-slate-700 hover:bg-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="order-2 flex items-center gap-1.5 md:order-3">
          <span className="hidden rounded-full border border-[var(--line)] bg-white/75 px-2 py-1 text-[10px] text-slate-600 md:inline">
            {auth.user?.email}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-medium text-white shadow-md shadow-[rgba(24,111,101,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
