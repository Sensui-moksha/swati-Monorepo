import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parent?: mongoose.Types.ObjectId | ICategory;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  children?: ICategory[];
  articleCount?: number;
}

export interface ICategoryModel extends Model<ICategory> {
  findBySlug(slug: string): Promise<ICategory | null>;
  findActive(): Promise<ICategory[]>;
  findRootCategories(): Promise<ICategory[]>;
  findChildren(parentId: mongoose.Types.ObjectId): Promise<ICategory[]>;
}

const categorySchema = new Schema<ICategory, ICategoryModel>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
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
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    color: {
      type: String,
      trim: true,
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color code"],
    },
    icon: {
      type: String,
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for children categories
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Virtual for article count
categorySchema.virtual("articleCount", {
  ref: "Article",
  localField: "_id",
  foreignField: "category",
  count: true,
});

// Pre-save middleware to generate slug from name if not provided
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Static method to find by slug
categorySchema.statics.findBySlug = function (
  slug: string,
): Promise<ICategory | null> {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Static method to find active categories
categorySchema.statics.findActive = function (): Promise<ICategory[]> {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

// Static method to find root categories (no parent)
categorySchema.statics.findRootCategories = function (): Promise<ICategory[]> {
  return this.find({ parent: null, isActive: true }).sort({
    sortOrder: 1,
    name: 1,
  });
};

// Static method to find children of a category
categorySchema.statics.findChildren = function (
  parentId: mongoose.Types.ObjectId,
): Promise<ICategory[]> {
  return this.find({ parent: parentId, isActive: true }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const Category = mongoose.model<ICategory, ICategoryModel>(
  "Category",
  categorySchema,
);
