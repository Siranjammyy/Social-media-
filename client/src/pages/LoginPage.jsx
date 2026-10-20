import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Zap,
  ShieldCheck,
  Palette,
  Camera,
  Cpu,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { DemoAccessModal } from '../components/auth/DemoAccessModal';

export const LoginPage = () => {
  const { login, loginAsDemo } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your email or username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier.trim(), password);
      toast.success('Welcome back to Aura!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    try {
      setDemoLoadingRole(role);
      setErrorMessage('');
      const res = await loginAsDemo(role);
      toast.success(res.message || 'Logged in with Demo Access!');
      navigate(role === 'admin' ? '/admin' : '/home', { replace: true });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Demo login failed. Please try again.'
      );
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FC] dark:bg-[#0B1020]">
      <div className="w-full max-w-lg aura-card p-6 sm:p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-brand-primary via-brand-500 to-brand-accent bg-clip-text text-transparent">
              Aura
            </span>
          </Link>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome back
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Log in to continue your conversations and explore your feed.
          </p>
        </div>

        {/* 1-Click Demo Access Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-brand-primary/10 via-brand-accent/5 to-amber-500/10 border border-brand-primary/20 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                Instant Demo Access
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-3">
            Explore Aura immediately with 1-click mock sessions. No signup or database configuration required:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!!demoLoadingRole}
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 rounded-xl border border-amber-500/30 bg-white/80 dark:bg-[#141E33] hover:border-amber-500 hover:shadow-md transition text-left flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-amber-500/50">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Alex Rivera"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Alex Rivera
                  </p>
                  <span className="text-[9px] text-amber-500 font-black">👑</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  Platform Admin
                </p>
              </div>
              {demoLoadingRole === 'admin' && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 ml-auto shrink-0" />
              )}
            </button>

            <button
              type="button"
              disabled={!!demoLoadingRole}
              onClick={() => handleQuickDemo('designer')}
              className="p-2.5 rounded-xl border border-purple-500/30 bg-white/80 dark:bg-[#141E33] hover:border-purple-500 hover:shadow-md transition text-left flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-purple-500/50">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Elena Rostova"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Elena Rostova
                  </p>
                  <span className="text-[9px] text-purple-500 font-black">🎨</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  UI/UX Lead
                </p>
              </div>
              {demoLoadingRole === 'designer' && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500 ml-auto shrink-0" />
              )}
            </button>

            <button
              type="button"
              disabled={!!demoLoadingRole}
              onClick={() => handleQuickDemo('creator')}
              className="p-2.5 rounded-xl border border-emerald-500/30 bg-white/80 dark:bg-[#141E33] hover:border-emerald-500 hover:shadow-md transition text-left flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-emerald-500/50">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                  alt="Marcus Vance"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Marcus Vance
                  </p>
                  <span className="text-[9px] text-emerald-500 font-black">📸</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  Creator / Media
                </p>
              </div>
              {demoLoadingRole === 'creator' && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 ml-auto shrink-0" />
              )}
            </button>

            <button
              type="button"
              disabled={!!demoLoadingRole}
              onClick={() => handleQuickDemo('ai')}
              className="p-2.5 rounded-xl border border-cyan-500/30 bg-white/80 dark:bg-[#141E33] hover:border-cyan-500 hover:shadow-md transition text-left flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-cyan-500/50">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                  alt="Sophia Chen"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    Sophia Chen
                  </p>
                  <span className="text-[9px] text-cyan-500 font-black">🧠</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                  AI Researcher
                </p>
              </div>
              {demoLoadingRole === 'ai' && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-500 ml-auto shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-gray-200 dark:border-[#273449] w-full" />
          <span className="bg-white dark:bg-[#111827] px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider absolute">
            or log in with credentials
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Username"
            type="text"
            placeholder="e.g. alex@aura.io or alexrivera"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={Mail}
            required
          />

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2 rounded-xl py-3 font-semibold shadow-md shadow-brand-primary/20"
          >
            Log In With Password
          </Button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-primary font-bold hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      {/* Demo Modal */}
      <DemoAccessModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};

