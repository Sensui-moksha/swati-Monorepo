import { Queue, Worker, JobsOptions } from "bullmq";

import { getRedisClient } from "../config/redis";
import { env } from "../config/index";

// Queue names — single source of truth
export const QUEUES = {
  PDF_OPTIMIZATION: "pdf-optimization",
  LINEARIZATION: "pdf-linearization",
  CACHE_WARMING: "cache-warming",
  METADATA_REFRESH: "metadata-refresh",
  CHECKSUM_VERIFICATION: "checksum-verification",
  PREPROCESSING: "preprocessing-pipeline",
} as const;

type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

const queues = new Map<QueueName, Queue>();
const workers: Worker[] = [];

function connection() {
  // BullMQ requires a dedicated ioredis connection (not the shared client)
  const { Redis } = require("ioredis");
  return new Redis(env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false });
}

export function getQueue(name: QueueName): Queue {
  if (!queues.has(name)) {
    queues.set(
      name,
      new Queue(name, {
        connection: connection(),
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 200 },
        } satisfies JobsOptions,
      }),
    );
  }
  return queues.get(name)!;
}

export function registerWorker(worker: Worker): void {
  workers.push(worker);
}

export async function addJob(
  queueName: QueueName,
  jobName: string,
  data: unknown,
  opts?: JobsOptions,
): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    console.warn(`[QueueManager] Redis unavailable — skipping job ${queueName}/${jobName}`);
    return;
  }
  await getQueue(queueName).add(jobName, data, opts);
}

/** Graceful shutdown — drain queues and close workers. */
export async function shutdownQueues(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
  await Promise.all([...queues.values()].map((q) => q.close()));
  queues.clear();
}
