import { redisGet, redisSet, redisDel } from "../config/redis";
import { streamingRepository } from "../repositories/StreamingRepository";
import { hotCacheService } from "./HotCacheService";
import { IStoragePath } from "../models/StoragePath";


const METADATA_TTL = 3600; // 1 hour
const KEY = (id: string) => `pdf:meta:${id}`;

export interface PDFStreamingMetadata {
  id: string;
  name: string;
  pdfPath: string | null;
  fileSize: number | null;
  pageCount: number | null;
  pdfVersion: string | null;
  checksum: string | null;
  checksumSha256: string | null;
  isLinearized: boolean | null;
  optimizationStatus: string | null;
  optimizedPath: string | null;
  cacheStatus: string | null;
  streamCount: number;
  lastStreamedAt: Date | null;
  streamingEnabled: boolean;
}

export class StreamingMetadataService {
  /**
   * Returns streaming metadata for a PDF. Redis-backed with 1-hour TTL.
   * Falls back to MongoDB on Redis miss.
   */
  async getMetadata(storagePathId: string): Promise<PDFStreamingMetadata> {
    // Try Redis first
    const cached = await redisGet(KEY(storagePathId));
    if (cached) {
      return JSON.parse(cached) as PDFStreamingMetadata;
    }

    // MongoDB fallback
    const record = await streamingRepository.findPDFById(storagePathId);
    if (!record) throw new Error(`PDF not found: ${storagePathId}`);

    const { cached: inSsdCache } = await hotCacheService.isCached(
      record.metadata?.optimizedPath ?? record.metadata?.pdfPath ?? "",
    );

    const meta: PDFStreamingMetadata = this.toMetadata(record, inSsdCache);

    // Cache in Redis
    await redisSet(KEY(storagePathId), JSON.stringify(meta), METADATA_TTL);

    return meta;
  }

  /** Invalidate Redis cache for a PDF (call after optimization/linearization updates). */
  async invalidate(storagePathId: string): Promise<void> {
    await redisDel(KEY(storagePathId));
  }

  private toMetadata(record: IStoragePath, inSsdCache: boolean): PDFStreamingMetadata {
    const m = record.metadata ?? {};
    return {
      id: record._id.toString(),
      name: record.name,
      pdfPath: m.pdfPath ?? null,
      fileSize: m.fileSize ?? null,
      pageCount: m.pageCount ?? null,
      pdfVersion: (m as any).pdfVersion ?? null,
      checksum: m.checksum ?? null,
      checksumSha256: (m as any).checksumSha256 ?? null,
      isLinearized: (m as any).isLinearized ?? null,
      optimizationStatus: (m as any).optimizationStatus ?? null,
      optimizedPath: (m as any).optimizedPath ?? null,
      cacheStatus: inSsdCache ? "hot" : ((m as any).cacheStatus ?? "cold"),
      streamCount: (m as any).streamCount ?? 0,
      lastStreamedAt: (m as any).lastStreamedAt ?? null,
      streamingEnabled: (m as any).streamingEnabled !== false,
    };
  }
}

export const streamingMetadataService = new StreamingMetadataService();
