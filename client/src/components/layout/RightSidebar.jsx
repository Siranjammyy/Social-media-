import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, Sparkles, ArrowRight, Radio, RefreshCw } from 'lucide-react';
import { newsService } from '../../services/newsService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const RightSidebar = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [whatsHappening, setWhatsHappening] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [newsRes, suggestionsRes] = await Promise.all([
        newsService.getWhatsHappening(),
        user ? userService.getSuggestions(3).catch(() => ({ success: false })) : Promise.resolve({ success: false }),
      ]);

      if (newsRes?.success && newsRes.items) {
        setWhatsHappening(newsRes.items);
      }

      if (suggestionsRes?.success && suggestionsRes.users?.length > 0) {
        setSuggestions(suggestionsRes.users);
      }
    } catch (err) {
      console.error('[RightSidebar Error]:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Listen to socket live news updates
  useEffect(() => {
    if (!socket) return;
    const handleNewsUpdate = () => {
      fetchData();
    };
    socket.on('news_live_update', handleNewsUpdate);
    return () => socket.off('news_live_update', handleNewsUpdate);
  }, [socket]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFollowToggle = async (targetUserId) => {
    try {
      await userService.followUser(targetUserId);
      setSuggestions((prev) => prev.filter((u) => u._id !== targetUserId));
    } catch (err) {
      console.error('[Follow Error]:', err);
    }
  };

  return (
    <aside className="w-80 lg:w-96 hidden xl:flex flex-col gap-4 py-6 px-4 sticky top-0 h-screen overflow-y-auto border-l border-gray-200 dark:border-[#273449]">
      {/* Search Bar Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search Aura, news, #tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-100 dark:bg-[#111827] border border-transparent focus:border-brand-primary rounded-full pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none transition-all"
        />
      </form>

      {/* What's Happening Real-Time News Widget (Like X) */}
      <div className="nexora-card p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
              What's happening
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              fetchData();
            }}
            className="text-gray-400 hover:text-brand-primary transition"
            title="Refresh real-time news"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Real-time items stream */}
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-[#273449]/60">
          {whatsHappening.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/explore?category=${item.id}`)}
              className="py-3 px-1.5 hover:bg-gray-50 dark:hover:bg-[#182235] rounded-xl cursor-pointer transition-colors group"
            >
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  {item.isLive && (
                    <span className="text-rose-500 font-bold uppercase text-[9px]">LIVE</span>
                  )}
                  {item.category}
                </span>
                <span className="text-[10px] text-gray-400">· Trending</span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors leading-snug line-clamp-2 mb-1">
                {item.topic}
              </h4>

              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                <span>{item.postCount}</span>
                <span>•</span>
                <span className="text-brand-primary">#{item.trendingTag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Show more button */}
        <button
          onClick={() => navigate('/explore')}
          className="w-full mt-2 pt-2.5 text-xs font-semibold text-brand-primary hover:text-brand-dark flex items-center justify-between border-t border-gray-100 dark:border-[#273449] transition"
        >
          <span>Show more news</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested People to Follow */}
      {user && suggestions.length > 0 && (
        <div className="nexora-card p-4">
          <div className="flex items-center gap-2 mb-3.5">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Who to follow
            </h4>
          </div>

          <div className="flex flex-col gap-3">
            {suggestions.map((suggestedUser) => (
              <div
                key={suggestedUser._id}
                className="flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => navigate(`/${suggestedUser.username}`)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                >
                  <Avatar
                    src={suggestedUser.avatar}
                    name={suggestedUser.name}
                    size="sm"
                    isVerified={suggestedUser.isVerified}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate hover:underline">
                      {suggestedUser.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      @{suggestedUser.username}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs px-2.5 rounded-full"
                  onClick={() => handleFollowToggle(suggestedUser._id)}
                >
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer links */}
      <div className="px-3 text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="hover:underline cursor-pointer">About</span>
          <span className="hover:underline cursor-pointer">Live Wire</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="hover:underline cursor-pointer">Safety</span>
        </div>
        <p>© 2026 Aura, Inc. Connect Beyond Boundaries.</p>
      </div>
    </aside>
  );
};
