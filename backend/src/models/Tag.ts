import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  articleCount: number;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  url?: string;
}

export interface ITagModel extends Model<ITag> {
  findBySlug(slug: string): Promise<ITag | null>;
  findActive(): Promise<ITag[]>;
  findPopular(limit?: number): Promise<ITag[]>;
  incrementArticleCount(tagId: Types.ObjectId): Promise<ITag | null>;
  decrementArticleCount(tagId: Types.ObjectId): Promise<ITag | null>;
}

const tagSchema = new Schema<ITag, ITagModel>(
  {
    name: {
      type: String,
      required: [true, "Tag name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Tag name cannot exceed 50 characters"],
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
    articleCount: {
      type: Number,
      default: 0,
      min: [0, "Article count cannot be negative"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
tagSchema.index({ isActive: 1 });
tagSchema.index({ articleCount: -1 });

// Virtual for URL
tagSchema.virtual("url").get(function (this: ITag) {
  return `/tags/${this.slug}`;
});

// Pre-save middleware to generate slug from name if not provided
tagSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 50);
  }
  next();
});

// Static method to find by slug
tagSchema.statics.findBySlug = function (slug: string): Promise<ITag | null> {
  return this.findOne({ slug: slug.toLowerCase() });
};

// Static method to find active tags
tagSchema.statics.findActive = function (): Promise<ITag[]> {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Static method to find popular tags
tagSchema.statics.findPopular = function (limit: number = 20): Promise<ITag[]> {
  return this.find({ isActive: true }).sort({ articleCount: -1 }).limit(limit);
};

// Static method to increment article count
tagSchema.statics.incrementArticleCount = function (
  tagId: Types.ObjectId,
): Promise<ITag | null> {
  return this.findByIdAndUpdate(
    tagId,
    { $inc: { articleCount: 1 } },
    { new: true },
  );
};

// Static method to decrement article count
tagSchema.statics.decrementArticleCount = function (
  tagId: Types.ObjectId,
): Promise<ITag | null> {
  return this.findByIdAndUpdate(
    tagId,
    { $inc: { articleCount: -1 } },
    { new: true },
  );
};

export const Tag = mongoose.model<ITag, ITagModel>("Tag", tagSchema);
