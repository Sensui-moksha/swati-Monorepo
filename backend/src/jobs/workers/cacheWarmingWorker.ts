import { Worker, Job } from "bullmq";
import { env } from "../../config/index";
import { QUEUES, registerWorker } from "../queueManager";
import { hotCacheService } from "../../services/HotCacheService";

interface CacheWarmingJobData {
  limit?: number;
  evictExpired?: boolean;
}

export function startCacheWarmingWorker(): Worker {
  const { Redis } = require("ioredis");
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker<CacheWarmingJobData>(
    QUEUES.CACHE_WARMING,
    async (_job: Job<CacheWarmingJobData>) => {
      if (_job.data.evictExpired) {
        const evicted = await hotCacheService.evictExpired();
        console.log(`[CacheWarmingWorker] Evicted ${evicted.evicted} files`);
      }
      const result = await hotCacheService.warmTopFiles(_job.data.limit ?? 20);
      console.log(`[CacheWarmingWorker] Warmed ${result.warmed} files`);
      return result;
    },
    { connection, concurrency: 1 },
  );

  worker.on("failed", (_job, err) => {
    console.error("[CacheWarmingWorker] Failed:", err.message);
  });

  registerWorker(worker);
  return worker;
}
