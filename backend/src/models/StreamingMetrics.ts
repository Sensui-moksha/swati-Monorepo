import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStreamingMetrics extends Document {
  _id: Types.ObjectId;
  storagePathId: Types.ObjectId;
  totalStreams: number;
  totalBytesServed: number;
  rangeRequestCount: number;
  fullStreamCount: number;
  cacheHits: number;
  cacheMisses: number;
  avgFirstByteMs: number;
  avgSpeedBps: number;
  avgStreamDurationMs: number;
  lastStreamedAt?: Date;
  lastCacheHitAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IStreamingMetrics>(
  {
    storagePathId: {
      type: Schema.Types.ObjectId,
      ref: "StoragePath",
      required: true,
      unique: true,
      index: true,
    },
    totalStreams: { type: Number, default: 0, min: 0 },
    totalBytesServed: { type: Number, default: 0, min: 0 },
    rangeRequestCount: { type: Number, default: 0, min: 0 },
    fullStreamCount: { type: Number, default: 0, min: 0 },
    cacheHits: { type: Number, default: 0, min: 0 },
    cacheMisses: { type: Number, default: 0, min: 0 },
    avgFirstByteMs: { type: Number, default: 0, min: 0 },
    avgSpeedBps: { type: Number, default: 0, min: 0 },
    avgStreamDurationMs: { type: Number, default: 0, min: 0 },
    lastStreamedAt: { type: Date },
    lastCacheHitAt: { type: Date },
  },
  { timestamps: true },
);

schema.index({ totalStreams: -1 });
schema.index({ lastStreamedAt: -1 });

export const StreamingMetrics = mongoose.model<IStreamingMetrics>(
  "StreamingMetrics",
  schema,
);
