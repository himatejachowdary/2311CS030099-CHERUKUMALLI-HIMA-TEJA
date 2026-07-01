import { Link, useParams } from 'react-router-dom';

import { sampleNotifications } from '@/data/notifications';

export function NotificationDetailsPage() {
  const { id } = useParams();
  const notification = sampleNotifications.find((item) => item.id === id);

  if (!notification) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-semibold text-white">Notification not found</h2>
        <p className="mt-3 text-sm text-slate-400">The requested notification is not available in the current dataset.</p>
        <Link className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950" to="/notifications">
          Back to notifications
        </Link>
      </div>
    );
  }

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accentSoft">
          {notification.type}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${notification.isRead ? 'bg-white/10 text-slate-300' : 'bg-accent/15 text-accentSoft'}`}>
          {notification.isRead ? 'Read' : 'Unread'}
        </span>
      </div>
      <h2 className="mt-5 text-3xl font-semibold text-white">{notification.message}</h2>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Priority" value={notification.priority} />
        <InfoCard label="Student ID" value={notification.studentId} />
        <InfoCard label="Created" value={formatDate(notification.createdAt)} />
        <InfoCard label="Updated" value={formatDate(notification.updatedAt)} />
      </dl>
      <Link className="mt-8 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950" to="/notifications">
        Back to notifications
      </Link>
    </article>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-white">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
