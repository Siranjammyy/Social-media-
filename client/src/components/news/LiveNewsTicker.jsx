import React, { useState, useEffect } from 'react';
import { Radio, ChevronRight, ChevronLeft, Zap } from 'lucide-react';

export const LiveNewsTicker = ({ items = [], onSelectStory }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div
      onClick={() => onSelectStory && onSelectStory(currentItem)}
      className="group relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-brand-primary/10 to-brand-accent/10 border border-rose-500/20 hover:border-rose-500/40 cursor-pointer transition-all duration-300 shadow-sm"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Pulsing Live indicator */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black tracking-wider uppercase shrink-0 shadow-sm shadow-rose-500/40 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          LIVE
        </div>

        <span className="text-[11px] font-mono text-gray-400 hidden sm:inline shrink-0">
          {currentItem.category || 'Breaking'}
        </span>

        {/* Ticker Headline */}
        <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-primary transition-colors">
          {currentItem.headline}
        </p>
      </div>

      {/* Manual controls */}
      <div className="flex items-center gap-1 shrink-0 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
          title="Previous headline"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono select-none">
          {currentIndex + 1}/{items.length}
        </span>
        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
          title="Next headline"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
