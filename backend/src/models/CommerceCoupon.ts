import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ICommerceCoupon extends Document {
  code: string;
  title: string;
  description?: string;
  type: "percentage" | "flat";
  value: number;
  expiryAt?: Date;
  usageLimit?: number;
  usageCount: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  applicablePlans: Types.ObjectId[];
  applicableBooks: Types.ObjectId[];
  applicableCategories: Types.ObjectId[];
  isActive: boolean;
  isArchived: boolean;
  archivedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommerceCouponModel extends Model<ICommerceCoupon> {
  findByCode(code: string): Promise<ICommerceCoupon | null>;
  findActive(): Promise<ICommerceCoupon[]>;
}

const couponSchema = new Schema<ICommerceCoupon, ICommerceCouponModel>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    type: { type: String, enum: ["percentage", "flat"], required: true },
    value: { type: Number, required: true, min: 0 },
    expiryAt: { type: Date },
    usageLimit: { type: Number, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
    minOrderAmount: { type: Number, min: 0 },
    maxDiscountAmount: { type: Number, min: 0 },
    applicablePlans: [{ type: Schema.Types.ObjectId, ref: "Plan" }],
    applicableBooks: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, isArchived: 1, expiryAt: 1 });
couponSchema.statics.findByCode = function (code: string) {
  return this.findOne({ code: code.toUpperCase() }).exec();
};
couponSchema.statics.findActive = function () {
  return this.find({ isActive: true, isArchived: false, isDeleted: false })
    .sort({ updatedAt: -1 })
    .exec();
};

export const CommerceCoupon = mongoose.model<
  ICommerceCoupon,
  ICommerceCouponModel
>("CommerceCoupon", couponSchema);
