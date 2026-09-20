import mongoose, { Schema, Document } from "mongoose";

export interface IDRMSecurityEvent extends Document {
  userId?: mongoose.Types.ObjectId;
  eventType:
    | "concurrent_limit_breach"
    | "invalid_token"
    | "expired_token"
    | "ip_mismatch"
    | "unauthorized_download_attempt"
    | "tampering_detected";
  bookId?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const DRMSecurityEventSchema = new Schema<IDRMSecurityEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        "concurrent_limit_breach",
        "invalid_token",
        "expired_token",
        "ip_mismatch",
        "unauthorized_download_attempt",
        "tampering_detected",
      ],
    },
    bookId: { type: String, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 }, // 90 days retention
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DRMSecurityEvent = mongoose.model<IDRMSecurityEvent>(
  "DRMSecurityEvent",
  DRMSecurityEventSchema
);
