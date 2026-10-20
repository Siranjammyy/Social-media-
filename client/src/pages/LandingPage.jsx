import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Shield,
  MessageSquare,
  Users,
  Compass,
  Zap,
  Globe,
  CheckCircle2,
  Heart,
  Share2,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { DemoAccessModal } from '../components/auth/DemoAccessModal';

export const LandingPage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const features = [
    {
      icon: Sparkles,
      title: 'Share Your Moments',
      description: 'Publish expressive posts, share high-res photos, and format ideas with hashtags and user mentions effortlessly.',
    },
    {
      icon: Users,
      title: 'Discover Inspiring Communities',
      description: 'Find creators, developers, designers, and thinkers who match your passions and expand your horizon.',
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Conversations',
      description: 'Instant peer-to-peer messaging with typing indicators, delivery status, and multimedia sharing.',
    },
    {
      icon: Compass,
      title: 'Personalized Feeds',
      description: 'Switch between smart curated feeds, chronological latest updates, or accounts you specifically follow.',
    },
    {
      icon: Shield,
      title: 'Privacy & Granular Control',
      description: 'Control who sees your posts, toggle public or private profile visibility, and protect your digital space.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast Experience',
      description: 'Engineered for smooth performance with dark mode, optimistic updates, and instant responsiveness.',
    },
  ];

  const faqs = [
    {
      q: 'What is Aura?',
      a: 'Aura is a modern full-stack social networking platform designed for meaningful connection, creator discovery, and community engagement.',
    },
    {
      q: 'Is Aura free to use?',
      a: 'Yes, Aura is completely free to create an account, publish content, explore topics, and message friends.',
    },
    {
      q: 'How does account privacy work?',
      a: 'You can choose between a public profile or a private account where only approved followers can view your feed and posts.',
    },
    {
      q: 'Can I upload photos and videos?',
      a: 'Yes! Aura supports image galleries, video attachments, and custom cover images for your personal profile.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-md shadow-brand-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-primary via-brand-500 to-brand-accent bg-clip-text text-transparent">
              Aura
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-brand-primary transition">Features</a>
            <a href="#how-it-works" className="hover:text-brand-primary transition">How It Works</a>
            <a href="#faqs" className="hover:text-brand-primary transition">FAQs</a>
            <Link to="/explore" className="hover:text-brand-primary transition">Explore</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Instant Demo</span>
            </button>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" className="rounded-full px-4">
                Join Aura
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-primary/15 dark:bg-brand-primary/25 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Connect Beyond Boundaries
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-950 dark:text-white leading-[1.15]">
            Your World. Your People.{' '}
            <span className="bg-gradient-to-r from-brand-primary via-brand-500 to-brand-accent bg-clip-text text-transparent">
              Your Aura.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover new perspectives, share your moments, publish your creative thoughts, and connect with people who inspire you in a next-generation social space.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-amber-500 via-brand-primary to-brand-accent text-white font-bold text-sm shadow-xl shadow-brand-primary/25 hover:opacity-95 transition active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current text-amber-300" />
              <span>⚡ Try 1-Click Demo</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto rounded-full px-7">
                <span>Join Aura</span>
              </Button>
            </Link>
            <Link to="/explore" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto rounded-full px-6">
                Explore Community
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="relative mt-14 max-w-4xl mx-auto rounded-2xl border border-gray-200 dark:border-[#273449] bg-white dark:bg-[#111827] shadow-2xl overflow-hidden p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#273449] mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-400 font-mono ml-2">aura.io/home</span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold">
                For You
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full text-gray-400 font-medium">
                Following
              </span>
            </div>
          </div>

          {/* Sample Card */}
          <div className="aura-card p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-sm">
                AR
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  Alex Rivera
                  <span className="bg-brand-primary text-white text-[9px] px-1 rounded-full">✓</span>
                </p>
                <p className="text-xs text-gray-400">@alexrivera • 2m ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
              Thrilled to unveil Aura! 🚀 Connect beyond boundaries with a vibrant, modern social space engineered for creators, builders, and dreamers. What would you like to see next? <span className="text-brand-primary font-semibold">#aura</span> <span className="text-brand-primary font-semibold">#webdev</span>
            </p>
            <div className="flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-[#273449] text-xs text-gray-500">
              <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <Heart className="w-4 h-4 fill-current" /> 142
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> 28
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 className="w-4 h-4" /> Share
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white">
            Designed for the Next Era of Social
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Everything you need to share, build your audience, and communicate freely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="aura-card p-6 sm:p-8 hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary flex items-center justify-center mb-5">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-gray-100/60 dark:bg-[#111827]/50 border-y border-gray-200 dark:border-[#273449]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white">
              Getting Started in Minutes
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Follow these simple steps to join the Aura network.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your username and email.' },
              { step: '02', title: 'Set Up Profile', desc: 'Choose an avatar, short bio, and interests.' },
              { step: '03', title: 'Find People', desc: 'Follow inspiring creators and discover tags.' },
              { step: '04', title: 'Connect & Share', desc: 'Post moments, interact, and chat in real time.' },
            ].map((s, idx) => (
              <div key={idx} className="aura-card p-6 relative">
                <span className="text-4xl font-extrabold text-brand-primary/20 block mb-2 font-mono">
                  {s.step}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                  {s.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-14 space-y-2">
          <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-500">Everything you want to know about Aura.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="aura-card p-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                {faq.q}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-tr from-brand-primary via-brand-500 to-brand-accent p-10 sm:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Connect Beyond Boundaries?
            </h2>
            <p className="text-base text-white/90 max-w-xl mx-auto leading-relaxed">
              Join thousands of creators, developers, and thinkers sharing ideas today.
            </p>
            <div className="pt-2">
              <Link to="/register">
                <button className="bg-white text-brand-primary font-bold px-8 py-3.5 rounded-full shadow-lg hover:bg-gray-100 transition active:scale-95">
                  Create Your Free Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#273449] py-10 px-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>© 2026 Aura. Connect Beyond Boundaries. All rights reserved.</p>
      </footer>

      {/* Demo Modal */}
      <DemoAccessModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
};
