import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get user's conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate('participants', 'name username avatar isVerified')
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p._id.toString() !== currentUserId.toString()
      );

      const unreadCount = conv.unreadCounts?.get
        ? conv.unreadCounts.get(currentUserId.toString()) || 0
        : conv.unreadCounts?.[currentUserId.toString()] || 0;

      return {
        _id: conv._id,
        participant: otherParticipant || null,
        lastMessage: conv.lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create conversation with another user
// @route   POST /api/conversations
// @access  Private
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user._id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient user ID is required.',
      });
    }

    if (participantId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself.',
      });
    }

    const otherUser = await User.findById(participantId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found.',
      });
    }

    // Check blocking rules
    if (
      otherUser.blockedUsers.includes(currentUserId) ||
      req.user.blockedUsers.includes(participantId)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Cannot start conversation due to privacy/blocking settings.',
      });
    }

    // Find existing conversation between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId], $size: 2 },
    }).populate('participants', 'name username avatar isVerified');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, participantId],
        unreadCounts: new Map(),
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name username avatar isVerified'
      );
    }

    const otherParticipant = conversation.participants.find(
      (p) => p._id.toString() !== currentUserId.toString()
    );

    res.status(200).json({
      success: true,
      conversation: {
        _id: conversation._id,
        participant: otherParticipant,
        lastMessage: conversation.lastMessage,
        unreadCount: 0,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const currentUserId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Verify current user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view messages in this conversation.',
      });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({ conversation: conversationId });
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    // Reset unread count for current user
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(currentUserId.toString(), 0);
      await conversation.save();
    }

    // Mark messages as readBy
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: currentUserId } },
      { $addToSet: { readBy: currentUserId } }
    );

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const { content, attachments } = req.body;
    const currentUserId = req.user._id;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation.',
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: currentUserId,
      content: content ? content.trim() : '',
      attachments: attachments || [],
      readBy: [currentUserId],
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name username avatar'
    );

    // Update conversation lastMessage and recipient unread count
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== currentUserId.toString()
    );

    conversation.lastMessage = {
      text: content ? content.trim() : (attachments?.length ? 'Sent an attachment' : ''),
      sender: currentUserId,
      createdAt: new Date(),
    };

    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }

    if (recipientId) {
      const recipientStr = recipientId.toString();
      const currentCount = conversation.unreadCounts.get(recipientStr) || 0;
      conversation.unreadCounts.set(recipientStr, currentCount + 1);
    }

    await conversation.save();

    // Emit Socket.IO message if socketHandler is active
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(conversationId).emit('new_message', populatedMessage);
      if (recipientId) {
        io.to(recipientId.toString()).emit('conversation_updated', {
          conversationId,
          lastMessage: conversation.lastMessage,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};
