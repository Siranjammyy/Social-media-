import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Clock,
  RefreshCw,
  MessageSquare,
  Radio,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postService } from '../services/postService';
import { newsService } from '../services/newsService';
import { PostComposer } from '../components/post/PostComposer';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { LiveNewsTicker } from '../components/news/LiveNewsTicker';
import { NewsCard } from '../components/news/NewsCard';
import { NewsDetailModal } from '../components/news/NewsDetailModal';

export const HomePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const outletContext = useOutletContext();

  const [filter, setFilter] = useState('for-you'); // 'for-you' | 'following' | 'latest' | 'live-news'
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time news state
  const [tickerItems, setTickerItems] = useState([]);
  const [newsStories, setNewsStories] = useState([]);
  const [selectedNewsStory, setSelectedNewsStory] = useState(null);
  const [isDbOffline, setIsDbOffline] = useState(false);

  // Fetch breaking news ticker
  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const res = await newsService.getBreakingNews();
        if (res?.success && res.ticker) {
          setTickerItems(res.ticker);
        }
      } catch (e) {
        // Silently catch
      }
    };
    fetchBreaking();
  }, []);

  const fetchFeed = async (activeFilter, pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      if (activeFilter === 'live-news') {
        const newsRes = await newsService.getNews('all', pageNum, 10);
        if (newsRes.success) {
          setNewsStories(newsRes.news);
          setIsDbOffline(false);
        }
      } else {
        let res;
        if (activeFilter === 'following') {
          res = await postService.getFollowingFeed(pageNum, 10);
        } else if (activeFilter === 'latest') {
          res = await postService.getLatestFeed(pageNum, 10);
        } else {
          res = await postService.getFeed(pageNum, 10);
        }

        if (res.success) {
          setIsDbOffline(false);
          if (append) {
            setPosts((prev) => [...prev, ...res.posts]);
          } else {
            setPosts(res.posts);
          }
          setHasMore(res.pagination?.hasMore || false);
          setPage(pageNum);
        }
      }
    } catch (err) {
      if (err.response?.status === 503 || err.response?.data?.isDbOffline) {
        setIsDbOffline(true);
      }
      // If DB is offline, provide real-time news fallback
      const fallbackNews = await newsService.getNews('all', 1, 10);
      if (fallbackNews?.success) {
        setNewsStories(fallbackNews.news);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed(filter, 1, false);
  }, [filter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFeed(filter, 1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(filter, page + 1, true);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="min-h-screen">
      {/* Feed Header & Filters Sticky Tab Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#273449]">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Home</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold">
              <Radio className="w-3 h-3 text-rose-500 animate-pulse" /> Live Feed
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-primary hover:bg-gray-100 dark:hover:bg-[#182235] transition"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters: For You, Following, Latest, Live News (Like X) */}
        <div className="flex border-b border-gray-100 dark:border-[#273449]">
          <button
            onClick={() => setFilter('for-you')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold text-center transition-colors relative flex items-center justify-center gap-1.5 ${
              filter === 'for-you'
                ? 'text-brand-primary font-bold'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>For You</span>
            {filter === 'for-you' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>

          {user && (
            <button
              onClick={() => setFilter('following')}
              className={`flex-1 py-3 text-xs sm:text-sm font-semibold text-center transition-colors relative flex items-center justify-center gap-1.5 ${
                filter === 'following'
                  ? 'text-brand-primary font-bold'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Following</span>
              {filter === 'following' && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-primary rounded-full" />
              )}
            </button>
          )}

          <button
            onClick={() => setFilter('latest')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold text-center transition-colors relative flex items-center justify-center gap-1.5 ${
              filter === 'latest'
                ? 'text-brand-primary font-bold'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Latest</span>
            {filter === 'latest' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>

          <button
            onClick={() => setFilter('live-news')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold text-center transition-colors relative flex items-center justify-center gap-1.5 ${
              filter === 'live-news'
                ? 'text-brand-primary font-bold'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Live News</span>
            {filter === 'live-news' && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Real-Time Breaking News Ticker on Home */}
        <LiveNewsTicker
          items={tickerItems}
          onSelectStory={(item) => {
            const match = newsStories.find((n) => n.id === item.id) || item;
            setSelectedNewsStory(match);
          }}
        />

        {/* Database Guidance Banner if local MongoDB is offline */}
        {isDbOffline && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Database Setup Notice: </span>
              MongoDB server is not running locally. Real-time news and feeds remain fully live. To persist social posts, configure your MongoDB Atlas string in <code className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">server/.env</code> or start local MongoDB.
            </div>
          </div>
        )}

        {/* Post Composer at top of home feed */}
        <PostComposer onPostCreated={handlePostCreated} />

        {/* Live News Tab Stream */}
        {filter === 'live-news' ? (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                Breaking Wire Headlines
              </h3>
              <button
                onClick={() => navigate('/explore')}
                className="text-xs text-brand-primary font-semibold hover:underline"
              >
                View all categories →
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : (
              newsStories.map((story) => (
                <NewsCard
                  key={story.id}
                  story={story}
                  onSelectStory={(s) => setSelectedNewsStory(s)}
                  onPostAboutThis={(s) => setSelectedNewsStory(s)}
                />
              ))
            )}
          </div>
        ) : (
          /* Standard Social Feed Posts */
          loading ? (
            <div className="space-y-4">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostUpdated={handlePostUpdated}
                  onPostDeleted={handlePostDeleted}
                />
              ))}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLoadMore}
                    isLoading={loadingMore}
                    className="rounded-full px-6 text-xs"
                  >
                    Load More Posts
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState
                icon={MessageSquare}
                title={
                  filter === 'following'
                    ? 'Your following feed is quiet'
                    : 'Be the first to publish a moment'
                }
                description={
                  filter === 'following'
                    ? 'Follow inspiring creators or explore real-time news to join current discussions.'
                    : 'Share your ideas or comment on real-time news stories.'
                }
                actionText="Explore Live News"
                onAction={() => setFilter('live-news')}
              />

              {/* Show live news below empty state for instant interaction */}
              {newsStories.length > 0 && (
                <div className="pt-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Trending Live Right Now
                  </h3>
                  {newsStories.slice(0, 3).map((story) => (
                    <NewsCard
                      key={story.id}
                      story={story}
                      onSelectStory={(s) => setSelectedNewsStory(s)}
                      onPostAboutThis={(s) => setSelectedNewsStory(s)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Story Detail & Discussion Modal */}
      <NewsDetailModal
        isOpen={!!selectedNewsStory}
        onClose={() => setSelectedNewsStory(null)}
        story={selectedNewsStory}
        onPostCreated={(newPost) => {
          setPosts((prev) => [newPost, ...prev]);
        }}
      />
    </div>
  );
};
