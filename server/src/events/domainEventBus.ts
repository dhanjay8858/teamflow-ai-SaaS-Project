import { EventEmitter } from 'events';
import { DomainEventType, IDomainEvent } from '../types/activity.types.js';

export type DomainEventHandler<T = any> = (event: IDomainEvent<T>) => void | Promise<void>;

export class DomainEventBus {
  private static instance: DomainEventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }

  public static getInstance(): DomainEventBus {
    if (!DomainEventBus.instance) {
      DomainEventBus.instance = new DomainEventBus();
    }
    return DomainEventBus.instance;
  }

  public publish<T = Record<string, unknown>>(eventType: DomainEventType, payload: T, aggregateId?: string): void {
    const event: IDomainEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      eventType,
      timestamp: new Date(),
      aggregateId,
      payload,
    };

    setImmediate(() => {
      this.emitter.emit(eventType, event);
    });
  }

  public subscribe<T = Record<string, unknown>>(eventType: DomainEventType, handler: DomainEventHandler<T>): void {
    this.emitter.on(eventType, async (event: IDomainEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`❌ [DomainEventBus] Error handling event ${eventType}:`, error);
      }
    });
  }
}

export const domainEventBus = DomainEventBus.getInstance();
