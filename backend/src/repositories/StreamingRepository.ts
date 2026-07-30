import { Types } from "mongoose";

import { BaseRepository } from "./BaseRepository";
import { StoragePath, IStoragePath } from "../models/StoragePath";

/**
 * Streaming-focused queries on StoragePath.
 * Extends BaseRepository — does NOT duplicate StorageRepository.
 */
export class StreamingRepository extends BaseRepository<IStoragePath> {
  constructor() {
    super(StoragePath);
  }

  /** PDFs eligible for linearization check (no isLinearized field yet). */
  async findPDFsNeedingLinearizationCheck(limit = 100): Promise<IStoragePath[]> {
    return this.model
      .find({
        isDeleted: false,
        "metadata.pdfPath": { $exists: true, $ne: null },
        "metadata.isLinearized": { $exists: false },
      })
      .sort({ "metadata.lastStreamedAt": -1 })
      .limit(limit)
      .exec();
  }

  /** PDFs that need optimization (non-linearized, no optimized copy yet). */
  async findPDFsNeedingOptimization(limit = 50): Promise<IStoragePath[]> {
    return this.model
      .find({
        isDeleted: false,
        "metadata.pdfPath": { $exists: true, $ne: null },
        "metadata.isLinearized": false,
        "metadata.optimizationStatus": { $nin: ["processing", "done"] },
      })
      .sort({ "metadata.streamCount": -1 })
      .limit(limit)
      .exec();
  }

  /** Most-accessed PDFs — candidates for SSD cache warming. */
  async findHotFiles(limit = 50): Promise<IStoragePath[]> {
    return this.model
      .find({
        isDeleted: false,
        "metadata.pdfPath": { $exists: true, $ne: null },
        "metadata.streamCount": { $gt: 0 },
      })
      .sort({ "metadata.streamCount": -1, "metadata.lastStreamedAt": -1 })
      .limit(limit)
      .exec();
  }

  /** Find by storagePathId (alias for findById with PDF guard). */
  async findPDFById(id: string | Types.ObjectId): Promise<IStoragePath | null> {
    return this.model
      .findOne({ _id: id, isDeleted: false, "metadata.pdfPath": { $exists: true } })
      .exec();
  }

  async markLinearized(
    id: string | Types.ObjectId,
    isLinearized: boolean,
    pdfVersion?: string,
  ): Promise<IStoragePath | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            "metadata.isLinearized": isLinearized,
            ...(pdfVersion ? { "metadata.pdfVersion": pdfVersion } : {}),
          },
        },
        { new: true },
      )
      .exec();
  }

  async markOptimized(
    id: string | Types.ObjectId,
    optimizedPath: string,
  ): Promise<IStoragePath | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            "metadata.optimizationStatus": "done",
            "metadata.optimizationDate": new Date(),
            "metadata.optimizedPath": optimizedPath,
          },
        },
        { new: true },
      )
      .exec();
  }

  async updateOptimizationStatus(
    id: string | Types.ObjectId,
    status: IStoragePath["metadata"]["optimizationStatus"],
  ): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, { $set: { "metadata.optimizationStatus": status } })
      .exec();
  }

  async updateCacheStatus(
    id: string | Types.ObjectId,
    cacheStatus: "hot" | "cold" | "warming",
  ): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, { $set: { "metadata.cacheStatus": cacheStatus } })
      .exec();
  }

  async incrementStreamCount(id: string | Types.ObjectId): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, {
        $inc: { "metadata.streamCount": 1 },
        $set: { "metadata.lastStreamedAt": new Date() },
      })
      .exec();
  }

  /** PDFs in archive with no stream data (cold start for preprocessing). */
  async findUnprocessedPDFs(batchSize = 200): Promise<IStoragePath[]> {
    return this.model
      .find({
        isDeleted: false,
        "metadata.pdfPath": { $exists: true, $ne: null },
        $or: [
          { "metadata.isLinearized": { $exists: false } },
          { "metadata.checksumSha256": { $exists: false } },
        ],
      })
      .sort({ lastScanned: 1 })
      .limit(batchSize)
      .exec();
  }

  async updateChecksumSha256(
    id: string | Types.ObjectId,
    checksumSha256: string,
  ): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, { $set: { "metadata.checksumSha256": checksumSha256 } })
      .exec();
  }
}

export const streamingRepository = new StreamingRepository();
