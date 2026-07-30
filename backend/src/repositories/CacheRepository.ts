import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { StreamingMetrics, IStreamingMetrics } from "../models/StreamingMetrics";

export class CacheRepository extends BaseRepository<IStreamingMetrics> {
  constructor() {
    super(StreamingMetrics);
  }

  async findOrCreate(storagePathId: string | Types.ObjectId): Promise<IStreamingMetrics> {
    const oid = new Types.ObjectId(storagePathId);
    const existing = await this.model.findOne({ storagePathId: oid }).exec();
    if (existing) return existing;
    return this.create({ storagePathId: oid });
  }

  async getTopAccessed(limit = 50): Promise<IStreamingMetrics[]> {
    return this.model
      .find({ totalStreams: { $gt: 0 } })
      .sort({ totalStreams: -1 })
      .limit(limit)
      .populate("storagePathId", "name relativePath metadata.pdfPath")
      .exec();
  }

  async recordStreamEvent(
    storagePathId: string | Types.ObjectId,
    opts: {
      bytes: number;
      isRange: boolean;
      cacheHit: boolean;
      firstByteMs: number;
      durationMs: number;
      speedBps: number;
    },
  ): Promise<void> {
    const oid = new Types.ObjectId(storagePathId);
    const doc = await this.findOrCreate(oid);

    // Rolling average for latency and speed
    const n = doc.totalStreams;
    const newAvgFirstByte = (doc.avgFirstByteMs * n + opts.firstByteMs) / (n + 1);
    const newAvgSpeed = (doc.avgSpeedBps * n + opts.speedBps) / (n + 1);
    const newAvgDuration = (doc.avgStreamDurationMs * n + opts.durationMs) / (n + 1);

    await this.model
      .findByIdAndUpdate(doc._id, {
        $inc: {
          totalStreams: 1,
          totalBytesServed: opts.bytes,
          rangeRequestCount: opts.isRange ? 1 : 0,
          fullStreamCount: opts.isRange ? 0 : 1,
          cacheHits: opts.cacheHit ? 1 : 0,
          cacheMisses: opts.cacheHit ? 0 : 1,
        },
        $set: {
          avgFirstByteMs: newAvgFirstByte,
          avgSpeedBps: newAvgSpeed,
          avgStreamDurationMs: newAvgDuration,
          lastStreamedAt: new Date(),
          ...(opts.cacheHit ? { lastCacheHitAt: new Date() } : {}),
        },
      })
      .exec();
  }

  async getGlobalStats(): Promise<{
    totalStreams: number;
    totalBytesServed: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRatio: number;
    avgFirstByteMs: number;
    avgSpeedBps: number;
  }> {
    const agg = await this.model
      .aggregate([
        {
          $group: {
            _id: null,
            totalStreams: { $sum: "$totalStreams" },
            totalBytesServed: { $sum: "$totalBytesServed" },
            cacheHits: { $sum: "$cacheHits" },
            cacheMisses: { $sum: "$cacheMisses" },
            avgFirstByteMs: { $avg: "$avgFirstByteMs" },
            avgSpeedBps: { $avg: "$avgSpeedBps" },
          },
        },
      ])
      .exec();

    const r = agg[0] ?? {
      totalStreams: 0,
      totalBytesServed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgFirstByteMs: 0,
      avgSpeedBps: 0,
    };

    const total = r.cacheHits + r.cacheMisses;
    return {
      ...r,
      cacheHitRatio: total > 0 ? r.cacheHits / total : 0,
    };
  }
}

export const cacheRepository = new CacheRepository();
