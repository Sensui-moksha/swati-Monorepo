import mongoose, { Document, Schema, Types } from "mongoose";


export type OptimizationProvider = "ghostscript" | "qpdf" | "mupdf" | "ocrmypdf";
export type OptimizationJobStatus = "pending" | "processing" | "done" | "failed" | "skipped";

export interface IPDFOptimizationJob extends Document {
  _id: Types.ObjectId;
  storagePathId: Types.ObjectId;
  originalPath: string;
  optimizedPath?: string;
  provider?: OptimizationProvider;
  status: OptimizationJobStatus;
  attempt: number;
  maxAttempts: number;
  errorLog?: string;
  originalSize?: number;
  optimizedSize?: number;
  compressionRatio?: number;
  isLinearized?: boolean;
  startedAt?: Date;
  completedAt?: Date;
  queuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IPDFOptimizationJob>(
  {
    storagePathId: { type: Schema.Types.ObjectId, ref: "StoragePath", required: true, index: true },
    originalPath: { type: String, required: true, trim: true },
    optimizedPath: { type: String, trim: true },
    provider: { type: String, enum: ["ghostscript", "qpdf", "mupdf", "ocrmypdf"] },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "failed", "skipped"],
      default: "pending",
      index: true,
    },
    attempt: { type: Number, default: 0, min: 0 },
    maxAttempts: { type: Number, default: 3 },
    errorLog: { type: String, trim: true },
    originalSize: { type: Number, min: 0 },
    optimizedSize: { type: Number, min: 0 },
    compressionRatio: { type: Number, min: 0 },
    isLinearized: { type: Boolean },
    startedAt: { type: Date },
    completedAt: { type: Date },
    queuedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

schema.index({ storagePathId: 1, status: 1 });
schema.index({ status: 1, queuedAt: 1 });
schema.index({ status: 1, attempt: 1 });

export const PDFOptimizationJob = mongoose.model<IPDFOptimizationJob>(
  "PDFOptimizationJob",
  schema,
);
