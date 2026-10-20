import express from 'express';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  const isHealthy = dbStatus.isConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    application: 'Aura API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.isConnected,
      state: dbStatus.readyState === 1 ? 'connected' : 'disconnected',
      host: dbStatus.host,
      databaseName: dbStatus.name,
    },
  });
});

export default router;
