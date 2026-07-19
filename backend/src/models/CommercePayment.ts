import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { CommerceAuditTrailEntry, PaymentStatus } from "../interfaces/commerce";

export interface IPaymentAttempt {
  attemptNumber: number;
  providerName: string;
  referenceNumber: string;
  status: PaymentStatus;
  payload?: Record<string, unknown>;
  response?: Record<string, unknown>;
  errorMessage?: string;
  at: Date;
}

export interface ICommercePayment extends Document {
  paymentNumber: string;
  order: Types.ObjectId;
  user: Types.ObjectId;
  subscription?: Types.ObjectId;
  providerName: string;
  gatewayName: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  attempts: IPaymentAttempt[];
  auditTrail: CommerceAuditTrailEntry[];
  providerPayload?: Record<string, unknown>;
  providerResponse?: Record<string, unknown>;
  capturedAt?: Date;
  refundedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommercePaymentModel extends Model<ICommercePayment> {
  findByReferenceNumber(
    referenceNumber: string,
  ): Promise<ICommercePayment | null>;
  findByOrder(orderId: Types.ObjectId): Promise<ICommercePayment[]>;
  findByUser(userId: Types.ObjectId): Promise<ICommercePayment[]>;
}

const attemptSchema = new Schema<IPaymentAttempt>(
  {
    attemptNumber: { type: Number, required: true },
    providerName: { type: String, required: true },
    referenceNumber: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "authorized",
        "captured",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      required: true,
    },
    payload: { type: Schema.Types.Mixed },
    response: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const auditSchema = new Schema<CommerceAuditTrailEntry>(
  {
    event: { type: String, required: true },
    message: { type: String },
    metadata: { type: Schema.Types.Mixed },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const paymentSchema = new Schema<ICommercePayment, ICommercePaymentModel>(
  {
    paymentNumber: { type: String, required: true, unique: true, index: true },
    order: {
      type: Schema.Types.ObjectId,
      ref: "CommerceOrder",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subscription: { type: Schema.Types.ObjectId, ref: "CommerceSubscription" },
    providerName: { type: String, required: true, trim: true },
    gatewayName: { type: String, required: true, trim: true },
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "authorized",
        "captured",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      default: "pending",
      index: true,
    },
    attempts: { type: [attemptSchema], default: [] },
    auditTrail: { type: [auditSchema], default: [] },
    providerPayload: { type: Schema.Types.Mixed },
    providerResponse: { type: Schema.Types.Mixed },
    capturedAt: { type: Date },
    refundedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ order: 1, createdAt: -1 });
paymentSchema.statics.findByReferenceNumber = function (
  referenceNumber: string,
) {
  return this.findOne({ referenceNumber }).exec();
};
paymentSchema.statics.findByOrder = function (orderId: Types.ObjectId) {
  return this.find({ order: orderId }).sort({ createdAt: -1 }).exec();
};
paymentSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ user: userId }).sort({ createdAt: -1 }).exec();
};

export const CommercePayment = mongoose.model<
  ICommercePayment,
  ICommercePaymentModel
>("CommercePayment", paymentSchema);
