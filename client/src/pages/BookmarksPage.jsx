import React, { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { postService } from '../services/postService';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const BookmarksPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const res = await postService.getBookmarks();
        if (res.success) {
          setPosts(res.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449] p-4 flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-brand-primary" />
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Bookmarks</h1>
      </div>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostUpdated={(updated) =>
                  setPosts((prev) =>
                    prev.map((p) => (p._id === updated._id ? updated : p))
                  )
                }
                onPostDeleted={(id) =>
                  setPosts((prev) => prev.filter((p) => p._id !== id))
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="Save posts for later"
            description="Don't let good ideas slip away! Bookmark posts to easily find them again anytime."
          />
        )}
      </div>
    </div>
  );
};
