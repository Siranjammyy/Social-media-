import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  Radio,
  Flame,
  Sparkles,
  TrendingUp,
  Cpu,
  Trophy,
  Film,
  Globe,
  RefreshCw,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { newsService } from '../services/newsService';
import { postService } from '../services/postService';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { LiveNewsTicker } from '../components/news/LiveNewsTicker';
import { HeroBreakingNews } from '../components/news/HeroBreakingNews';
import { NewsCard } from '../components/news/NewsCard';
import { NewsDetailModal } from '../components/news/NewsDetailModal';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

const CATEGORY_TABS = [
  { id: 'all', label: 'For You', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'news', label: 'News', icon: Globe },
  { id: 'technology', label: 'Technology', icon: Cpu },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
  { id: 'science', label: 'Science', icon: TrendingUp },
];

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();

  const currentTab = searchParams.get('tab') || 'all';

  const [newsList, setNewsList] = useState([]);
  const [breakingStory, setBreakingStory] = useState(null);
  const [tickerItems, setTickerItems] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  // Selected story for detail modal
  const [selectedStory, setSelectedStory] = useState(null);

  const fetchExploreData = async (cat = currentTab) => {
    setLoading(true);
    setHasNewUpdate(false);
    try {
      const [newsRes, breakingRes, postsRes] = await Promise.all([
        newsService.getNews(cat, 1, 10),
        newsService.getBreakingNews(),
        postService.getFeed(1, 6).catch(() => ({ success: false, posts: [] })),
      ]);

      if (newsRes?.success && newsRes.news) {
        setNewsList(newsRes.news);
      }

      if (breakingRes?.success) {
        setBreakingStory(breakingRes.breaking);
        setTickerItems(breakingRes.ticker || []);
      }

      if (postsRes?.success && postsRes.posts) {
        setCommunityPosts(postsRes.posts);
      }
    } catch (err) {
      console.error('[Explore Load Error]:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExploreData(currentTab);
  }, [currentTab]);

  // Real-time news update listener via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewsUpdate = (data) => {
      setHasNewUpdate(true);
      toast.info('🔴 Live News Update: New breaking stories arrived!');
    };

    socket.on('news_live_update', handleNewsUpdate);
    return () => socket.off('news_live_update', handleNewsUpdate);
  }, [socket, toast]);

  const handleTabChange = (tabId) => {
    setSearchParams(tabId === 'all' ? {} : { tab: tabId });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchExploreData(currentTab);
  };

  const handlePostAboutStory = (story) => {
    setSelectedStory(story);
  };

  return (
    <div className="min-h-screen">
      {/* Explore Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449]">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-primary" />
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
              Explore & Live News
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              REAL-TIME
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-[#182235] transition"
            title="Refresh news stream"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Real-time New Update Alert Pill */}
        {hasNewUpdate && (
          <div className="px-4 pb-2 animate-slide-up">
            <button
              onClick={handleRefresh}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-brand-primary text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>New breaking stories available • Click to refresh</span>
            </button>
          </div>
        )}

        {/* Category Tabs (Like X) */}
        <div className="flex gap-1 overflow-x-auto px-3 scrollbar-none border-t border-gray-100 dark:border-[#273449]/60">
          {CATEGORY_TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 py-3 px-3.5 text-xs font-semibold whitespace-nowrap transition-colors relative ${
                  isActive
                    ? 'text-brand-primary font-bold'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        {/* Real-Time Live News Ticker */}
        <LiveNewsTicker
          items={tickerItems}
          onSelectStory={(item) => {
            const match = newsList.find((n) => n.id === item.id) || item;
            setSelectedStory(match);
          }}
        />

        {/* Hero Breaking News Banner (Visible on 'all' or when available) */}
        {breakingStory && (currentTab === 'all' || currentTab === 'trending') && (
          <HeroBreakingNews
            story={breakingStory}
            onSelectStory={(story) => setSelectedStory(story)}
            onJoinDiscussion={(story) => setSelectedStory(story)}
          />
        )}

        {/* Real-Time News Feed List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              {currentTab === 'all'
                ? 'Latest Live Stories'
                : `${CATEGORY_TABS.find((t) => t.id === currentTab)?.label || 'Live'} News`}
            </h2>

            <span className="text-[11px] text-gray-400 font-mono">
              Live updates enabled
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : newsList.length > 0 ? (
            <div className="space-y-3.5">
              {newsList.map((story) => (
                <NewsCard
                  key={story.id}
                  story={story}
                  onSelectStory={(s) => setSelectedStory(s)}
                  onPostAboutThis={(s) => setSelectedStory(s)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Compass}
              title="No news stories found in this section"
              description="Check back shortly as real-time wire feeds update throughout the hour."
            />
          )}
        </div>

        {/* Community Discussion Posts for This Topic */}
        {communityPosts.length > 0 && (
          <div className="pt-6 border-t border-gray-200 dark:border-[#273449] space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-primary" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Live Community Reactions
              </h3>
            </div>

            <div className="space-y-4">
              {communityPosts.slice(0, 3).map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostUpdated={(updated) =>
                    setCommunityPosts((prev) =>
                      prev.map((p) => (p._id === updated._id ? updated : p))
                    )
                  }
                  onPostDeleted={(id) =>
                    setCommunityPosts((prev) => prev.filter((p) => p._id !== id))
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Story Full Briefing & Quick Discussion Modal */}
      <NewsDetailModal
        isOpen={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        story={selectedStory}
        onPostCreated={(newPost) => {
          setCommunityPosts((prev) => [newPost, ...prev]);
        }}
      />
    </div>
  );
};
