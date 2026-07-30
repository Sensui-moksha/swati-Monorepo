import { Worker, Job } from "bullmq";
import { env } from "../../config/index";
import { QUEUES, registerWorker } from "../queueManager";
import { streamingMetadataService } from "../../services/StreamingMetadataService";
import { streamingRepository } from "../../repositories/StreamingRepository";

interface MetadataRefreshJobData {
  storagePathId?: string;
  batchSize?: number;
}

export function startMetadataRefreshWorker(): Worker {
  const { Redis } = require("ioredis");
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker<MetadataRefreshJobData>(
    QUEUES.METADATA_REFRESH,
    async (_job: Job<MetadataRefreshJobData>) => {
      if (_job.data.storagePathId) {
        // Single PDF invalidation
        await streamingMetadataService.invalidate(_job.data.storagePathId);
        console.log(`[MetadataRefreshWorker] Invalidated ${_job.data.storagePathId}`);
        return;
      }

      // Batch: refresh top-streamed PDFs
      const hot = await streamingRepository.findHotFiles(_job.data.batchSize ?? 50);
      let refreshed = 0;
      for (const record of hot) {
        await streamingMetadataService.invalidate(record._id.toString());
        refreshed++;
      }
      console.log(`[MetadataRefreshWorker] Refreshed ${refreshed} entries`);
    },
    { connection, concurrency: 2 },
  );

  worker.on("failed", (_job, err) => {
    console.error("[MetadataRefreshWorker] Failed:", err.message);
  });

  registerWorker(worker);
  return worker;
}
