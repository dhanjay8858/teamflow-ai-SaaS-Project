import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '../config/env.config.js';
import { createPubSubPair } from '../config/redis.config.js';
import { logger } from '../utils/logger.js';
import { activeSocketGauge } from '../utils/metrics.js';

export class SocketServer {
  private static instance: SocketServer | null = null;
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupAdapter();
    this.initializeHandlers();
    SocketServer.instance = this;
  }

  public static getInstance(): SocketServer | null {
    return SocketServer.instance;
  }

  private setupAdapter(): void {
    if (!env.REDIS_ENABLED) {
      logger.info('🔌 Socket.IO using default in-memory adapter.');
      return;
    }

    const pubSub = createPubSubPair();
    if (pubSub) {
      const { pubClient, subClient } = pubSub;
      this.io.adapter(createAdapter(pubClient, subClient));
      logger.info('🔌 Socket.IO configured with Redis Adapter for horizontal scaling.');
    } else {
      logger.warn('⚠️ Redis adapter setup failed. Falling back to in-memory adapter.');
    }
  }

  private initializeHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      activeSocketGauge.inc();
      logger.info(`🔌 Socket client connected: ${socket.id}`);

      // Handle user room subscription
      socket.on('join_user_room', (data: { userId: string }) => {
        if (data?.userId) {
          const room = `user:${data.userId}`;
          socket.join(room);
          logger.debug(`🔌 Socket ${socket.id} joined room ${room}`);
        }
      });

      socket.on('leave_user_room', (data: { userId: string }) => {
        if (data?.userId) {
          const room = `user:${data.userId}`;
          socket.leave(room);
        }
      });

      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });

      socket.on('disconnect', (reason) => {
        activeSocketGauge.dec();
        logger.info(`🔌 Socket client disconnected: ${socket.id} (${reason})`);
      });
    });
  }

  public emitToUser(userId: string, event: string, payload: unknown): void {
    const room = `user:${userId}`;
    this.io.to(room).emit(event, payload);
  }

  public getIO(): Server {
    return this.io;
  }

  public async close(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        logger.info('🔌 Socket.IO server closed.');
        resolve();
      });
    });
  }
}
