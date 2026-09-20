import { connectDB } from "../config/db";
import { logger } from "../utils/logger";
import { startTracer } from "../utils/tracer";
import { shutdownQueues } from "../jobs/queueManager";

// BullMQ Queue Workers
import { startOptimizationWorker } from "../jobs/workers/pdfOptimizationWorker";
import { startLinearizationWorker } from "../jobs/workers/linearizationWorker";
import { startCacheWarmingWorker } from "../jobs/workers/cacheWarmingWorker";
import { startMetadataRefreshWorker } from "../jobs/workers/metadataRefreshWorker";
import { startChecksumWorker } from "../jobs/workers/checksumWorker";
import { startPreprocessingWorker } from "../jobs/workers/preprocessingWorker";

// Cron and Background Workers
import { reportingWorker } from "./ReportingWorker";
import { recommendationWorker } from "./RecommendationWorker";
import "./SearchWorker"; // Auto-registers search index worker

// Initialize tracing
startTracer();

async function startWorkers() {
  try {
    logger.info("[Worker Service] Connecting to Database...");
    await connectDB();
    logger.info("[Worker Service] Database connected successfully.");

    logger.info("[Worker Service] Starting BullMQ pipeline workers...");
    startOptimizationWorker();
    startLinearizationWorker();
    startCacheWarmingWorker();
    startMetadataRefreshWorker();
    startChecksumWorker();
    startPreprocessingWorker();
    logger.info("[Worker Service] All BullMQ pipeline workers registered.");

    logger.info("[Worker Service] Scheduling background jobs...");
    reportingWorker.startJobs();
    recommendationWorker.startJobs();
    logger.info("[Worker Service] All scheduled workers started.");

    logger.info("╔══════════════════════════════════════════════════════════════╗");
    logger.info("║  Swathi Background Worker Cluster Running Successfully       ║");
    logger.info("╚══════════════════════════════════════════════════════════════╝");
  } catch (error) {
    logger.error("[Worker Service] Fatal error during startup:", { error });
    process.exit(1);
  }
}

// Graceful shutdown handling
const handleShutdown = async (signal: string) => {
  logger.info(`[Worker Service] Received ${signal}. Draining queues and shutting down...`);
  try {
    await shutdownQueues();
    logger.info("[Worker Service] Queues closed successfully.");
    process.exit(0);
  } catch (err) {
    logger.error("[Worker Service] Error during graceful shutdown:", { err });
    process.exit(1);
  }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error("[Worker Service] Unhandled Rejection:", { reason });
});
process.on("uncaughtException", (error) => {
  logger.error("[Worker Service] Uncaught Exception:", { error });
  process.exit(1);
});

startWorkers();
