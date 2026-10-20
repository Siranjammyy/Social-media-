import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Edit2,
  Trash2,
  Flag,
  Copy,
  MapPin,
  Globe,
  Users,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { postService } from '../../services/postService';
import { reportService } from '../../services/messageService';
import { Avatar } from '../common/Avatar';
import { Dropdown, DropdownItem } from '../common/Dropdown';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CommentList } from './CommentList';
import { Button } from '../common/Button';

export const PostCard = ({
  post,
  onPostUpdated,
  onPostDeleted,
  className = '',
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const author = post.author || {};
  const isAuthor = user && (user._id === author._id || user._id === author);
  const isAdmin = user?.role === 'admin';

  // Format time ago
  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : 'just now';

  // Toggle Like (Optimistic)
  const handleLikeToggle = async () => {
    if (!user) {
      toast.info('Please log in to like posts.');
      navigate('/login');
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      if (previousLiked) {
        await postService.unlikePost(post._id);
      } else {
        await postService.likePost(post._id);
      }
    } catch (err) {
      // Rollback on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error('Failed to update like status.');
    }
  };

  // Toggle Bookmark (Optimistic)
  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.info('Please log in to bookmark posts.');
      navigate('/login');
      return;
    }

    const previousBookmarked = isBookmarked;
    setIsBookmarked(!previousBookmarked);

    try {
      const res = await postService.toggleBookmark(post._id);
      toast.success(res.message);
    } catch (err) {
      setIsBookmarked(previousBookmarked);
      toast.error('Failed to bookmark post.');
    }
  };

  // Toggle Comments
  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await postService.getComments(post._id);
        if (res.success) {
          setComments(res.comments);
        }
      } catch (err) {
        toast.error('Failed to load comments.');
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  // Share post link
  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success('Post link copied to clipboard!');
  };

  // Delete Post
  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      await postService.deletePost(post._id);
      toast.success('Post deleted successfully.');
      setShowDeleteDialog(false);
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (err) {
      toast.error('Failed to delete post.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editText.trim()) {
      toast.error('Post content cannot be empty.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await postService.updatePost(post._id, { text: editText });
      if (res.success) {
        toast.success('Post updated.');
        setIsEditing(false);
        if (onPostUpdated) onPostUpdated(res.post);
      }
    } catch (err) {
      toast.error('Failed to update post.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Report post
  const handleReportPost = async () => {
    if (!user) {
      toast.info('Please log in to report content.');
      return;
    }
    try {
      await reportService.submitReport({
        targetType: 'post',
        targetId: post._id,
        reason: 'inappropriate_content',
      });
      toast.success('Report submitted. Thank you for keeping Aura safe.');
    } catch (err) {
      toast.error('Could not submit report.');
    }
  };

  // Render clickable hashtags & mentions
  const renderFormattedText = (content) => {
    if (!content) return null;
    const words = content.split(/(\s+)/);

    return words.map((word, i) => {
      if (word.startsWith('#') && word.length > 1) {
        const tag = word.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
        return (
          <Link
            key={i}
            to={`/search?tag=${encodeURIComponent(tag.toLowerCase())}`}
            className="text-brand-primary hover:underline font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {word}
          </Link>
        );
      }
      if (word.startsWith('@') && word.length > 1) {
        const username = word.slice(1).replace(/[^a-zA-Z0-9_.]/g, '');
        return (
          <Link
            key={i}
            to={`/${username.toLowerCase()}`}
            className="text-brand-accent hover:underline font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            {word}
          </Link>
        );
      }
      return word;
    });
  };

  return (
    <article className={`nexora-card p-4 sm:p-5 mb-4 group ${className}`}>
      {/* Post Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/${author.username}`}>
            <Avatar
              src={author.avatar}
              name={author.name || 'User'}
              size="md"
              isVerified={author.isVerified}
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/${author.username}`}
                className="font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:underline truncate"
              >
                {author.name}
              </Link>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{author.username}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400 hover:underline">{timeAgo}</span>
              {post.isEdited && (
                <span className="text-[10px] text-gray-400 italic">(edited)</span>
              )}
            </div>

            {/* Location & Visibility badges */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
              {post.location && (
                <span className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3 h-3 text-brand-primary" />
                  {post.location}
                </span>
              )}
              {post.visibility === 'followers' && (
                <span className="flex items-center gap-1 text-brand-primary">
                  <Users className="w-3 h-3" /> Followers only
                </span>
              )}
              {post.visibility === 'private' && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Lock className="w-3 h-3" /> Private
                </span>
              )}
            </div>
          </div>
        </div>

        {/* More Actions Menu */}
        <Dropdown
          trigger={
            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#182235] transition">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          }
        >
          {isAuthor && (
            <DropdownItem icon={Edit2} onClick={() => setIsEditing(true)}>
              Edit Post
            </DropdownItem>
          )}
          {(isAuthor || isAdmin) && (
            <DropdownItem
              icon={Trash2}
              danger
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Post
            </DropdownItem>
          )}
          <DropdownItem icon={Copy} onClick={handleCopyLink}>
            Copy Link
          </DropdownItem>
          {!isAuthor && (
            <DropdownItem icon={Flag} danger onClick={handleReportPost}>
              Report Post
            </DropdownItem>
          )}
        </Dropdown>
      </div>

      {/* Post Text Content or Inline Editing */}
      {isEditing ? (
        <div className="mb-3 space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded-xl bg-gray-50 dark:bg-[#182235] border border-gray-200 dark:border-[#273449] p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-primary"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              isLoading={isSavingEdit}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        post.text && (
          <p className="text-sm sm:text-[15px] text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-line mb-3.5 break-words">
            {renderFormattedText(post.text)}
          </p>
        )
      )}

      {/* Media Gallery */}
      {post.media && post.media.length > 0 && (
        <div
          className={`rounded-2xl overflow-hidden mb-3.5 grid gap-1.5 border border-gray-200 dark:border-[#273449] bg-black/5 ${
            post.media.length === 1 ? 'grid-cols-1 max-h-[500px]' : 'grid-cols-2 max-h-[420px]'
          }`}
        >
          {post.media.map((item, index) => (
            <div key={index} className="relative overflow-hidden w-full h-full bg-black/40">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  controls
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.caption || 'Post attachment'}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Actions Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#273449] text-gray-500 dark:text-gray-400 text-xs font-medium">
        {/* Like */}
        <button
          onClick={handleLikeToggle}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors group ${
            isLiked
              ? 'text-rose-600 dark:text-rose-500 font-semibold'
              : 'hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform group-hover:scale-125 ${
              isLiked ? 'fill-current text-rose-500' : ''
            }`}
          />
          <span>{likeCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:text-brand-primary hover:bg-brand-primary/10 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentCount}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:text-brand-accent hover:bg-brand-accent/10 transition-colors"
          title="Share post"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmarkToggle}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg transition-colors ${
            isBookmarked
              ? 'text-brand-primary font-semibold'
              : 'hover:text-brand-primary hover:bg-brand-primary/10'
          }`}
          title="Bookmark"
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? 'fill-current text-brand-primary' : ''}`}
          />
        </button>
      </div>

      {/* Expanded Comments */}
      {showComments && (
        <CommentList
          postId={post._id}
          comments={comments}
          onCommentAdded={(newComment) => {
            setComments((prev) => [newComment, ...prev]);
            setCommentCount((c) => c + 1);
          }}
          onCommentDeleted={(deletedCommentId) => {
            setComments((prev) => prev.filter((c) => c._id !== deletedCommentId));
            setCommentCount((c) => Math.max(0, c - 1));
          }}
        />
      )}

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? All likes, comments, and attachments will be permanently removed."
        confirmText="Delete Post"
        isLoading={isDeleting}
      />
    </article>
  );
};
