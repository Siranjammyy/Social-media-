import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Search,
  Bell,
  Mail,
  Bookmark,
  User as UserIcon,
  Settings,
  ShieldAlert,
  PlusSquare,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { DemoAccessModal } from '../auth/DemoAccessModal';

export const Sidebar = ({ onOpenCreatePost, unreadNotifications = 0, unreadMessages = 0 }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const navLinks = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Compass },
    { to: '/search', label: 'Search', icon: Search },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    {
      to: '/messages',
      label: 'Messages',
      icon: Mail,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { to: user ? `/${user.username}` : '/login', label: 'Profile', icon: UserIcon },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Admin', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 lg:w-72 hidden md:flex flex-col justify-between h-screen sticky top-0 py-6 px-4 border-r border-gray-200 dark:border-[#273449] select-none bg-white/70 dark:bg-[#0B1020]/90 backdrop-blur-md">
      {/* Top Brand Logo & Nav */}
      <div className="flex flex-col gap-6">
        <NavLink
          to={user ? '/home' : '/'}
          className="flex items-center gap-3 px-3 py-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-primary via-brand-500 to-brand-accent bg-clip-text text-transparent">
              Aura
            </span>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              CONNECT BEYOND
            </p>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182235]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <item.icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white text-brand-primary'
                          : 'bg-brand-primary text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Create Post Button */}
        {user && (
          <Button
            onClick={onOpenCreatePost}
            icon={PlusSquare}
            className="w-full mt-2 shadow-lg shadow-brand-primary/25"
            size="lg"
          >
            Create Post
          </Button>
        )}
      </div>

      {/* Bottom Profile & Theme Actions */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-[#273449]">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182235] transition"
        >
          <div className="flex items-center gap-3">
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-brand-primary" />
            )}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {isDark ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Instant Demo Switcher / Launcher */}
        <button
          type="button"
          onClick={() => setIsDemoModalOpen(true)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 transition group"
        >
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 fill-current text-amber-500 group-hover:scale-110 transition-transform" />
            <span>{user ? 'Switch Demo Persona' : 'Instant Demo Access'}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
            1-Click
          </span>
        </button>

        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-[#273449]">
            <div
              onClick={() => navigate(`/${user.username}`)}
              className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 mr-2"
            >
              <Avatar src={user.avatar} name={user.name} size="sm" isVerified={user.isVerified} />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-[11px] truncate text-gray-500 dark:text-gray-400">
                  @{user.username}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>

      {/* Demo Modal */}
      <DemoAccessModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </aside>
  );
};
