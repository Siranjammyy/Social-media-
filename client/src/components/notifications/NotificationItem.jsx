import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Mail,
  Sparkles,
  Check,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';

export const NotificationItem = ({ notification, onMarkRead }) => {
  const navigate = useNavigate();
  const actor = notification.actor || {};

  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : 'just now';

  const isUnread = !notification.readAt;

  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-current" />;
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-brand-primary fill-current" />;
      case 'follow':
      case 'follow_request':
        return <UserPlus className="w-4 h-4 text-brand-accent" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-amber-500" />;
      case 'message':
        return <Mail className="w-4 h-4 text-brand-primary" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-primary" />;
    }
  };

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification._id);
    }

    if (notification.resourceType === 'post' && notification.resourceId) {
      navigate(`/posts/${notification.resourceId}`);
    } else if (notification.resourceType === 'user' && actor.username) {
      navigate(`/${actor.username}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-[#273449] ${
        isUnread
          ? 'bg-brand-primary/5 dark:bg-brand-primary/10'
          : 'hover:bg-gray-50 dark:hover:bg-[#182235]'
      }`}
    >
      {/* Icon badge */}
      <div className="shrink-0 mt-0.5">{getIcon()}</div>

      {/* Actor Avatar */}
      <Avatar
        src={actor.avatar}
        name={actor.name || 'User'}
        size="sm"
        isVerified={actor.isVerified}
      />

      {/* Text Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
          <span className="font-bold text-gray-900 dark:text-white mr-1">
            {actor.name}
          </span>
          {notification.message || 'interacted with your content.'}
        </p>
        <span className="text-[11px] text-gray-400 mt-1 block">{timeAgo}</span>
      </div>

      {/* Unread indicator */}
      {isUnread && (
        <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0 self-center" />
      )}
    </div>
  );
};
