import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { notificationService } from '../services/messageService';
import { useToast } from '../context/ToastContext';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const NotificationsPage = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(1);
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date() }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-primary" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-primary text-white font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMarkAllRead}
            icon={CheckCheck}
            className="text-xs"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div>
        {loading ? (
          <div className="p-12 flex justify-center text-brand-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((n) => (
              <NotificationItem
                key={n._id}
                notification={n}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        ) : (
          <div className="p-6">
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              description="When other members follow you, like your posts, or mention you, they will appear right here."
            />
          </div>
        )}
      </div>
    </div>
  );
};
