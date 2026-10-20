import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Flame, MessageSquare, ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const HeroBreakingNews = ({ story, onSelectStory, onJoinDiscussion }) => {
  if (!story) return null;

  const timeAgo = story.publishedAt
    ? formatDistanceToNow(new Date(story.publishedAt), { addSuffix: true })
    : 'just now';

  return (
    <div
      onClick={() => onSelectStory && onSelectStory(story)}
      className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-[#273449] cursor-pointer group shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-brand-primary/50"
    >
      {/* Background Cover Image with Gradient */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gray-900">
        <img
          src={story.image}
          alt={story.headline}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/60 to-transparent" />
      </div>

      {/* Floating Content */}
      <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end text-white z-10">
        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {story.isLive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase shadow-md shadow-rose-600/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              LIVE EVENT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary text-white text-[10px] font-bold uppercase">
              <Sparkles className="w-3 h-3" />
              TRENDING
            </span>
          )}

          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-gray-200">
            {story.categoryLabel || 'News'}
          </span>

          <span className="text-xs text-gray-300 font-mono">
            {(story.postCount / 1000).toFixed(1)}K posts talking about this
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug group-hover:text-brand-accent transition-colors drop-shadow-sm mb-2 line-clamp-2">
          {story.headline}
        </h2>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 mb-4 leading-relaxed max-w-2xl drop-shadow">
          {story.summary}
        </p>

        {/* Bottom bar with source and action */}
        <div className="flex items-center justify-between pt-2 border-t border-white/15">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{story.source}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              className="rounded-full px-4 text-xs font-bold shadow-md shadow-brand-primary/40"
              onClick={(e) => {
                e.stopPropagation();
                if (onJoinDiscussion) onJoinDiscussion(story);
              }}
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Discuss #{story.trendingTag}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
