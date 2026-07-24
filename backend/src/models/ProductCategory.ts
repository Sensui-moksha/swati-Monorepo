import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProductCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId | IProductCategory;
  isActive: boolean;
  sortOrder: number;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  children?: IProductCategory[];
  productCount?: number;
}

export interface IProductCategoryModel extends Model<IProductCategory> {
  findBySlug(slug: string): Promise<IProductCategory | null>;
  findActive(): Promise<IProductCategory[]>;
  findRootCategories(): Promise<IProductCategory[]>;
  findChildren(parentId: mongoose.Types.ObjectId): Promise<IProductCategory[]>;
}

const productCategorySchema = new Schema<IProductCategory, IProductCategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    image: {
      type: String,
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
productCategorySchema.index({ parent: 1 });
productCategorySchema.index({ isActive: 1 });
productCategorySchema.index({ sortOrder: 1 });
productCategorySchema.index({ isDeleted: 1 });

// Virtual for children categories
productCategorySchema.virtual("children", {
  ref: "ProductCategory",
  localField: "_id",
  foreignField: "parent",
});

// Virtual for product count
productCategorySchema.virtual("productCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "categoryId",
  count: true,
});

// Pre-save middleware to generate slug from name if not provided
productCategorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Soft delete middleware
productCategorySchema.pre("findOneAndDelete", function (next) {
  this.set({ isDeleted: true, deletedAt: new Date() });
  next();
});

// Static method to find by slug
productCategorySchema.statics.findBySlug = function (
  slug: string,
): Promise<IProductCategory | null> {
  return this.findOne({ slug: slug.toLowerCase(), isDeleted: false });
};

// Static method to find active categories
productCategorySchema.statics.findActive = function (): Promise<
  IProductCategory[]
> {
  return this.find({ isActive: true, isDeleted: false }).sort({
    sortOrder: 1,
    name: 1,
  });
};

// Static method to find root categories (no parent)
productCategorySchema.statics.findRootCategories = function (): Promise<
  IProductCategory[]
> {
  return this.find({ parent: null, isActive: true, isDeleted: false }).sort({
    sortOrder: 1,
    name: 1,
  });
};

// Static method to find children of a category
productCategorySchema.statics.findChildren = function (
  parentId: mongoose.Types.ObjectId,
): Promise<IProductCategory[]> {
  return this.find({ parent: parentId, isActive: true, isDeleted: false }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const ProductCategory = mongoose.model<
  IProductCategory,
  IProductCategoryModel
>("ProductCategory", productCategorySchema);