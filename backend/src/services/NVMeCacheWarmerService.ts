import { Publication } from "../models/Publication";
import { MagazineIssue } from "../models/MagazineIssue";
import { Book } from "../models/Book";
import { StoragePath } from "../models/StoragePath";
import { hotCacheService } from "./HotCacheService";
import { logger } from "../utils/logger";
import fs from "fs";

export interface CacheWarmerMetrics {
  totalScanned: number;
  totalWarmed: number;
  totalSkipped: number;
  totalFailed: number;
  durationMs: number;
}

export class NVMeCacheWarmerService {
  private isRunning = false;
  private metrics: CacheWarmerMetrics = {
    totalScanned: 0,
    totalWarmed: 0,
    totalSkipped: 0,
    totalFailed: 0,
    durationMs: 0,
  };

  /**
   * Run cache warm-up asynchronously in the background on startup
   */
  public startBackgroundWarmup(): void {
    if (this.isRunning) {
      logger.warn("[NVMeCacheWarmer] Warmup job already in progress, skipping start");
      return;
    }

    setImmediate(async () => {
      try {
        await this.warmUp();
      } catch (err: any) {
        logger.error("[NVMeCacheWarmer] Unhandled error during background warm-up:", {
          message: err?.message || err,
        });
      }
    });
  }

  /**
   * Core warmup logic: Pre-caches latest publications, top 20 active issues, and trending books
   */
  public async warmUp(): Promise<CacheWarmerMetrics> {
    this.isRunning = true;
    const startTime = Date.now();
    logger.info("[NVMeCacheWarmer] 🚀 Starting automatic NVMe cache warm-up...");

    this.metrics = {
      totalScanned: 0,
      totalWarmed: 0,
      totalSkipped: 0,
      totalFailed: 0,
      durationMs: 0,
    };

    try {
      // 1. Fetch latest active publications (top 10)
      const latestPublications = await Publication.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec()
        .catch(() => []);

      // 2. Fetch top 20 active issues
      const topIssues = await MagazineIssue.find({ isDeleted: false })
        .sort({ issueDate: -1 })
        .limit(20)
        .lean()
        .exec()
        .catch(() => []);

      // 3. Fetch trending books
      const trendingBooks = await Book.find({ isTrending: true, isDeleted: false })
        .limit(10)
        .lean()
        .exec()
        .catch(() => []);

      const candidateIds = [
        ...latestPublications.map((p) => p._id),
        ...topIssues.map((i) => i._id),
        ...trendingBooks.map((b) => b._id),
      ];

      this.metrics.totalScanned = candidateIds.length;

      // 4. Query matching storage paths for these entities
      const storageRecords = await StoragePath.find({
        isDeleted: false,
        $or: [
          { "metadata.publication": { $in: candidateIds } },
          { "metadata.issue": { $in: candidateIds } },
          { "metadata.book": { $in: candidateIds } },
        ],
      })
        .lean()
        .exec()
        .catch(() => []);

      for (const record of storageRecords) {
        const filePath = record.path;
        if (!filePath) {
          this.metrics.totalSkipped++;
          continue;
        }

        try {
          // Verify file exists on disk
          if (fs.existsSync(filePath)) {
            const { alreadyCached } = await hotCacheService.warmCache(record._id, filePath);
            if (alreadyCached) {
              this.metrics.totalSkipped++;
            } else {
              this.metrics.totalWarmed++;
            }
          } else {
            this.metrics.totalSkipped++;
          }
        } catch (warmError: any) {
          this.metrics.totalFailed++;
          logger.warn(`[NVMeCacheWarmer] Failed to warm cache for ${record.path}: ${warmError?.message}`);
        }
      }
    } catch (error: any) {
      logger.error("[NVMeCacheWarmer] Error during cache warm-up execution:", error);
    } finally {
      this.metrics.durationMs = Date.now() - startTime;
      this.isRunning = false;
      logger.info(
        `[NVMeCacheWarmer] Completed in ${this.metrics.durationMs}ms: ` +
          `${this.metrics.totalWarmed} warmed, ${this.metrics.totalSkipped} skipped, ${this.metrics.totalFailed} failed.`
      );
    }

    return this.metrics;
  }

  public getMetrics(): CacheWarmerMetrics & { isRunning: boolean } {
    return {
      ...this.metrics,
      isRunning: this.isRunning,
    };
  }
}

export const nvmeCacheWarmerService = new NVMeCacheWarmerService();
