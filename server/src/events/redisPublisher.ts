import { DomainEventType, IDomainEvent } from '../types/activity.types.js';
import { getRedisClient } from '../config/redis.config.js';
import { env } from '../config/env.config.js';
import { logger } from '../utils/logger.js';

export interface IRedisPublisher {
  publish<T = Record<string, unknown>>(event: IDomainEvent<T>): Promise<boolean>;
  subscribe<T = Record<string, unknown>>(
    eventType: DomainEventType,
    handler: (event: IDomainEvent<T>) => void | Promise<void>
  ): Promise<void>;
}

export class RedisPublisher implements IRedisPublisher {
  private static instance: RedisPublisher;
  private channelPrefix = 'teamflow:events:';

  private constructor() {}

  public static getInstance(): RedisPublisher {
    if (!RedisPublisher.instance) {
      RedisPublisher.instance = new RedisPublisher();
    }
    return RedisPublisher.instance;
  }

  public async publish<T = Record<string, unknown>>(event: IDomainEvent<T>): Promise<boolean> {
    if (!env.ENABLE_REDIS_EVENTS) return false;

    const client = getRedisClient();
    if (!client) return false;

    try {
      const channel = `${this.channelPrefix}${event.eventType}`;
      const payloadString = JSON.stringify(event);
      await client.publish(channel, payloadString);
      return true;
    } catch (error: any) {
      logger.warn(`⚠️ [RedisPublisher] Failed to publish event ${event.eventType} via Redis: ${error.message}`);
      return false;
    }
  }

  public async subscribe<T = Record<string, unknown>>(
    eventType: DomainEventType,
    handler: (event: IDomainEvent<T>) => void | Promise<void>
  ): Promise<void> {
    if (!env.ENABLE_REDIS_EVENTS) return;

    const client = getRedisClient();
    if (!client) return;

    try {
      const subClient = client.duplicate();
      const channel = `${this.channelPrefix}${eventType}`;

      subClient.on('message', (ch, message) => {
        if (ch === channel) {
          try {
            const parsedEvent: IDomainEvent<T> = JSON.parse(message);
            void handler(parsedEvent);
          } catch (err: any) {
            logger.error(`❌ [RedisPublisher] Invalid payload on ${channel}: ${err?.message || String(err)}`);
          }
        }
      });

      await subClient.subscribe(channel);
    } catch (error: any) {
      logger.warn(`⚠️ [RedisPublisher] Failed to subscribe to channel for event ${eventType}: ${error?.message || String(error)}`);
    }
  }
}

export const redisPublisher = RedisPublisher.getInstance();
