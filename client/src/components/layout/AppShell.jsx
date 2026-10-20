import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightSidebar } from './RightSidebar';
import { TopBar } from './TopBar';
import { MobileNavigation } from './MobileNavigation';
import { Modal } from '../common/Modal';
import { PostComposer } from '../post/PostComposer';
import { useSocket } from '../../context/SocketContext';
import { notificationService, messageService } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';

export const AppShell = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch initial unread counts
    const fetchCounts = async () => {
      try {
        const notifRes = await notificationService.getNotifications(1);
        if (notifRes.success) {
          setUnreadNotifications(notifRes.unreadCount || 0);
        }

        const convRes = await messageService.getConversations();
        if (convRes.success) {
          const totalUnread = convRes.conversations.reduce(
            (acc, curr) => acc + (curr.unreadCount || 0),
            0
          );
          setUnreadMessages(totalUnread);
        }
      } catch (err) {
        // Silently catch in dev
      }
    };

    fetchCounts();
  }, [user]);

  // Listen to Socket.IO events for live badge updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      setUnreadNotifications((prev) => prev + 1);
    };

    const handleConversationUpdated = () => {
      setUnreadMessages((prev) => prev + 1);
    };

    socket.on('notification', handleNewNotification);
    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B1020] text-gray-900 dark:text-[#F8FAFC]">
      {/* Mobile Top Header */}
      <TopBar />

      <div className="max-w-7xl mx-auto flex justify-center min-h-screen">
        {/* Left Sidebar */}
        <Sidebar
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
          unreadNotifications={unreadNotifications}
          unreadMessages={unreadMessages}
        />

        {/* Center Main Stream */}
        <main className="flex-1 max-w-2xl min-h-screen border-x border-gray-200 dark:border-[#273449] pb-20 md:pb-6">
          <Outlet context={{ openCreatePost: () => setIsCreatePostOpen(true) }} />
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation onOpenCreatePost={() => setIsCreatePostOpen(true)} />

      {/* Global Post Creation Modal */}
      <Modal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        title="Create a New Post"
        maxWidth="max-w-xl"
      >
        <PostComposer
          className="border-none shadow-none !p-0 !m-0"
          onPostCreated={() => {
            setIsCreatePostOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
