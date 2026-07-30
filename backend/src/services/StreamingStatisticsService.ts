import { cacheRepository } from "../repositories/CacheRepository";
import { optimizationRepository } from "../repositories/OptimizationRepository";
import { hotCacheService } from "./HotCacheService";
import { storageService } from "./StorageService";

export interface StreamingPerformanceReport {
  global: {
    totalStreams: number;
    totalBytesServed: number;
    totalBytesServedGB: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRatio: number;
    avgFirstByteMs: number;
    avgSpeedBps: number;
    avgSpeedMBps: number;
  };
  optimization: {
    pending: number;
    processing: number;
    done: number;
    failed: number;
    skipped: number;
    avgCompressionRatio: number;
    optimizationCoveragePercent?: number;
  };
  ssdCache: {
    fileCount: number;
    totalSizeGB: number;
    maxSizeGB: number;
    utilizationPercent: number;
  };
  storage: {
    totalSizeBytes?: number;
    fileCount?: number;
    freeSpaceBytes?: number;
  };
}

export class StreamingStatisticsService {
  async getPerformanceReport(): Promise<StreamingPerformanceReport> {
    const [globalStats, optStats, cacheStats, storageStats] = await Promise.allSettled([
      cacheRepository.getGlobalStats(),
      optimizationRepository.getStats(),
      hotCacheService.getStats(),
      storageService.getStorageStats(),
    ]);

    const global =
      globalStats.status === "fulfilled"
        ? globalStats.value
        : { totalStreams: 0, totalBytesServed: 0, cacheHits: 0, cacheMisses: 0, cacheHitRatio: 0, avgFirstByteMs: 0, avgSpeedBps: 0 };

    const opt =
      optStats.status === "fulfilled"
        ? optStats.value
        : { pending: 0, processing: 0, done: 0, failed: 0, skipped: 0, avgCompressionRatio: 1 };

    const ssd =
      cacheStats.status === "fulfilled"
        ? cacheStats.value
        : { fileCount: 0, totalSizeGB: 0, maxSizeGB: 0, utilizationPercent: 0 };

    const storage =
      storageStats.status === "fulfilled"
        ? {
            totalSizeBytes: storageStats.value.usedSpace,
            fileCount: storageStats.value.fileCount,
            freeSpaceBytes: storageStats.value.freeSpace,
          }
        : {};

    return {
      global: {
        ...global,
        totalBytesServedGB: global.totalBytesServed / 1024 ** 3,
        avgSpeedMBps: global.avgSpeedBps / (1024 * 1024),
      },
      optimization: opt,
      ssdCache: {
        fileCount: ssd.fileCount,
        totalSizeGB: ssd.totalSizeGB,
        maxSizeGB: ssd.maxSizeGB,
        utilizationPercent: ssd.utilizationPercent,
      },
      storage,
    };
  }

  async getTopStreamedPDFs(limit = 20) {
    return cacheRepository.getTopAccessed(limit);
  }
}

export const streamingStatisticsService = new StreamingStatisticsService();
