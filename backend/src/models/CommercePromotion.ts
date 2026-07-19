import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { PromotionType } from "../interfaces/commerce";

export interface ICommercePromotion extends Document {
  title: string;
  slug: string;
  type: PromotionType;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  startsAt?: Date;
  endsAt?: Date;
  usageLimit?: number;
  usageCount: number;
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

export interface ICommercePromotionModel extends Model<ICommercePromotion> {
  findBySlug(slug: string): Promise<ICommercePromotion | null>;
  findActive(): Promise<ICommercePromotion[]>;
}

const promotionSchema = new Schema<ICommercePromotion, ICommercePromotionModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "festival",
        "student",
        "referral",
        "flash_sale",
        "limited_time_offer",
      ],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
    usageLimit: { type: Number, min: 0 },
    usageCount: { type: Number, default: 0, min: 0 },
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

promotionSchema.index({ type: 1, isActive: 1, isArchived: 1 });
promotionSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.isModified("slug")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});
promotionSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug }).exec();
};
promotionSchema.statics.findActive = function () {
  return this.find({ isActive: true, isArchived: false, isDeleted: false })
    .sort({ updatedAt: -1 })
    .exec();
};

export const CommercePromotion = mongoose.model<
  ICommercePromotion,
  ICommercePromotionModel
>("CommercePromotion", promotionSchema);
