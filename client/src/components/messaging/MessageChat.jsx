import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Image, Loader2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { messageService, uploadService } from '../../services/messageService';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const MessageChat = ({
  conversationId,
  participant,
  onMessageSent,
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load message history
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await messageService.getMessages(conversationId);
        if (res.success) {
          setMessages(res.messages);
        }
      } catch (err) {
        toast.error('Could not load messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Join conversation socket room and listen for real-time messages & typing
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join_conversation', conversationId);

    const handleNewMessage = (msg) => {
      if (msg.conversation === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === conversationId && data.user._id !== user._id) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== user._id) {
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, conversationId, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket && conversationId) {
      socket.emit('typing_start', { conversationId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    if (socket && conversationId) {
      socket.emit('typing_stop', { conversationId });
    }

    try {
      const res = await messageService.sendMessage(conversationId, textToSend);
      if (res.success) {
        // In case socket didn't duplicate, add to list if not present
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.message._id)) return prev;
          return [...prev, res.message];
        });
        if (onMessageSent) onMessageSent(res.message);
      }
    } catch (err) {
      toast.error('Failed to deliver message.');
      setInputText(textToSend); // Restore
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uploadRes = await uploadService.uploadFiles([file]);
      if (uploadRes.success && uploadRes.files[0]) {
        const attachment = { url: uploadRes.files[0].url, type: 'image' };
        const res = await messageService.sendMessage(conversationId, '', [attachment]);
        if (res.success) {
          setMessages((prev) => [...prev, res.message]);
        }
      }
    } catch (err) {
      toast.error('Failed to upload image.');
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <User className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          Select a Conversation
        </h3>
        <p className="text-xs max-w-xs">
          Choose from your existing messages or start a new chat with another user.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0B1020]">
      {/* Chat Header */}
      <div className="p-3.5 border-b border-gray-200 dark:border-[#273449] flex items-center justify-between bg-white/70 dark:bg-[#0B1020]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Avatar
            src={participant?.avatar}
            name={participant?.name || 'User'}
            size="sm"
            isVerified={participant?.isVerified}
          />
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {participant?.name || 'Aura User'}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              @{participant?.username || 'user'}
            </p>
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 text-xs py-8">
            Say hello to {participant?.name || 'your contact'}! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user && (user._id === msg.sender?._id || user._id === msg.sender);
            const time = msg.createdAt ? format(new Date(msg.createdAt), 'p') : '';

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-tr from-brand-primary to-brand-500 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-[#182235] text-gray-900 dark:text-white rounded-bl-none border border-gray-200/50 dark:border-[#273449]'
                  }`}
                >
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 rounded-xl overflow-hidden">
                      <img
                        src={msg.attachments[0].url}
                        alt="attachment"
                        className="max-h-60 w-full object-cover"
                      />
                    </div>
                  )}
                  {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{time}</span>
              </div>
            );
          })
        )}

        {/* Live typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-400 italic">
            <Avatar src={participant?.avatar} name={participant?.name} size="xs" />
            <span>{participant?.name || 'User'} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-gray-200 dark:border-[#273449] flex items-center gap-2 bg-white dark:bg-[#0B1020]"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-brand-primary transition rounded-xl hover:bg-gray-100 dark:hover:bg-[#182235]"
          title="Attach image"
        >
          <Image className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        <input
          type="text"
          placeholder="Write a message..."
          value={inputText}
          onChange={handleInputChange}
          className="flex-1 bg-gray-100 dark:bg-[#182235] rounded-full px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-brand-primary"
        />

        <Button
          type="submit"
          size="sm"
          disabled={!inputText.trim() || isSending}
          className="rounded-full w-9 h-9 !p-0 shadow-md shadow-brand-primary/20"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
