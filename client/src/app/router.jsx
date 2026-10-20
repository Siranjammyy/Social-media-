import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/layout/AppShell';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { OnboardingPage } from '../pages/OnboardingPage';

import { HomePage } from '../pages/HomePage';
import { ExplorePage } from '../pages/ExplorePage';
import { SearchPage } from '../pages/SearchPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { MessagesPage } from '../pages/MessagesPage';
import { BookmarksPage } from '../pages/BookmarksPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AdminPage } from '../pages/AdminPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Route guard for authenticated routes
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] dark:bg-[#0B1020]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Route guard for public-only auth routes (e.g. login/register when already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return children;
};

export const router = createBrowserRouter([
  // Public Landing & Auth pages
  {
    path: '/',
    element: (
      <PublicOnlyRoute>
        <LandingPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },

  // Main Social App Routes (under AppShell layout)
  {
    element: <AppShell />,
    children: [
      {
        path: '/home',
        element: <HomePage />,
      },
      {
        path: '/explore',
        element: <ExplorePage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/notifications',
            element: <NotificationsPage />,
          },
          {
            path: '/messages',
            element: <MessagesPage />,
          },
          {
            path: '/bookmarks',
            element: <BookmarksPage />,
          },
          {
            path: '/settings',
            element: <SettingsPage />,
          },
          {
            path: '/admin',
            element: <AdminPage />,
          },
        ],
      },
      {
        path: '/:username',
        element: <ProfilePage />,
      },
      {
        path: '/posts/:id',
        element: <HomePage />, // Opens feed focused on post
      },
    ],
  },

  // 404 Fallback
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
