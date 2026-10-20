import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Zap,
  ShieldCheck,
  Palette,
  Camera,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const DEMO_PROFILES = [
  {
    role: 'admin',
    name: 'Alex Rivera',
    username: 'alexrivera',
    title: 'Platform Administrator',
    badge: '👑 Admin Access',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    icon: ShieldCheck,
    iconColor: 'text-amber-500',
    bio: 'Lead Architect & Admin. Access to Admin Panel, content moderation, analytics, and full permissions.',
    tags: ['Admin Panel', 'System Stats', 'Full Control', 'Verified'],
    targetPath: '/admin',
  },
  {
    role: 'designer',
    name: 'Elena Rostova',
    username: 'elena_codes',
    title: 'UI/UX Lead & Architect',
    badge: '🎨 Designer',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    icon: Palette,
    iconColor: 'text-purple-500',
    bio: 'UI/UX Architect obsessed with dark theme palettes, design tokens, and silky smooth micro-interactions.',
    tags: ['Dark Mode', 'Design Showcase', 'Curated Feed', 'Verified'],
    targetPath: '/home',
  },
  {
    role: 'creator',
    name: 'Marcus Vance',
    username: 'marcus_vance',
    title: 'Visual Creator & Photographer',
    badge: '📸 Pro Creator',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    icon: Camera,
    iconColor: 'text-emerald-500',
    bio: 'Landscape & street photographer capturing moments between seconds. High engagement gallery feed.',
    tags: ['Photo Gallery', 'Bookmarks', 'Direct Messaging'],
    targetPath: '/home',
  },
  {
    role: 'ai',
    name: 'Sophia Chen',
    username: 'sophiatech',
    title: 'AI Researcher & Systems',
    badge: '🧠 AI Engineer',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    icon: Cpu,
    iconColor: 'text-cyan-500',
    bio: 'Distributed systems builder & LLM researcher. Active in live breaking news and technology discussions.',
    tags: ['Breaking News', 'Live Ticker', 'Tech Community', 'Verified'],
    targetPath: '/home',
  },
];

export const DemoAccessModal = ({ isOpen, onClose }) => {
  const { loginAsDemo } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeLoggingRole, setActiveLoggingRole] = useState(null);

  if (!isOpen) return null;

  const handleSelectDemo = async (profile) => {
    try {
      setActiveLoggingRole(profile.role);
      const res = await loginAsDemo(profile.role);
      toast.success(res.message || `Welcome, ${profile.name}! Logged in as Demo User.`);
      onClose();
      navigate(profile.targetPath || '/home', { replace: true });
    } catch (err) {
      console.error('[Demo Login Error]:', err);
      toast.error(err.message || 'Unable to sign in as demo user. Please try again.');
    } finally {
      setActiveLoggingRole(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] rounded-3xl border border-gray-200 dark:border-[#273449] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-gray-100 dark:border-[#273449]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-brand-primary to-brand-accent flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-gray-950 dark:text-white">
                  1-Click Instant Demo Access
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  NO SIGNUP REQUIRED
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Select any persona below to immediately explore Aura with pre-loaded profiles, posts, and full permissions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#182235] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {DEMO_PROFILES.map((profile) => {
            const Icon = profile.icon;
            const isLoggingIn = activeLoggingRole === profile.role;

            return (
              <div
                key={profile.role}
                onClick={() => !isLoggingIn && handleSelectDemo(profile)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isLoggingIn
                    ? 'border-brand-primary ring-2 ring-brand-primary/30 bg-brand-primary/5'
                    : 'border-gray-200/90 dark:border-[#232F45] bg-gray-50/70 dark:bg-[#141E33] hover:border-brand-primary/60 hover:shadow-lg hover:shadow-brand-primary/5 hover:-translate-y-0.5'
                }`}
              >
                <div>
                  {/* Top user bar */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-primary/30"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#0F172A] flex items-center justify-center shadow-xs">
                          <Icon className={`w-3.5 h-3.5 ${profile.iconColor}`} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition">
                            {profile.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400 font-mono">@{profile.username}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${profile.badgeColor}`}
                    >
                      {profile.badge}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                    {profile.bio}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {profile.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-[#1B273F] text-gray-500 dark:text-gray-400 border border-gray-200/60 dark:border-[#293854]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Instant Action CTA */}
                <button
                  type="button"
                  disabled={isLoggingIn}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md group-hover:shadow-brand-primary/25 transition active:scale-[0.98]"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Logging in as {profile.name.split(' ')[0]}...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                      <span>Instant Access as {profile.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#273449] flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Tokens & session headers are automatically issued for full API testing.
          </span>
          <span className="font-mono text-gray-500">Aura v1.0 • Demo Ready</span>
        </div>
      </div>
    </div>
  );
};
