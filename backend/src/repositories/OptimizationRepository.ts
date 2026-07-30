import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import {
  PDFOptimizationJob,
  IPDFOptimizationJob,
  OptimizationProvider,
} from "../models/PDFOptimizationJob";


export class OptimizationRepository extends BaseRepository<IPDFOptimizationJob> {
  constructor() {
    super(PDFOptimizationJob);
  }

  async findPending(limit = 20): Promise<IPDFOptimizationJob[]> {
    return this.model
      .find({ status: "pending" })
      .sort({ queuedAt: 1 })
      .limit(limit)
      .exec();
  }

  async findFailed(limit = 50): Promise<IPDFOptimizationJob[]> {
    return this.model
      .find({ status: "failed" })
      .sort({ queuedAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByStoragePath(
    storagePathId: string | Types.ObjectId,
  ): Promise<IPDFOptimizationJob | null> {
    return this.model
      .findOne({ storagePathId, status: { $in: ["pending", "processing", "done"] } })
      .sort({ queuedAt: -1 })
      .exec();
  }

  async createJob(
    storagePathId: string | Types.ObjectId,
    originalPath: string,
  ): Promise<IPDFOptimizationJob> {
    return this.create({
      storagePathId: new Types.ObjectId(storagePathId),
      originalPath,
      status: "pending",
      attempt: 0,
      queuedAt: new Date(),
    });
  }

  async markProcessing(id: string | Types.ObjectId, provider: OptimizationProvider): Promise<void> {
    await this.updateById(id, {
      status: "processing",
      provider,
      startedAt: new Date(),
      $inc: { attempt: 1 },
    } as any);
  }

  async markDone(
    id: string | Types.ObjectId,
    optimizedPath: string,
    originalSize: number,
    optimizedSize: number,
  ): Promise<void> {
    const compressionRatio = originalSize > 0 ? optimizedSize / originalSize : 1;
    await this.updateById(id, {
      status: "done",
      optimizedPath,
      originalSize,
      optimizedSize,
      compressionRatio,
      completedAt: new Date(),
    });
  }

  async markFailed(id: string | Types.ObjectId, errorLog: string): Promise<void> {
    await this.updateById(id, { status: "failed", errorLog, completedAt: new Date() });
  }

  async getStats(): Promise<{
    pending: number;
    processing: number;
    done: number;
    failed: number;
    skipped: number;
    avgCompressionRatio: number;
  }> {
    const [counts, ratioAgg] = await Promise.all([
      this.model
        .aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .exec(),
      this.model
        .aggregate([
          { $match: { status: "done", compressionRatio: { $exists: true } } },
          { $group: { _id: null, avg: { $avg: "$compressionRatio" } } },
        ])
        .exec(),
    ]);

    const result = { pending: 0, processing: 0, done: 0, failed: 0, skipped: 0, avgCompressionRatio: 1 };
    for (const { _id, count } of counts) {
      if (_id in result) (result as any)[_id] = count;
    }
    result.avgCompressionRatio = ratioAgg[0]?.avg ?? 1;
    return result;
  }
}

export const optimizationRepository = new OptimizationRepository();
