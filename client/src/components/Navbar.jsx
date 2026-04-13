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
    <header className="sticky top-0 z-10 border-b border-slate-800/10 bg-[rgba(246,242,233,0.86)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-600">OutfitSync</p>
          <h1 className="text-2xl leading-none text-[var(--ink)]">Wardrobe AI</h1>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-[var(--ink)] text-white'
                    : 'bg-white/65 text-slate-700 hover:bg-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-600 md:inline">{auth.user?.email}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
