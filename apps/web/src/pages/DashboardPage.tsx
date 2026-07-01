import { Link } from 'react-router-dom';

import { sampleNotifications } from '@/data/notifications';

export function DashboardPage() {
  const unreadCount = sampleNotifications.filter((notification) => !notification.isRead).length;
  const placementCount = sampleNotifications.filter((notification) => notification.type === 'Placement').length;
  const resultCount = sampleNotifications.filter((notification) => notification.type === 'Result').length;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow">
          <p className="text-sm uppercase tracking-[0.3em] text-accentSoft/70">Student dashboard</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
            Keep every student notification visible, prioritized, and easy to act on.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            This foundation is ready for notification delivery, search, filters, and read-state management.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accentSoft" to="/notifications">
              View notifications
            </Link>
            <span className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-200">
              API-first architecture
            </span>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Unread" value={String(unreadCount)} description="Notifications awaiting review" />
          <StatCard label="Placement" value={String(placementCount)} description="High-impact career updates" />
          <StatCard label="Results" value={String(resultCount)} description="Academic status notifications" />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-950/55 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Recent notifications</h3>
            <p className="mt-1 text-sm text-slate-400">A seeded list to support the first UI milestone.</p>
          </div>
          <Link className="text-sm font-medium text-accentSoft hover:text-white" to="/notifications">
            Open all
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sampleNotifications.map((notification) => (
            <article key={notification.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accentSoft">
                  {notification.type}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${notification.isRead ? 'bg-white/10 text-slate-300' : 'bg-accent/15 text-accentSoft'}`}>
                  {notification.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-200">{notification.message}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Priority {notification.priority}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </article>
  );
}
