import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, CornerDownRight, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { postService } from '../../services/postService';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const CommentList = ({
  postId,
  comments = [],
  onCommentAdded,
  onCommentDeleted,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await postService.createComment(postId, { text: newCommentText.trim() });
      if (res.success) {
        setNewCommentText('');
        if (onCommentAdded) onCommentAdded(res.comment);
      }
    } catch (err) {
      toast.error('Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReply = async (parentCommentId) => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await postService.createComment(postId, {
        text: replyText.trim(),
        parentCommentId,
      });
      if (res.success) {
        setReplyText('');
        setReplyingToId(null);
        if (onCommentAdded) onCommentAdded(res.comment);
      }
    } catch (err) {
      toast.error('Failed to send reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postService.deleteComment(commentId);
      toast.success('Comment deleted.');
      if (onCommentDeleted) onCommentDeleted(commentId);
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  return (
    <div className="pt-4 mt-3 border-t border-gray-100 dark:border-[#273449] space-y-4">
      {/* Top Comment Input */}
      {user && (
        <form onSubmit={handleCreateComment} className="flex gap-2.5 items-center">
          <Avatar src={user.avatar} name={user.name} size="xs" />
          <input
            type="text"
            placeholder="Write a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 bg-gray-100 dark:bg-[#182235] rounded-full px-3.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newCommentText.trim() || isSubmitting}
            className="rounded-full h-7 px-3 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => {
          const isAuthor = user && (user._id === comment.author?._id || user._id === comment.author);
          const timeAgo = comment.createdAt
            ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
            : 'just now';

          return (
            <div key={comment._id} className="text-xs group">
              <div className="flex items-start gap-2.5">
                <Avatar
                  src={comment.author?.avatar}
                  name={comment.author?.name || 'User'}
                  size="xs"
                />

                <div className="flex-1 min-w-0 bg-gray-50 dark:bg-[#182235] p-2.5 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-gray-900 dark:text-white truncate">
                        {comment.author?.name}
                      </span>
                      <span className="text-gray-400 text-[11px]">
                        @{comment.author?.username}
                      </span>
                      <span className="text-gray-400 text-[10px]">• {timeAgo}</span>
                    </div>

                    {isAuthor && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {comment.text}
                  </p>

                  {/* Reply button */}
                  {user && (
                    <button
                      onClick={() =>
                        setReplyingToId(replyingToId === comment._id ? null : comment._id)
                      }
                      className="mt-1.5 text-[11px] font-medium text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      Reply
                    </button>
                  )}
                </div>
              </div>

              {/* Nested Reply Input */}
              {replyingToId === comment._id && (
                <div className="flex gap-2 items-center ml-8 mt-2">
                  <input
                    type="text"
                    placeholder={`Reply to @${comment.author?.username}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-gray-100 dark:bg-[#182235] rounded-full px-3 py-1 text-xs text-gray-900 dark:text-white outline-none"
                  />
                  <Button
                    size="sm"
                    className="rounded-full h-6 px-2.5 text-[10px]"
                    onClick={() => handleCreateReply(comment._id)}
                  >
                    Reply
                  </Button>
                </div>
              )}

              {/* Child Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-2 space-y-2 border-l-2 border-gray-100 dark:border-[#273449] pl-3">
                  {comment.replies.map((reply) => {
                    const isReplyAuthor =
                      user && (user._id === reply.author?._id || user._id === reply.author);
                    const replyTimeAgo = reply.createdAt
                      ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })
                      : 'just now';

                    return (
                      <div key={reply._id} className="flex items-start gap-2">
                        <Avatar
                          src={reply.author?.avatar}
                          name={reply.author?.name || 'User'}
                          size="xs"
                        />
                        <div className="flex-1 bg-gray-50/70 dark:bg-[#141d2e] p-2 rounded-lg">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {reply.author?.name}
                            </span>
                            {isReplyAuthor && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="text-gray-400 hover:text-rose-500 transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-800 dark:text-gray-200">{reply.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
