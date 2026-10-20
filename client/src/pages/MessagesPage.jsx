import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messageService } from '../services/messageService';
import { ConversationList } from '../components/messaging/ConversationList';
import { MessageChat } from '../components/messaging/MessageChat';
import { NewConversationModal } from '../components/messaging/NewConversationModal';

export const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeParamId = searchParams.get('conversation');

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(activeParamId || null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const loadConversations = async () => {
    try {
      const res = await messageService.getConversations();
      if (res.success) {
        setConversations(res.conversations || []);
        if (!activeConversationId && res.conversations?.length > 0) {
          setActiveConversationId(res.conversations[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeParamId) {
      setActiveConversationId(activeParamId);
    }
  }, [activeParamId]);

  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    setSearchParams({ conversation: id });
  };

  const handleSelectUserFromModal = async (targetUser) => {
    try {
      const res = await messageService.getOrCreateConversation(targetUser._id);
      if (res.success && res.conversation) {
        setConversations((prev) => {
          if (prev.some((c) => c._id === res.conversation._id)) return prev;
          return [res.conversation, ...prev];
        });
        handleSelectConversation(res.conversation._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col md:flex-row overflow-hidden bg-white dark:bg-[#0B1020]">
      {/* Conversations list sidebar */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={() => setIsNewModalOpen(true)}
      />

      {/* Chat pane */}
      <MessageChat
        conversationId={activeConversationId}
        participant={activeConversation?.participant}
        onMessageSent={(msg) => {
          // Update lastMessage preview in list
          setConversations((prev) =>
            prev.map((c) =>
              c._id === activeConversationId
                ? {
                    ...c,
                    lastMessage: {
                      text: msg.content || 'Sent an attachment',
                      createdAt: new Date(),
                    },
                  }
                : c
            )
          );
        }}
      />

      {/* New conversation user search modal */}
      <NewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSelectUser={handleSelectUserFromModal}
      />
    </div>
  );
};
