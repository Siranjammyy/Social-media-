import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusSquare, Mail, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNavigation = ({ onOpenCreatePost }) => {
  const { user } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-md border-t border-gray-200 dark:border-[#273449] flex items-center justify-around py-2.5 px-3">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `p-2 rounded-xl transition ${
            isActive ? 'text-brand-primary' : 'text-gray-500 dark:text-gray-400'
          }`
        }
      >
        <Home className="w-6 h-6" />
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `p-2 rounded-xl transition ${
            isActive ? 'text-brand-primary' : 'text-gray-500 dark:text-gray-400'
          }`
        }
      >
        <Compass className="w-6 h-6" />
      </NavLink>

      {user && (
        <button
          onClick={onOpenCreatePost}
          className="w-11 h-11 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-md shadow-brand-primary/30 active:scale-95 transition"
        >
          <PlusSquare className="w-6 h-6" />
        </button>
      )}

      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `p-2 rounded-xl transition ${
            isActive ? 'text-brand-primary' : 'text-gray-500 dark:text-gray-400'
          }`
        }
      >
        <Mail className="w-6 h-6" />
      </NavLink>

      <NavLink
        to={user ? `/${user.username}` : '/login'}
        className={({ isActive }) =>
          `p-2 rounded-xl transition ${
            isActive ? 'text-brand-primary' : 'text-gray-500 dark:text-gray-400'
          }`
        }
      >
        <User className="w-6 h-6" />
      </NavLink>
    </nav>
  );
};
