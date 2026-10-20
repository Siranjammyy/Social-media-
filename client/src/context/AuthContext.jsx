import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const CLIENT_DEMO_USERS = {
  admin: {
    _id: '65d21a000000000000000001',
    name: 'Alex Rivera',
    username: 'alexrivera',
    normalizedUsername: 'alexrivera',
    email: 'alex@aura.io',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    bio: 'Lead Architect & Platform Administrator at Aura. Building next-generation social tools.',
    website: 'https://alexrivera.dev',
    location: 'San Francisco, CA',
    isVerified: true,
    onboardingCompleted: true,
    followersCount: 4820,
    followingCount: 340,
    postsCount: 42,
    accountVisibility: 'public',
  },
  designer: {
    _id: '65d21a000000000000000002',
    name: 'Elena Rostova',
    username: 'elena_codes',
    normalizedUsername: 'elena_codes',
    email: 'elena@aura.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    bio: 'UI/UX Architect & Creative Technologist. Obsessed with dark mode palettes and micro-interactions.',
    website: 'https://elenarostova.design',
    location: 'Berlin, Germany',
    isVerified: true,
    onboardingCompleted: true,
    followersCount: 2950,
    followingCount: 180,
    postsCount: 28,
    accountVisibility: 'public',
  },
  creator: {
    _id: '65d21a000000000000000003',
    name: 'Marcus Vance',
    username: 'marcus_vance',
    normalizedUsername: 'marcus_vance',
    email: 'marcus@aura.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bio: 'Landscape & Street Photographer. Capturing moments between seconds. Canon EOS R5 explorer.',
    website: 'https://marcusvance.photo',
    location: 'Seattle, WA',
    isVerified: false,
    onboardingCompleted: true,
    followersCount: 1410,
    followingCount: 220,
    postsCount: 19,
    accountVisibility: 'public',
  },
  ai: {
    _id: '65d21a000000000000000004',
    name: 'Sophia Chen',
    username: 'sophiatech',
    normalizedUsername: 'sophiatech',
    email: 'sophia@aura.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    bio: 'AI researcher and distributed systems builder. Exploring LLMs, agentic workflows, and human-computer symbiosis.',
    website: 'https://sophiachen.ai',
    location: 'Austin, TX',
    isVerified: true,
    onboardingCompleted: true,
    followersCount: 3820,
    followingCount: 410,
    postsCount: 35,
    accountVisibility: 'public',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aura_token') || localStorage.getItem('nexora_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('aura_token') || localStorage.getItem('nexora_token');
      const storedUser = localStorage.getItem('aura_user') || localStorage.getItem('nexora_user');

      if (storedToken) {
        if (storedToken.startsWith('demo-session-') && storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setLoading(false);
            return;
          } catch (e) {}
        }

        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('aura_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (error) {
          console.error('[Auth Init Error]:', error);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await authService.login({ identifier, password });
    if (res.success && res.token && res.user) {
      localStorage.setItem('aura_token', res.token);
      localStorage.setItem('aura_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token && res.user) {
      localStorage.setItem('aura_token', res.token);
      localStorage.setItem('aura_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const loginAsDemo = async (role = 'admin') => {
    try {
      const res = await authService.demoLogin(role);
      if (res.success && res.token && res.user) {
        localStorage.setItem('aura_token', res.token);
        localStorage.setItem('aura_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      console.warn('[Demo Login API Error, activating instant client session]:', err);
    }

    // High reliability client-side demo fallback
    const fallbackUser = CLIENT_DEMO_USERS[role?.toLowerCase()] || CLIENT_DEMO_USERS.admin;
    const fallbackToken = 'demo-session-' + Date.now();
    localStorage.setItem('aura_token', fallbackToken);
    localStorage.setItem('aura_user', JSON.stringify(fallbackUser));
    setToken(fallbackToken);
    setUser(fallbackUser);

    return {
      success: true,
      message: `Welcome, ${fallbackUser.name}! You are logged in with Demo Access (${fallbackUser.role.toUpperCase()}).`,
      token: fallbackToken,
      user: fallbackUser,
      isDemo: true,
    };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem('aura_token');
      localStorage.removeItem('nexora_token');
      localStorage.removeItem('aura_user');
      localStorage.removeItem('nexora_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
