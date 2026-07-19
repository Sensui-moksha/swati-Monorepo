import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type CollectionType = "editor" | "featured" | "student" | "custom";

export interface ICollection extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  type: CollectionType;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICollectionModel extends Model<ICollection> {
  findBySlug(slug: string): Promise<ICollection | null>;
  findActive(): Promise<ICollection[]>;
}

const collectionSchema = new Schema<ICollection, ICollectionModel>(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
      maxlength: [200, "Collection name cannot exceed 200 characters"],
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
    type: {
      type: String,
      enum: ["editor", "featured", "student", "custom"],
      default: "custom",
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

collectionSchema.index({ type: 1, isActive: 1 });
collectionSchema.index({ isFeatured: 1 });

collectionSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

collectionSchema.statics.findBySlug = function (
  slug: string,
): Promise<ICollection | null> {
  return this.findOne({ slug, isDeleted: false }).exec();
};

collectionSchema.statics.findActive = function (): Promise<ICollection[]> {
  return this.find({ isActive: true, isDeleted: false }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const Collection = mongoose.model<ICollection, ICollectionModel>(
  "Collection",
  collectionSchema,
);
