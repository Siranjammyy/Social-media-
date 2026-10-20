import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setupSocketIO } from './socket/socketHandler.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null;
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || (origin && allowedOrigins.includes(origin.replace(/\/$/, '')))) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in cloud deployments for flexible staging
      }
    },
    credentials: true,
  },
});

// Attach io to Express app for use in route controllers
app.set('io', io);

// Configure Socket.IO event listeners
setupSocketIO(io);

// Start server
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  🚀 Aura Server running on port ${PORT}`);
  console.log(`  🔗 API Root: http://localhost:${PORT}/api`);
  console.log(`  🩺 Health:   http://localhost:${PORT}/api/health`);
  console.log(`  ✨ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection Error]:', err);
});
