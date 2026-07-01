import { Link } from 'react-router-dom';

import { sampleNotifications } from '@/data/notifications';

export function NotificationsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-accentSoft/70">Notifications</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Notification feed</h2>
        </div>
        <p className="max-w-lg text-sm text-slate-400">
          The next feature slice will replace the seeded feed with API-backed pagination, search, and filters.
        </p>
      </div>

      <div className="grid gap-4">
        {sampleNotifications.map((notification) => (
          <Link
            key={notification.id}
            to={`/notifications/${notification.id}`}
            className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-accent/40 hover:bg-white/10"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accentSoft">
                    {notification.type}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${notification.isRead ? 'bg-white/10 text-slate-300' : 'bg-accent/15 text-accentSoft'}`}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </span>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200">
                    Priority {notification.priority}
                  </span>
                </div>
                <p className="text-base leading-6 text-slate-100">{notification.message}</p>
              </div>
              <span className="text-sm text-slate-400 transition group-hover:text-white">Open details</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
