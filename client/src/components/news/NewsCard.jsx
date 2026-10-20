import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Share2, ArrowUpRight, Flame } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const NewsCard = ({ story, onSelectStory, onPostAboutThis }) => {
  const { toast } = useToast();

  const timeAgo = story.publishedAt
    ? formatDistanceToNow(new Date(story.publishedAt), { addSuffix: true })
    : 'just now';

  const handleCopyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `${window.location.origin}/explore?story=${story.id}`
    );
    toast.success('News link copied to clipboard!');
  };

  return (
    <article
      onClick={() => onSelectStory && onSelectStory(story)}
      className="nexora-card p-4 sm:p-5 hover:border-brand-primary/40 cursor-pointer group transition-all duration-200"
    >
      <div className="flex gap-4">
        {/* Left Information */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Header Metadata */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap text-xs">
              {story.isLive && (
                <span className="inline-flex items-center gap-1 text-rose-500 font-bold uppercase tracking-wide text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  LIVE
                </span>
              )}

              <span className="font-semibold text-gray-500 dark:text-gray-400">
                {story.categoryLabel || 'News'}
              </span>

              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{timeAgo}</span>

              <span className="text-gray-400">•</span>
              <span className="text-brand-primary font-mono font-medium">
                #{story.trendingTag}
              </span>
            </div>

            {/* Headline */}
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors leading-snug line-clamp-2 mb-1.5">
              {story.headline}
            </h3>

            {/* Summary */}
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-3">
              {story.summary}
            </p>
          </div>

          {/* Footer stats & actions */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-[#273449]">
            <div className="flex items-center gap-2 font-medium">
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {story.source}
              </span>
              <span>•</span>
              <span className="font-mono text-[11px]">
                {(story.postCount / 1000).toFixed(1)}K posts
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPostAboutThis) onPostAboutThis(story);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 transition"
                title="Post about this story"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Post</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
                title="Share story link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Thumbnail Image */}
        {story.image && (
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-[#273449]/50">
            <img
              src={story.image}
              alt={story.headline}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </article>
  );
};
