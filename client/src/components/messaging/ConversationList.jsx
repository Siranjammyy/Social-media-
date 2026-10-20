import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, MessageSquare } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const ConversationList = ({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}) => {
  return (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-[#273449] w-full md:w-80 shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-[#273449] flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
        <Button
          size="sm"
          variant="secondary"
          onClick={onNewConversation}
          className="rounded-full w-8 h-8 !p-0"
          title="New conversation"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#273449]">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            No conversations yet. Start connecting!
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = activeConversationId === conv._id;
            const p = conv.participant || {};
            const timeAgo = conv.lastMessage?.createdAt
              ? formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })
              : '';

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv._id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-l-4 border-brand-primary'
                    : 'hover:bg-gray-50 dark:hover:bg-[#182235]'
                }`}
              >
                <div className="relative">
                  <Avatar src={p.avatar} name={p.name || 'User'} size="md" isVerified={p.isVerified} />
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#111827]">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {p.name || 'Aura User'}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">{timeAgo}</span>
                  </div>

                  <p
                    className={`text-xs truncate ${
                      conv.unreadCount > 0
                        ? 'font-bold text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {conv.lastMessage?.text || 'Started a conversation'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
