import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { getDemoUserById } from '../config/demoUsers.js';

export const setupSocketIO = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.headers?.cookie
          ?.split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

      if (token) {
        try {
          const decoded = verifyToken(token);
          let user = null;
          try {
            user = await User.findById(decoded.id).select('name username avatar isSuspended role');
          } catch (dbErr) {
            // DB offline or error
          }

          if (!user && (decoded.isDemo || getDemoUserById(decoded.id))) {
            user = getDemoUserById(decoded.id);
          }

          if (user && !user.isSuspended) {
            socket.user = user;
          }
        } catch (e) {
          // Continue as guest
        }
      }
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket) => {
    const isAuth = !!socket.user;
    const userId = isAuth ? (socket.user._id?.toString() || socket.user.id) : null;

    // Join global real-time news broadcast room
    socket.join('global_news');

    if (isAuth && userId) {
      console.log(`[Socket.IO] User connected: ${socket.user.username} (${userId})`);
      socket.join(userId);
    } else {
      console.log(`[Socket.IO] Guest connected to live news stream`);
    }

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`[Socket.IO] ${socket.user?.username || 'Guest'} joined conversation room: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`[Socket.IO] ${socket.user?.username || 'Guest'} left conversation room: ${conversationId}`);
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }) => {
      if (!socket.user) return;
      socket.to(conversationId).emit('user_typing', {
        conversationId,
        user: {
          _id: socket.user._id,
          name: socket.user.name,
          username: socket.user.username,
        },
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      if (!socket.user) return;
      socket.to(conversationId).emit('user_stopped_typing', {
        conversationId,
        userId: socket.user._id,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User disconnected: ${socket.user?.username || 'Guest'}`);
    });
  });
};
