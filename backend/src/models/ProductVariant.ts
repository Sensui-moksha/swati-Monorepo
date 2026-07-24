import mongoose, { Schema, Model, Document } from "mongoose";

export interface IProductVariant extends Document {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  inventoryQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  image?: string;
  options?: Record<string, string>;
  isDefault?: boolean;
  sortOrder: number;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariantModel extends Model<IProductVariant> {
  findByProduct(productId: string): Promise<IProductVariant[]>;
  findDefaultByProduct(productId: string): Promise<IProductVariant | null>;
}

const productVariantSchema = new Schema<IProductVariant, IProductVariantModel>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    sku: { type: String, trim: true, maxlength: 100 },
    barcode: { type: String, trim: true, maxlength: 100 },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    weight: { type: Number, min: 0 },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    inventoryQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    trackInventory: { type: Boolean, default: true },
    image: { type: String, trim: true },
    options: { type: Schema.Types.Mixed, default: {} },
    isDefault: { type: Boolean, default: false },
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

productVariantSchema.index({ productId: 1, sortOrder: 1 });
productVariantSchema.index({ productId: 1, isDefault: 1 });
productVariantSchema.index({ sku: 1 }, { unique: true, sparse: true });

productVariantSchema.statics.findByProduct = function (productId: string) {
  return this.find({ productId, isDeleted: false })
    .sort({ sortOrder: 1, name: 1 })
    .exec();
};

productVariantSchema.statics.findDefaultByProduct = function (productId: string) {
  return this.findOne({ productId, isDefault: true, isDeleted: false }).exec();
};

export const ProductVariant = mongoose.model<
  IProductVariant,
  IProductVariantModel
>("ProductVariant", productVariantSchema);