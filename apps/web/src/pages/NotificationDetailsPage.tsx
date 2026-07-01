import { Link, useParams } from 'react-router-dom';

import { sampleNotifications } from '@/data/notifications';

export function NotificationDetailsPage() {
  const { id } = useParams();
  const notification = sampleNotifications.find((item) => item.id === id);

  if (!notification) {
    return (
      <div className="border border-gray-300 bg-gray-50 p-8">
        <h2 className="text-2xl font-semibold text-gray-900">Notification not found</h2>
        <p className="mt-3 text-sm text-gray-600">The requested notification is not available in the current dataset.</p>
        <Link className="mt-6 inline-flex bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700" to="/notifications">
          Back to notifications
        </Link>
      </div>
    );
  }

  return (
    <article className="border border-gray-300 bg-gray-50 p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
          {notification.type}
        </span>
        <span className={`px-3 py-1 text-xs font-semibold ${notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
          {notification.isRead ? 'Read' : 'Unread'}
        </span>
      </div>
      <h2 className="mt-5 text-3xl font-semibold text-gray-900">{notification.message}</h2>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Priority" value={notification.priority} />
        <InfoCard label="Student ID" value={notification.studentId} />
        <InfoCard label="Created" value={formatDate(notification.createdAt)} />
        <InfoCard label="Updated" value={formatDate(notification.updatedAt)} />
      </dl>
      <Link className="mt-8 inline-flex bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700" to="/notifications">
        Back to notifications
      </Link>
    </article>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-300 bg-white p-4">
      <dt className="text-xs text-gray-600">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
