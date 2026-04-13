import { Link } from 'react-router-dom';

const AuthPageLayout = ({ title, subtitle, children, ctaText, ctaLink, ctaLabel }) => {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card-surface fade-in w-full max-w-md rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">OutfitSync</p>
        <h1 className="mt-2 text-4xl text-[var(--ink)]">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-sm text-slate-600">
          {ctaText}{' '}
          <Link to={ctaLink} className="font-semibold text-[var(--accent)] hover:underline">
            {ctaLabel}
          </Link>
        </p>
      </section>
    </main>
  );
};

export default AuthPageLayout;
