import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWebhookLog extends Document {
  providerName: string;
  eventType: string;
  referenceNumber?: string;
  payload: Record<string, unknown>;
  headers: Record<string, unknown>;
  status: "received" | "verified" | "failed" | "ignored";
  response?: Record<string, unknown>;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebhookLogModel extends Model<IWebhookLog> {
  findByProvider(providerName: string): Promise<IWebhookLog[]>;
}

const webhookLogSchema = new Schema<IWebhookLog, IWebhookLogModel>(
  {
    providerName: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    referenceNumber: { type: String, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    headers: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["received", "verified", "failed", "ignored"],
      default: "received",
      index: true,
    },
    response: { type: Schema.Types.Mixed },
    processedAt: { type: Date },
  },
  { timestamps: true },
);

webhookLogSchema.statics.findByProvider = function (providerName: string) {
  return this.find({ providerName }).sort({ createdAt: -1 }).exec();
};

export const WebhookLog = mongoose.model<IWebhookLog, IWebhookLogModel>(
  "WebhookLog",
  webhookLogSchema,
);
