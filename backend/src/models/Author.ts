import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IAuthor extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  bio?: string;
  email?: string;
  website?: string;
  image?: Types.ObjectId;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthorModel extends Model<IAuthor> {
  findBySlug(slug: string): Promise<IAuthor | null>;
  findActive(): Promise<IAuthor[]>;
  findFeatured(limit?: number): Promise<IAuthor[]>;
}

const authorSchema = new Schema<IAuthor, IAuthorModel>(
  {
    name: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [200, "Author name cannot exceed 200 characters"],
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
    bio: {
      type: String,
      trim: true,
      maxlength: [5000, "Bio cannot exceed 5000 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    image: {
      type: Schema.Types.ObjectId,
      ref: "Media",
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

authorSchema.index({ isActive: 1, sortOrder: 1 });
authorSchema.index({ isFeatured: 1 });
authorSchema.index({ name: "text", bio: "text" });

authorSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

authorSchema.statics.findBySlug = function (
  slug: string,
): Promise<IAuthor | null> {
  return this.findOne({ slug, isDeleted: false }).exec();
};

authorSchema.statics.findActive = function (): Promise<IAuthor[]> {
  return this.find({ isActive: true, isDeleted: false }).sort({
    sortOrder: 1,
    name: 1,
  });
};

authorSchema.statics.findFeatured = function (
  limit: number = 8,
): Promise<IAuthor[]> {
  return this.find({ isFeatured: true, isActive: true, isDeleted: false })
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit);
};

export const Author = mongoose.model<IAuthor, IAuthorModel>(
  "Author",
  authorSchema,
);
