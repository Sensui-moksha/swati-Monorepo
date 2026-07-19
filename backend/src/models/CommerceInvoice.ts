import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { CommerceHistoryEntry } from "../interfaces/commerce";

export interface ICommerceInvoice extends Document {
  invoiceNumber: string;
  user: Types.ObjectId;
  order: Types.ObjectId;
  subscription?: Types.ObjectId;
  payment?: Types.ObjectId;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  gstin?: string;
  cgst: number;
  sgst: number;
  igst: number;
  status: "draft" | "issued" | "paid" | "cancelled";
  issuedAt?: Date;
  dueAt?: Date;
  downloadUrl?: string;
  history: CommerceHistoryEntry[];
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommerceInvoiceModel extends Model<ICommerceInvoice> {
  findByInvoiceNumber(invoiceNumber: string): Promise<ICommerceInvoice | null>;
  findByOrder(orderId: Types.ObjectId): Promise<ICommerceInvoice[]>;
  findByUser(userId: Types.ObjectId): Promise<ICommerceInvoice[]>;
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

const invoiceSchema = new Schema<ICommerceInvoice, ICommerceInvoiceModel>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "CommerceOrder",
      required: true,
      index: true,
    },
    subscription: { type: Schema.Types.ObjectId, ref: "CommerceSubscription" },
    payment: { type: Schema.Types.ObjectId, ref: "CommercePayment" },
    currency: { type: String, default: "INR" },
    subtotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    gstin: { type: String, trim: true },
    cgst: { type: Number, default: 0, min: 0 },
    sgst: { type: Number, default: 0, min: 0 },
    igst: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["draft", "issued", "paid", "cancelled"],
      default: "draft",
      index: true,
    },
    issuedAt: { type: Date },
    dueAt: { type: Date },
    downloadUrl: { type: String, trim: true },
    history: { type: [historySchema], default: [] },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

invoiceSchema.index({ user: 1, createdAt: -1 });
invoiceSchema.statics.findByInvoiceNumber = function (invoiceNumber: string) {
  return this.findOne({ invoiceNumber }).exec();
};
invoiceSchema.statics.findByOrder = function (orderId: Types.ObjectId) {
  return this.find({ order: orderId }).sort({ createdAt: -1 }).exec();
};
invoiceSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.find({ user: userId }).sort({ createdAt: -1 }).exec();
};

export const CommerceInvoice = mongoose.model<
  ICommerceInvoice,
  ICommerceInvoiceModel
>("CommerceInvoice", invoiceSchema);
