import mongoose, { Schema, Model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: "book" | "magazine" | "subscription" | "digital" | "bundle";
  categoryId: mongoose.Types.ObjectId;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  isFeatured?: boolean;
  isDigital?: boolean;
  digitalFileUrl?: string;
  inventoryQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  status: "draft" | "published" | "archived" | "out_of_stock";
  sortOrder: number;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  url?: string;
}

export interface IProductModel extends Model<IProduct> {
  findBySlug(slug: string): Promise<IProduct | null>;
  findActive(): Promise<IProduct[]>;
  findByCategory(categoryId: string): Promise<IProduct[]>;
}

const productSchema = new Schema<IProduct, IProductModel>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Invalid slug"],
    },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    shortDescription: { type: String, trim: true, maxlength: 500 },
    type: {
      type: String,
      enum: ["book", "magazine", "subscription", "digital", "bundle"],
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    sku: { type: String, trim: true, maxlength: 100 },
    barcode: { type: String, trim: true, maxlength: 100 },
    weight: { type: Number, min: 0 },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    seoTitle: { type: String, trim: true, maxlength: 160 },
    seoDescription: { type: String, trim: true, maxlength: 320 },
    tags: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false },
    isDigital: { type: Boolean, default: false },
    digitalFileUrl: { type: String, trim: true },
    inventoryQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    trackInventory: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "out_of_stock"],
      default: "draft",
    },
    sortOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ status: 1, isDeleted: 1, sortOrder: 1 });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true, sparse: true });
productSchema.index({ isFeatured: 1, status: 1 });

productSchema.virtual("url").get(function (this: IProduct) {
  return `/products/${this.slug}`;
});

productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  if (this.inventoryQuantity !== undefined && this.inventoryQuantity <= 0) {
    this.status = "out_of_stock";
  }
  next();
});

productSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isDeleted: false }).exec();
};

productSchema.statics.findActive = function () {
  return this.find({ status: "published", isDeleted: false })
    .sort({ sortOrder: 1, name: 1 })
    .exec();
};

productSchema.statics.findByCategory = function (categoryId: string) {
  return this.find({ categoryId, status: "published", isDeleted: false })
    .sort({ sortOrder: 1, name: 1 })
    .exec();
};

export const Product = mongoose.model<IProduct, IProductModel>(
  "Product",
  productSchema,
);