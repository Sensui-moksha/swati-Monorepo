import { EventEmitter } from "events";
import crypto from "crypto";
import { IDomainEvent, DeadLetterItem, EventBusMetrics } from "./DomainEvent";
import { logger } from "../utils/logger";
import { getRedisClient } from "../config/redis";
import type Redis from "ioredis";

type EventHandler<T = any> = (event: IDomainEvent<T>) => Promise<void> | void;

const REDIS_CHANNEL_PREFIX = "eventbus:";

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;
  private dlq: Map<string, DeadLetterItem> = new Map();
  private maxDlqSize = 1000;
  private redisPub: Redis | null = null;
  private redisSub: Redis | null = null;
  private subscribedChannels = new Set<string>();
  private instanceId = crypto.randomUUID();
  private metrics: EventBusMetrics = {
    totalPublished: 0,
    totalDelivered: 0,
    totalFailed: 0,
    dlqLength: 0,
    eventsByName: {},
  };

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Connect Redis Pub/Sub for multi-instance event distribution.
   * Call once at startup. Safe to skip — falls back to local-only EventEmitter.
   */
  public async connectRedis(): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;

      this.redisPub = client;
      this.redisSub = client.duplicate();

      this.redisSub.on("message", (channel: string, message: string) => {
        try {
          const envelope = JSON.parse(message);
          // Skip events published by this instance (already dispatched locally)
          if (envelope._sourceInstance === this.instanceId) return;

          const eventName = channel.replace(REDIS_CHANNEL_PREFIX, "");
          const event: IDomainEvent = {
            ...envelope,
            timestamp: new Date(envelope.timestamp),
          };
          delete (event as any)._sourceInstance;

          this.emitter.emit(eventName, event);
        } catch (err: any) {
          logger.error(`[EventBus] Failed to deserialize remote event on ${channel}: ${err.message}`);
        }
      });

      logger.info(`[EventBus] Redis Pub/Sub connected (instance: ${this.instanceId.slice(0, 8)})`);
    } catch (err: any) {
      logger.warn(`[EventBus] Redis Pub/Sub unavailable, using local-only mode: ${err.message}`);
      this.redisPub = null;
      this.redisSub = null;
    }
  }

  /**
   * Publish a domain event asynchronously to all registered subscribers.
   * When Redis is connected, also broadcasts to other process instances.
   */
  public async publish<T = any>(
    name: string,
    payload: T,
    metadata?: { actorId?: string; correlationId?: string }
  ): Promise<IDomainEvent<T>> {
    const event: IDomainEvent<T> = {
      id: crypto.randomUUID(),
      name,
      timestamp: new Date(),
      payload,
      correlationId: metadata?.correlationId,
      actorId: metadata?.actorId,
    };

    this.metrics.totalPublished++;
    this.metrics.eventsByName[name] = (this.metrics.eventsByName[name] || 0) + 1;

    // Dispatch locally via setImmediate
    setImmediate(() => {
      this.emitter.emit(name, event);
    });

    // Broadcast to other instances via Redis Pub/Sub
    if (this.redisPub) {
      try {
        const envelope = { ...event, _sourceInstance: this.instanceId };
        await this.redisPub.publish(
          `${REDIS_CHANNEL_PREFIX}${name}`,
          JSON.stringify(envelope)
        );
      } catch {
        // Degrade gracefully — local dispatch already happened
      }
    }

    return event;
  }

  /**
   * Subscribe to a domain event with automatic error containment and retry.
   * When Redis is connected, also subscribes to remote events from other instances.
   */
  public subscribe<T = any>(
    name: string,
    handler: EventHandler<T>,
    options: { retries?: number } = { retries: 2 }
  ): void {
    const maxRetries = options.retries ?? 2;

    this.emitter.on(name, async (event: IDomainEvent<T>) => {
      let attempts = 0;
      let lastError: any = null;

      while (attempts <= maxRetries) {
        try {
          await handler(event);
          this.metrics.totalDelivered++;
          return;
        } catch (error: any) {
          lastError = error;
          attempts++;
          if (attempts <= maxRetries) {
            // Exponential backoff before retry (50ms, 100ms)
            await new Promise((res) => setTimeout(res, 50 * Math.pow(2, attempts - 1)));
          }
        }
      }

      // Max retries exceeded -> Route to Dead Letter Queue (DLQ)
      this.metrics.totalFailed++;
      const dlqItem: DeadLetterItem = {
        id: event.id,
        event,
        error: lastError?.message || String(lastError),
        failedAt: new Date(),
        retryCount: attempts,
      };

      if (this.dlq.size >= this.maxDlqSize) {
        const oldestKey = this.dlq.keys().next().value;
        if (oldestKey) this.dlq.delete(oldestKey);
      }

      this.dlq.set(event.id, dlqItem);
      this.metrics.dlqLength = this.dlq.size;

      logger.error(`[EventBus] Event ${name} (${event.id}) failed after ${attempts} attempts: ${dlqItem.error}`);
    });

    // Subscribe to Redis channel for multi-instance distribution
    const channel = `${REDIS_CHANNEL_PREFIX}${name}`;
    if (this.redisSub && !this.subscribedChannels.has(channel)) {
      this.redisSub.subscribe(channel).catch(() => {
        // Degrade gracefully
      });
      this.subscribedChannels.add(channel);
    }
  }

  /**
   * Retrieve all items currently in the Dead Letter Queue
   */
  public getDeadLetterQueue(): DeadLetterItem[] {
    return Array.from(this.dlq.values());
  }

  /**
   * Replay an event from the Dead Letter Queue
   */
  public async replay(eventId: string): Promise<boolean> {
    const item = this.dlq.get(eventId);
    if (!item) return false;

    this.dlq.delete(eventId);
    this.metrics.dlqLength = this.dlq.size;
    await this.publish(item.event.name, item.event.payload, {
      actorId: item.event.actorId,
      correlationId: item.event.correlationId,
    });
    return true;
  }

  /**
   * Clear the Dead Letter Queue
   */
  public clearDlq(): void {
    this.dlq.clear();
    this.metrics.dlqLength = 0;
  }

  /**
   * Get telemetry metrics for event bus health
   */
  public getMetrics(): EventBusMetrics {
    return {
      ...this.metrics,
      dlqLength: this.dlq.size,
    };
  }
}

export const eventBus = EventBus.getInstance();
