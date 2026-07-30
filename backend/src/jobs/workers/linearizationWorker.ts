import { Worker, Job } from "bullmq";
import { env } from "../../config/index";
import { QUEUES, registerWorker } from "../queueManager";
import { linearizationService } from "../../services/LinearizationService";

interface LinearizationJobData {
  batchSize?: number;
}

export function startLinearizationWorker(): Worker {
  const { Redis } = require("ioredis");
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker<LinearizationJobData>(
    QUEUES.LINEARIZATION,
    async (_job: Job<LinearizationJobData>) => {
      const result = await linearizationService.processBatch(_job.data.batchSize ?? 100);
      console.log(`[LinearizationWorker] Batch done:`, result);
      return result;
    },
    { connection, concurrency: 1 },
  );

  worker.on("failed", (_job, err) => {
    console.error("[LinearizationWorker] Failed:", err.message);
  });

  registerWorker(worker);
  return worker;
}
