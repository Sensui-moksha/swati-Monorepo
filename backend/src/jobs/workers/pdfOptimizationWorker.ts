import { Worker, Job } from "bullmq";
import { env } from "../../config/index";
import { QUEUES, registerWorker } from "../queueManager";
import { pdfOptimizationService } from "../../services/PDFOptimizationService";

interface OptimizationJobData {
  jobId: string;
}

export function startOptimizationWorker(): Worker {
  const { Redis } = require("ioredis");
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker<OptimizationJobData>(
    QUEUES.PDF_OPTIMIZATION,
    async (job: Job<OptimizationJobData>) => {
      console.log(`[OptimizationWorker] Processing job ${job.data.jobId}`);
      await pdfOptimizationService.processJob(job.data.jobId);
    },
    {
      connection,
      concurrency: env.PDF_OPTIMIZATION_CONCURRENCY,
    },
  );

  worker.on("completed", (job) => {
    console.log(`[OptimizationWorker] Job ${job.data.jobId} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[OptimizationWorker] Job ${job?.data.jobId} failed:`, err.message);
  });

  registerWorker(worker);
  return worker;
}
