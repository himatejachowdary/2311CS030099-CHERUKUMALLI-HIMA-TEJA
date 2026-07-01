import type { ReactNode } from 'react';

import { NavLink } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-gray-600">Campus Notifications</p>
            <h1 className="mt-1 text-lg font-semibold text-gray-900">Management System</h1>
          </div>
          <nav className="flex items-center gap-2 border border-gray-200 bg-gray-50 p-1 text-sm">
            <NavLink className={({ isActive }) => linkClassName(isActive)} to="/">
              Dashboard
            </NavLink>
            <NavLink className={({ isActive }) => linkClassName(isActive)} to="/notifications">
              Notifications
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function linkClassName(isActive: boolean) {
  return [
    'px-4 py-2 transition-colors duration-200',
    isActive ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:text-gray-900'
  ].join(' ');
}
