import { Link } from 'react-router-dom';

const AuthPageLayout = ({ title, subtitle, children, ctaText, ctaLink, ctaLabel }) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-[var(--accent-soft)]/55 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" aria-hidden="true" />
      <section className="card-surface fade-in relative w-full max-w-md rounded-3xl p-8 md:p-10">
        <span className="premium-pill">OutfitSync</span>
        <h1 className="mt-4 text-4xl text-[var(--ink)] md:text-[2.8rem]">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 border-t border-[var(--line)] pt-4 text-sm text-slate-600">
          {ctaText}{' '}
          <Link to={ctaLink} className="font-semibold text-[var(--accent-strong)] hover:underline">
            {ctaLabel}
          </Link>
        </p>
      </section>
    </main>
  );
};

export default AuthPageLayout;
