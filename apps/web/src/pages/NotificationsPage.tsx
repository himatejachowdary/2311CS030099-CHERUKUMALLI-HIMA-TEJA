import { Link } from 'react-router-dom';

import { sampleNotifications } from '@/data/notifications';

export function NotificationsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-gray-600">Notifications</p>
          <h2 className="mt-2 text-3xl font-semibold text-gray-900">Notification feed</h2>
        </div>
        <p className="max-w-lg text-sm text-gray-600">
          The next feature slice will replace the seeded feed with API-backed pagination, search, and filters.
        </p>
      </div>

      <div className="grid gap-4">
        {sampleNotifications.map((notification) => (
          <Link
            key={notification.id}
            to={`/notifications/${notification.id}`}
            className="group border border-gray-300 bg-white p-5 transition hover:border-gray-400 hover:bg-gray-50"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                    {notification.type}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold ${notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </span>
                  <span className="bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                    Priority {notification.priority}
                  </span>
                </div>
                <p className="text-base leading-6 text-gray-800">{notification.message}</p>
              </div>
              <span className="text-sm text-gray-500 transition group-hover:text-gray-700">Open details</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
