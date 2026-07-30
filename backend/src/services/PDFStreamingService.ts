import { Response } from "express";
import fs from "fs";
import { storageService } from "./StorageService";
import { hotCacheService } from "./HotCacheService";
import { rangeRequestService } from "./RangeRequestService";
import { streamingRepository } from "../repositories/StreamingRepository";
import { cacheRepository } from "../repositories/CacheRepository";
import { ApiError } from "../middleware/errorHandler";

export class PDFStreamingService {
  /**
   * Core streaming method. Handles both range and full-file requests.
   * Uses SSD cache when available, falls back to StorageService.streamFile().
   * Records metrics asynchronously — never blocks the stream.
   */
  async streamPDF(
    storagePathId: string,
    rangeHeader: string | undefined,
    res: Response,
  ): Promise<void> {
    const startTime = Date.now();

    // 1. Resolve storage record
    const record = await streamingRepository.findPDFById(storagePathId);
    if (!record) throw new ApiError("PDF not found", 404);
    if (!record.metadata?.pdfPath) throw new ApiError("PDF path not configured", 404);
    if (record.metadata?.streamingEnabled === false)
      throw new ApiError("Streaming disabled for this PDF", 403);

    const pdfPath = rangeRequestService.sanitizePath(record.metadata.pdfPath);

    // 2. Determine effective path — optimized copy if available
    const effectivePath = record.metadata?.optimizedPath ?? pdfPath;

    // 3. Get file size
    const fileSize = await this.resolveFileSize(record, effectivePath);
    if (fileSize === 0) throw new ApiError("PDF is empty or inaccessible", 404);

    // 4. Parse Range header
    const range = rangeRequestService.parseRangeHeader(rangeHeader, fileSize);

    // 5. Check SSD cache
    const { cached, cachePath } = await hotCacheService.isCached(effectivePath);

    // 6. Set response headers
    if (range) {
      res.status(206);
      const headers = rangeRequestService.buildPartialHeaders(range, fileSize);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    } else {
      res.status(200);
      const headers = rangeRequestService.buildFullHeaders(fileSize);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    }

    res.setHeader("X-Cache", cached ? "HIT" : "MISS");
    res.setHeader("X-PDF-Linearized", String(record.metadata?.isLinearized ?? false));

    // 7. Stream
    const firstByteTime = Date.now() - startTime;
    let bytesSent = 0;

    if (cached && cachePath) {
      // Direct fs.createReadStream from SSD — fastest path
      const streamOpts = range
        ? { start: range.start, end: range.end }
        : undefined;
      const fileStream = fs.createReadStream(cachePath, streamOpts);

      await new Promise<void>((resolve, reject) => {
        fileStream.on("data", (chunk: Buffer | string) => { bytesSent += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk); });
        fileStream.on("error", reject);
        fileStream.pipe(res);
        res.on("finish", resolve);
        res.on("close", () => { fileStream.destroy(); resolve(); });
      });
    } else {
      // Delegate to StorageService — provider-agnostic (S3/local/Azure etc.)
      const streamOptions = range
        ? { range: { start: range.start, end: range.end } }
        : undefined;
      const readable = await storageService.streamFile(effectivePath, streamOptions as any);

      await new Promise<void>((resolve, reject) => {
        readable.on("data", (chunk: Buffer | string) => { bytesSent += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk); });
        readable.on("error", reject);
        readable.pipe(res);
        res.on("finish", resolve);
        res.on("close", () => { readable.destroy(); resolve(); });
      });
    }

    // 8. Record metrics async — never await
    const durationMs = Date.now() - startTime;
    const speedBps = durationMs > 0 ? (bytesSent * 1000) / durationMs : 0;

    this.recordMetricsAsync(storagePathId, {
      bytes: bytesSent,
      isRange: !!range,
      cacheHit: cached,
      firstByteMs: firstByteTime,
      durationMs,
      speedBps,
    });
  }

  private async resolveFileSize(
    record: Awaited<ReturnType<typeof streamingRepository.findPDFById>>,
    effectivePath: string,
  ): Promise<number> {
    // Prefer stored metadata — avoids a stat call on every request
    if (record?.metadata?.fileSize && record.metadata.fileSize > 0) {
      return record.metadata.fileSize;
    }
    // Fall back to fs.stat for local paths
    try {
      const stat = await fs.promises.stat(effectivePath);
      return stat.size;
    } catch {
      return 0;
    }
  }

  private recordMetricsAsync(
    storagePathId: string,
    opts: {
      bytes: number;
      isRange: boolean;
      cacheHit: boolean;
      firstByteMs: number;
      durationMs: number;
      speedBps: number;
    },
  ): void {
    // Fire-and-forget — metric writes must never slow down streaming
    Promise.all([
      streamingRepository.incrementStreamCount(storagePathId),
      cacheRepository.recordStreamEvent(storagePathId, opts),
    ]).catch((err) => console.error("[PDFStreamingService] metric write failed:", err));
  }
}

export const pdfStreamingService = new PDFStreamingService();
