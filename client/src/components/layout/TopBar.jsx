import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, Moon, Sun, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../common/Avatar';

export const TopBar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#0B1020]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#273449]">
      <NavLink to="/home" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
          Aura
        </span>
      </NavLink>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {user && (
          <NavLink to="/notifications" className="p-2 rounded-xl text-gray-500 dark:text-gray-400">
            <Bell className="w-5 h-5" />
          </NavLink>
        )}

        {user && (
          <NavLink to={`/${user.username}`}>
            <Avatar src={user.avatar} name={user.name} size="sm" isVerified={user.isVerified} />
          </NavLink>
        )}
      </div>
    </header>
  );
};
