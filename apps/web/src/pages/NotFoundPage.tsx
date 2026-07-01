import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-accentSoft/70">404</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">Page not found</h2>
      <p className="mt-4 text-sm text-slate-400">The route you requested does not exist.</p>
      <Link className="mt-8 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950" to="/">
        Return home
      </Link>
    </div>
  );
}
