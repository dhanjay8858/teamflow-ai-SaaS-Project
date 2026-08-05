import dns from 'dns';
import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.config.js';
import { connectDatabase, closeDatabase } from './config/db.config.js';

// Force IPv4 DNS lookup order to prevent IPv6 socket timeouts on Linux/Render instances
dns.setDefaultResultOrder('ipv4first');
import { initCloudinary } from './config/cloudinary.config.js';
import { initRedis, closeRedis } from './config/redis.config.js';
import { SocketServer } from './socket/socket.server.js';
import { logger } from './utils/logger.js';

const startServer = async (): Promise<void> => {
  try {
    // 1. Initialize MongoDB & Redis & Cloudinary
    await connectDatabase();
    await initRedis();
    initCloudinary();

    // 2. Create Express App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    // 3. Initialize Socket.IO Server (with optional Redis Adapter)
    const socketServer = new SocketServer(server);

    // 4. Start HTTP Server
    server.listen(env.PORT, () => {
      logger.info(`🚀 TeamFlow AI Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
      logger.info(`🔗 API Healthcheck available at http://localhost:${env.PORT}/health`);
      logger.info(`📊 Prometheus Metrics available at http://localhost:${env.PORT}/metrics`);
    });

    // Graceful Shutdown Handler
    let isShuttingDown = false;

    const handleShutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info(`🛑 Received ${signal}. Initiating graceful shutdown...`);

      // 1. Stop accepting new HTTP requests
      server.close(async () => {
        logger.info('1️⃣ HTTP server closed to new connections.');

        // 2. Close Socket.IO server
        try {
          await socketServer.close();
          logger.info('2️⃣ Socket.IO server closed.');
        } catch (err: any) {
          logger.error('Error closing Socket.IO:', err);
        }

        // 3. Close MongoDB Connection
        try {
          await closeDatabase();
          logger.info('3️⃣ MongoDB connection closed.');
        } catch (err: any) {
          logger.error('Error closing MongoDB:', err);
        }

        // 4. Close Redis Connections
        try {
          await closeRedis();
          logger.info('4️⃣ Redis connections closed.');
        } catch (err: any) {
          logger.error('Error closing Redis:', err);
        }

        logger.info('✨ Graceful shutdown complete. Exiting process.');
        process.exit(0);
      });

      // Force exit if shutdown hangs over 10 seconds
      setTimeout(() => {
        logger.error('⚠️ Shutdown timeout reached (10s). Forcing process exit.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
