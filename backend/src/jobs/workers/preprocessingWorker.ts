import { Worker, Job } from "bullmq";
import { env } from "../../config/index";
import { QUEUES, registerWorker, getQueue } from "../queueManager";
import { preprocessingPipelineService } from "../../services/PreprocessingPipelineService";

interface PreprocessingJobData {
  batchSize?: number;
}

/**
 * The preprocessing pipeline worker.
 *
 * Registered as a repeatable job (cron schedule from PDF_PREPROCESSING_CRON env).
 * Each invocation processes one batch of PDFs — incremental, never blocks streaming.
 *
 * Rationale: by the time a user opens a popular issue, it is already
 * optimized and cached, resulting in much faster perceived performance
 * without slowing down the user's first request.
 */
export function startPreprocessingWorker(): Worker {
  const { Redis } = require("ioredis");
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker<PreprocessingJobData>(
    QUEUES.PREPROCESSING,
    async (_job: Job<PreprocessingJobData>) => {
      console.log("[PreprocessingWorker] Starting batch...");
      const report = await preprocessingPipelineService.runBatch(_job.data.batchSize ?? 100);
      console.log("[PreprocessingWorker] Batch complete:", JSON.stringify(report));
      return report;
    },
    { connection, concurrency: 1 },
  );

  worker.on("failed", (_job, err) => {
    console.error("[PreprocessingWorker] Failed:", err.message);
  });

  // Register repeatable cron job
  getQueue(QUEUES.PREPROCESSING)
    .add(
      "scheduled-preprocessing",
      { batchSize: 100 },
      {
        repeat: { pattern: env.PDF_PREPROCESSING_CRON },
        jobId: "preprocessing-cron",
      },
    )
    .catch((err) => console.error("[PreprocessingWorker] Failed to register cron:", err));

  registerWorker(worker);
  return worker;
}
