import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AppShell } from '../layouts/AppShell';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AgentDashboardPage } from '../pages/AgentDashboardPage';
import { StudentDashboardPage } from '../pages/StudentDashboardPage';
import { NotificationDetailsPage } from '../pages/NotificationDetailsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Component that resolves the homepage to the correct dashboard based on user role
function HomeResolver() {
  const { role } = useAuth();
  
  if (role === 'admin') {
    return <AdminDashboardPage />;
  }
  if (role === 'agent') {
    return <AgentDashboardPage />;
  }
  if (role === 'student') {
    return <StudentDashboardPage />;
  }
  
  return <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes wrapped inside AppShell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Dynamic Home dashboard resolver */}
        <Route index element={<HomeResolver />} />
        
        {/* Notification details page */}
        <Route path="notifications/:id" element={<NotificationDetailsPage />} />
        
        {/* Account profile configuration page */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
export default AppRouter;
