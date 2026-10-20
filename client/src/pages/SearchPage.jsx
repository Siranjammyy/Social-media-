import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Users, FileText, Hash, X, Loader2 } from 'lucide-react';
import { searchService } from '../services/messageService';
import { userService } from '../services/userService';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { PostCard } from '../components/post/PostCard';
import { EmptyState } from '../components/common/EmptyState';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery || (initialTag ? `#${initialTag}` : ''));
  const [activeTab, setActiveTab] = useState(initialTag ? 'posts' : 'all');

  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const executeSearch = async (term) => {
    if (!term.trim()) {
      setUserResults([]);
      setPostResults([]);
      return;
    }

    setLoading(true);
    const isHashtag = term.trim().startsWith('#');
    const cleanTag = isHashtag ? term.trim().slice(1) : null;
    const cleanQuery = term.trim();

    try {
      const [usersRes, postsRes] = await Promise.all([
        !isHashtag ? searchService.searchUsers(cleanQuery) : Promise.resolve({ users: [] }),
        searchService.searchPosts(cleanQuery, cleanTag),
      ]);

      if (usersRes.success) setUserResults(usersRes.users || []);
      if (postsRes.success) setPostResults(postsRes.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTag) {
      executeSearch(`#${initialTag}`);
    } else if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery, initialTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchQuery.startsWith('#')) {
      setSearchParams({ tag: searchQuery.slice(1).trim() });
    } else {
      setSearchParams({ q: searchQuery.trim() });
    }
    executeSearch(searchQuery);
  };

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await userService.unfollowUser(userId);
      } else {
        await userService.followUser(userId);
      }
      setUserResults((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isFollowing: !isCurrentlyFollowing } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449] p-4">
        <form onSubmit={handleSearchSubmit} className="relative mb-3">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search people, posts, or #hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-[#182235] border border-transparent focus:border-brand-primary rounded-full pl-10 pr-10 py-2.5 text-sm text-gray-900 dark:text-white outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setUserResults([]);
                setPostResults([]);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Tabs */}
        <div className="flex border-t border-gray-100 dark:border-[#273449] pt-2">
          {['all', 'people', 'posts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Results Stream */}
      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="p-12 flex justify-center text-brand-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : searchQuery && userResults.length === 0 && postResults.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No results found"
            description={`We couldn't find anything matching "${searchQuery}". Try another keyword or check for spelling mistakes.`}
          />
        ) : (
          <div className="space-y-6">
            {/* People Section */}
            {(activeTab === 'all' || activeTab === 'people') && userResults.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> People
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-[#273449] nexora-card overflow-hidden">
                  {userResults.map((u) => (
                    <div
                      key={u._id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-[#182235] transition"
                    >
                      <div
                        onClick={() => navigate(`/${u.username}`)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <Avatar src={u.avatar} name={u.name} size="md" isVerified={u.isVerified} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {u.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                          {u.bio && (
                            <p className="text-xs text-gray-500 truncate max-w-sm">{u.bio}</p>
                          )}
                        </div>
                      </div>

                      {!u.isSelf && (
                        <Button
                          size="sm"
                          variant={u.isFollowing ? 'secondary' : 'primary'}
                          onClick={() => handleFollowToggle(u._id, u.isFollowing)}
                          className="rounded-full text-xs px-3.5 h-8 shrink-0"
                        >
                          {u.isFollowing ? 'Following' : 'Follow'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Section */}
            {(activeTab === 'all' || activeTab === 'posts') && postResults.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Posts
                </h3>
                <div className="space-y-4">
                  {postResults.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onPostUpdated={(updated) =>
                        setPostResults((prev) =>
                          prev.map((p) => (p._id === updated._id ? updated : p))
                        )
                      }
                      onPostDeleted={(id) =>
                        setPostResults((prev) => prev.filter((p) => p._id !== id))
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
