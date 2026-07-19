import mongoose, { Document, Model, Schema, Types } from "mongoose";
import {
  CommerceHistoryEntry,
  SubscriptionStatus,
} from "../interfaces/commerce";

export interface ICommerceSubscription extends Document {
  subscriptionNumber: string;
  user: Types.ObjectId;
  plan: Types.ObjectId;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  trialEndsAt?: Date;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  nextBillingAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  cancelledAt?: Date;
  expiredAt?: Date;
  autoRenew: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  history: CommerceHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommerceSubscriptionModel extends Model<ICommerceSubscription> {
  findByUser(userId: Types.ObjectId): Promise<ICommerceSubscription[]>;
  findActiveByUser(
    userId: Types.ObjectId,
  ): Promise<ICommerceSubscription | null>;
}

const historySchema = new Schema<CommerceHistoryEntry>(
  {
    action: { type: String, required: true },
    from: { type: String },
    to: { type: String },
    note: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const subscriptionSchema = new Schema<
  ICommerceSubscription,
  ICommerceSubscriptionModel
>(
  {
    subscriptionNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "trial",
        "active",
        "paused",
        "renewing",
        "expired",
        "cancelled",
        "suspended",
      ],
      default: "trial",
      index: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    trialEndsAt: { type: Date },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    nextBillingAt: { type: Date },
    pausedAt: { type: Date },
    resumedAt: { type: Date },
    cancelledAt: { type: Date },
    expiredAt: { type: Date },
    autoRenew: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true },
);

subscriptionSchema.index({ user: 1, status: 1, createdAt: -1 });
subscriptionSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ user: userId }).sort({ createdAt: -1 }).exec();
};
subscriptionSchema.statics.findActiveByUser = function (
  userId: Types.ObjectId,
) {
  return this.findOne({
    user: userId,
    status: { $in: ["trial", "active", "renewing", "paused"] },
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .exec();
};

export const CommerceSubscription = mongoose.model<
  ICommerceSubscription,
  ICommerceSubscriptionModel
>("CommerceSubscription", subscriptionSchema);
