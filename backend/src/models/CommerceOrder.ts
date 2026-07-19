import mongoose, { Document, Model, Schema, Types } from "mongoose";
import {
  CommerceHistoryEntry,
  CommerceLineItem,
  OrderStatus,
} from "../interfaces/commerce";

export interface ICommerceOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: CommerceLineItem[];
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  couponCode?: string;
  plan?: Types.ObjectId;
  subscription?: Types.ObjectId;
  payment?: Types.ObjectId;
  history: CommerceHistoryEntry[];
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommerceOrderModel extends Model<ICommerceOrder> {
  findByOrderNumber(orderNumber: string): Promise<ICommerceOrder | null>;
  findByUser(userId: Types.ObjectId): Promise<ICommerceOrder[]>;
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

const lineItemSchema = new Schema<CommerceLineItem>(
  {
    type: {
      type: String,
      enum: [
        "plan",
        "book",
        "publication",
        "magazine_issue",
        "subscription",
        "custom",
      ],
      required: true,
    },
    resourceId: { type: Schema.Types.ObjectId },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema<ICommerceOrder, ICommerceOrderModel>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [lineItemSchema], default: [] },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "awaiting_payment",
        "paid",
        "failed",
        "cancelled",
        "completed",
        "refund_pending",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    couponCode: { type: String, trim: true },
    plan: { type: Schema.Types.ObjectId, ref: "Plan" },
    subscription: { type: Schema.Types.ObjectId, ref: "CommerceSubscription" },
    payment: { type: Schema.Types.ObjectId, ref: "CommercePayment" },
    history: { type: [historySchema], default: [] },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.statics.findByOrderNumber = function (orderNumber: string) {
  return this.findOne({ orderNumber }).exec();
};
orderSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ user: userId }).sort({ createdAt: -1 }).exec();
};

export const CommerceOrder = mongoose.model<
  ICommerceOrder,
  ICommerceOrderModel
>("CommerceOrder", orderSchema);
