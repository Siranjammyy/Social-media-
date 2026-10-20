import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Sparkles,
  Share2,
  CheckCircle2,
  ExternalLink,
  Send,
  Hash,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { postService } from '../../services/postService';

export const NewsDetailModal = ({
  isOpen,
  onClose,
  story,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [opinionText, setOpinionText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  if (!story) return null;

  const timeAgo = story.publishedAt
    ? formatDistanceToNow(new Date(story.publishedAt), { addSuffix: true })
    : 'just now';

  const handlePublishTake = async (e) => {
    e.preventDefault();
    if (!opinionText.trim()) return;

    if (!user) {
      toast.info('Please log in to share your thoughts on this story.');
      navigate('/login');
      return;
    }

    setIsPosting(true);
    try {
      const fullText = `${opinionText.trim()} #${story.trendingTag}`;
      const res = await postService.createPost({
        text: fullText,
        visibility: 'public',
      });

      if (res.success) {
        toast.success(`Your take on #${story.trendingTag} has been posted!`);
        setOpinionText('');
        if (onPostCreated) onPostCreated(res.post);
        onClose();
        navigate(`/search?tag=${encodeURIComponent(story.trendingTag)}`);
      }
    } catch (err) {
      toast.error('Failed to publish post.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleViewAllPosts = () => {
    onClose();
    navigate(`/search?tag=${encodeURIComponent(story.trendingTag)}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" showClose>
      <div className="space-y-5 -mt-2">
        {/* Cover Image */}
        {story.image && (
          <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-gray-900 -mx-1">
            <img
              src={story.image}
              alt={story.headline}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="font-bold bg-black/50 backdrop-blur px-2.5 py-1 rounded-lg">
                Source: {story.source}
              </span>
              <span className="text-gray-300 font-mono">{timeAgo}</span>
            </div>
          </div>
        )}

        {/* Story Metadata */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {story.isLive && (
              <span className="inline-flex items-center gap-1 text-rose-500 font-bold uppercase tracking-wide text-xs">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                LIVE UPDATES
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary">
              {story.categoryLabel || 'News'}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {(story.postCount / 1000).toFixed(1)}K posts
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug mb-3">
            {story.headline}
          </h2>

          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
            {story.summary}
          </p>
        </div>

        {/* Key Takeaways */}
        {story.keyTakeaways && story.keyTakeaways.length > 0 && (
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#182235] border border-gray-200 dark:border-[#273449] space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              Key Takeaways
            </h4>
            <ul className="space-y-2">
              {story.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Tags */}
        {story.relatedTags && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-gray-400 font-medium">Related tags:</span>
            {story.relatedTags.map((t) => (
              <span
                key={t}
                onClick={() => {
                  onClose();
                  navigate(`/search?tag=${encodeURIComponent(t)}`);
                }}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#182235] hover:bg-brand-primary/10 text-brand-primary cursor-pointer transition"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Post Your Take Quick Composer */}
        <div className="pt-3 border-t border-gray-100 dark:border-[#273449]">
          <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">
            Share your perspective on #{story.trendingTag}
          </h4>

          <form onSubmit={handlePublishTake} className="space-y-2">
            <textarea
              placeholder="What are your thoughts on this story? (Your post will automatically include the topic hashtag)"
              value={opinionText}
              onChange={(e) => setOpinionText(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-gray-50 dark:bg-[#182235] border border-gray-200 dark:border-[#273449] p-3 text-xs sm:text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-primary resize-none"
            />

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleViewAllPosts}
                className="text-xs"
              >
                <Hash className="w-3.5 h-3.5 mr-1" />
                View all #{story.trendingTag} posts
              </Button>

              <Button
                type="submit"
                size="sm"
                isLoading={isPosting}
                disabled={!opinionText.trim()}
                className="rounded-full px-5 text-xs font-semibold shadow-md shadow-brand-primary/20"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Post Take
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
