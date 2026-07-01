import type { ReactNode } from 'react';

import { NavLink } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#111827_100%)] text-slate-100">
      <header className="border-b border-white/10 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.35em] text-accentSoft/80">Campus Notifications</p>
            <h1 className="mt-1 text-lg font-semibold text-white">Management System</h1>
          </div>
          <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
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
    'rounded-full px-4 py-2 transition-colors duration-200',
    isActive ? 'bg-accent text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
  ].join(' ');
}
