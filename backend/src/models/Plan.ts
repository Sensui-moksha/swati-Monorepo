import mongoose, { Document, Model, Schema } from "mongoose";
import { PlanBillingCycle } from "../interfaces/commerce";

export interface IPlan extends Document {
  name: string;
  slug: string;
  description?: string;
  billingCycle: PlanBillingCycle;
  price: number;
  currency: string;
  trialDays: number;
  features: string[];
  limits: { books?: number; devices?: number; downloads?: number };
  sortOrder: number;
  isActive: boolean;
  isArchived: boolean;
  archivedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  url?: string;
}

export interface IPlanModel extends Model<IPlan> {
  findBySlug(slug: string): Promise<IPlan | null>;
  findActive(): Promise<IPlan[]>;
}

const planSchema = new Schema<IPlan, IPlanModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Invalid slug"],
    },
    description: { type: String, trim: true, maxlength: 1000 },
    billingCycle: {
      type: String,
      enum: [
        "free",
        "monthly",
        "quarterly",
        "half_yearly",
        "annual",
        "lifetime",
      ],
      required: true,
    },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR", trim: true, uppercase: true },
    trialDays: { type: Number, default: 0, min: 0 },
    features: [{ type: String, trim: true }],
    limits: {
      books: { type: Number, min: 0 },
      devices: { type: Number, min: 0 },
      downloads: { type: Number, min: 0 },
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

planSchema.index({ isActive: 1, isArchived: 1, sortOrder: 1 });
planSchema.virtual("url").get(function (this: IPlan) {
  return `/plans/${this.slug}`;
});
planSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});
planSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug }).exec();
};
planSchema.statics.findActive = function () {
  return this.find({ isActive: true, isArchived: false, isDeleted: false })
    .sort({ sortOrder: 1, name: 1 })
    .exec();
};

export const Plan = mongoose.model<IPlan, IPlanModel>("Plan", planSchema);
