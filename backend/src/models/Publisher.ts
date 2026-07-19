import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IPublisher extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  email?: string;
  logo?: Types.ObjectId;
  isActive: boolean;
  sortOrder: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPublisherModel extends Model<IPublisher> {
  findBySlug(slug: string): Promise<IPublisher | null>;
  findActive(): Promise<IPublisher[]>;
}

const publisherSchema = new Schema<IPublisher, IPublisherModel>(
  {
    name: {
      type: String,
      required: [true, "Publisher name is required"],
      trim: true,
      maxlength: [200, "Publisher name cannot exceed 200 characters"],
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
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    website: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: Schema.Types.ObjectId,
      ref: "Media",
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

publisherSchema.index({ isActive: 1, sortOrder: 1 });
publisherSchema.index({ name: "text", description: "text" });

publisherSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

publisherSchema.statics.findBySlug = function (
  slug: string,
): Promise<IPublisher | null> {
  return this.findOne({ slug, isDeleted: false }).exec();
};

publisherSchema.statics.findActive = function (): Promise<IPublisher[]> {
  return this.find({ isActive: true, isDeleted: false }).sort({
    sortOrder: 1,
    name: 1,
  });
};

export const Publisher = mongoose.model<IPublisher, IPublisherModel>(
  "Publisher",
  publisherSchema,
);
