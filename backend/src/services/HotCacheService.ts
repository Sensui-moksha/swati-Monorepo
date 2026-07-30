import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import { env } from "../config/index";
import { streamingRepository } from "../repositories/StreamingRepository";

interface CacheStats {
  fileCount: number;
  totalSizeBytes: number;
  totalSizeGB: number;
  maxSizeGB: number;
  utilizationPercent: number;
  cacheDir: string;
}

export class HotCacheService {
  private readonly cacheDir: string;
  private readonly maxSizeBytes: number;
  private readonly ttlMs: number;

  constructor() {
    this.cacheDir = env.PDF_SSD_CACHE_DIR;
    this.maxSizeBytes = env.PDF_CACHE_MAX_SIZE_GB * 1024 ** 3;
    this.ttlMs = env.PDF_CACHE_TTL_HOURS * 3_600_000;
  }

  /** Map a storage path to its cache path. */
  private toCachePath(relativePath: string): string {
    // Use the last two path components to create shallow subdirs
    const parts = relativePath.replace(/\\/g, "/").split("/").filter(Boolean);
    const subdir = parts.length >= 2 ? (parts.slice(-2, -1)[0] ?? "root") : "root";
    const filename = parts[parts.length - 1] ?? path.basename(relativePath);
    return path.join(this.cacheDir, subdir, filename);
  }

  async isCached(relativePath: string): Promise<{ cached: boolean; cachePath: string | null }> {
    const cachePath = this.toCachePath(relativePath);
    try {
      const stat = await fs.promises.stat(cachePath);
      // Check TTL
      const age = Date.now() - stat.mtimeMs;
      if (age > this.ttlMs) {
        // Expired — evict silently
        fs.promises.unlink(cachePath).catch(() => {});
        return { cached: false, cachePath: null };
      }
      return { cached: true, cachePath };
    } catch {
      return { cached: false, cachePath: null };
    }
  }

  /**
   * Warm a specific PDF into the SSD cache.
   * Reads from the source path, writes to cache.
   * Evicts old files first if over capacity.
   */
  async warmCache(
    storagePathId: string | Types.ObjectId,
    sourcePath: string,
  ): Promise<{ cachePath: string; alreadyCached: boolean }> {
    const { cached, cachePath: existingPath } = await this.isCached(sourcePath);
    if (cached && existingPath) {
      return { cachePath: existingPath, alreadyCached: true };
    }

    await this.ensureCapacity();

    const cachePath = this.toCachePath(sourcePath);
    await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });

    // Stream copy — never load the whole PDF into memory
    const src = fs.createReadStream(sourcePath);
    const dst = fs.createWriteStream(cachePath);
    await new Promise<void>((resolve, reject) => {
      src.pipe(dst);
      dst.on("finish", resolve);
      dst.on("error", reject);
      src.on("error", reject);
    });

    await streamingRepository.updateCacheStatus(storagePathId, "hot");
    return { cachePath, alreadyCached: false };
  }

  /**
   * Evict a specific file from cache.
   */
  async evict(relativePath: string): Promise<void> {
    const cachePath = this.toCachePath(relativePath);
    await fs.promises.unlink(cachePath).catch(() => {});
  }

  /**
   * Remove all expired files and enforce max size.
   */
  async evictExpired(): Promise<{ evicted: number; freedBytes: number }> {
    let evicted = 0;
    let freedBytes = 0;

    try {
      const entries = await this.getAllCacheEntries();
      const now = Date.now();

      for (const entry of entries) {
        const age = now - entry.mtime;
        if (age > this.ttlMs) {
          await fs.promises.unlink(entry.fullPath).catch(() => {});
          evicted++;
          freedBytes += entry.size;
        }
      }
    } catch (err) {
      console.error("[HotCacheService] evictExpired error:", err);
    }

    return { evicted, freedBytes };
  }

  private async ensureCapacity(): Promise<void> {
    const entries = await this.getAllCacheEntries();
    const totalSize = entries.reduce((sum, e) => sum + e.size, 0);

    if (totalSize < this.maxSizeBytes) return;

    // Evict oldest first (LRU by mtime)
    entries.sort((a, b) => a.mtime - b.mtime);
    let freed = 0;
    const target = this.maxSizeBytes * 0.2; // free 20%

    for (const entry of entries) {
      if (freed >= target) break;
      await fs.promises.unlink(entry.fullPath).catch(() => {});
      freed += entry.size;
    }
  }

  private async getAllCacheEntries(): Promise<
    Array<{ fullPath: string; size: number; mtime: number }>
  > {
    const results: Array<{ fullPath: string; size: number; mtime: number }> = [];
    try {
      await this.walkDir(this.cacheDir, results);
    } catch {
      // Cache dir may not exist yet
    }
    return results;
  }

  private async walkDir(
    dir: string,
    acc: Array<{ fullPath: string; size: number; mtime: number }>,
  ): Promise<void> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this.walkDir(fullPath, acc);
      } else if (entry.isFile()) {
        const stat = await fs.promises.stat(fullPath);
        acc.push({ fullPath, size: stat.size, mtime: stat.mtimeMs });
      }
    }
  }

  async getStats(): Promise<CacheStats> {
    const entries = await this.getAllCacheEntries();
    const totalSizeBytes = entries.reduce((sum, e) => sum + e.size, 0);
    const totalSizeGB = totalSizeBytes / 1024 ** 3;

    return {
      fileCount: entries.length,
      totalSizeBytes,
      totalSizeGB,
      maxSizeGB: env.PDF_CACHE_MAX_SIZE_GB,
      utilizationPercent: (totalSizeBytes / this.maxSizeBytes) * 100,
      cacheDir: this.cacheDir,
    };
  }

  /**
   * Warm cache for top N most-accessed PDFs.
   * Called by the cache-warming worker.
   */
  async warmTopFiles(limit = 20): Promise<{ warmed: number; errors: number }> {
    const hotFiles = await streamingRepository.findHotFiles(limit);
    let warmed = 0;
    let errors = 0;

    for (const file of hotFiles) {
      const pdfPath = file.metadata?.optimizedPath ?? file.metadata?.pdfPath;
      if (!pdfPath) continue;

      try {
        await fs.promises.access(pdfPath, fs.constants.R_OK);
        await this.warmCache(file._id, pdfPath);
        warmed++;
      } catch (err) {
        errors++;
        console.error(`[HotCacheService] Failed to warm ${pdfPath}:`, err);
      }
    }

    return { warmed, errors };
  }
}

export const hotCacheService = new HotCacheService();
