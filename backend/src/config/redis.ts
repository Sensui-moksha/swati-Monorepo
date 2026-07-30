import Redis from "ioredis";
import { env } from "./index";

let redisClient: Redis | null = null;
let connectionFailed = false;

export function getRedisClient(): Redis | null {
  if (connectionFailed) return null;
  if (redisClient) return redisClient;

  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required for BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
  });

  redisClient.on("error", (err) => {
    console.warn("[Redis] Connection error — caching disabled:", err.message);
    connectionFailed = true;
    redisClient = null;
  });

  redisClient.on("connect", () => {
    connectionFailed = false;
    console.log("[Redis] Connected");
  });

  return redisClient;
}

/** Gracefully get/set with null-safe fallback — never throws. */
export async function redisGet(key: string): Promise<string | null> {
  try {
    return await getRedisClient()?.get(key) ?? null;
  } catch {
    return null;
  }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  } catch {
    // degrade silently
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    await getRedisClient()?.del(key);
  } catch {
    // degrade silently
  }
}

export async function redisIncrBy(key: string, amount: number, ttlSeconds?: number): Promise<void> {
  try {
    const client = getRedisClient();
    if (!client) return;
    await client.incrby(key, amount);
    if (ttlSeconds) await client.expire(key, ttlSeconds);
  } catch {
    // degrade silently
  }
}
