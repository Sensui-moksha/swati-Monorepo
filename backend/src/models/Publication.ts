import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type PublicationStatus = "draft" | "active" | "archived" | "upcoming";

export interface IPublication extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  issueNumber?: string;
  volume?: string;
  publisher?: Types.ObjectId;
  issueDate?: Date;
  coverImage?: Types.ObjectId;
  description?: string;
  status: PublicationStatus;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  tags: Types.ObjectId[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPublicationModel extends Model<IPublication> {
  findActive(): Promise<IPublication[]>;
  findBySlug(slug: string): Promise<IPublication | null>;
  findLatest(limit?: number): Promise<IPublication[]>;
  findArchive(limit?: number): Promise<IPublication[]>;
}

const publicationSchema = new Schema<IPublication, IPublicationModel>(
  {
    name: {
      type: String,
      required: [true, "Publication name is required"],
      trim: true,
      maxlength: [250, "Publication name cannot exceed 250 characters"],
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
    issueNumber: {
      type: String,
      trim: true,
      maxlength: [50, "Issue number cannot exceed 50 characters"],
    },
    volume: {
      type: String,
      trim: true,
      maxlength: [50, "Volume cannot exceed 50 characters"],
    },
    publisher: {
      type: Schema.Types.ObjectId,
      ref: "Publisher",
    },
    issueDate: {
      type: Date,
    },
    coverImage: {
      type: Schema.Types.ObjectId,
      ref: "Media",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived", "upcoming"],
      default: "draft",
    },
    seoTitle: {
      type: String,
      maxlength: [70, "SEO title cannot exceed 70 characters"],
    },
    seoDescription: {
      type: String,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
    seoKeywords: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        default: [],
      },
    ],
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

publicationSchema.index({ status: 1, issueDate: -1 });
publicationSchema.index({ publisher: 1 });
publicationSchema.index({ name: "text", description: "text" });

publicationSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

publicationSchema.statics.findActive = function (): Promise<IPublication[]> {
  return this.find({ status: "active", isDeleted: false }).sort({
    issueDate: -1,
    createdAt: -1,
  });
};

publicationSchema.statics.findBySlug = function (
  slug: string,
): Promise<IPublication | null> {
  return this.findOne({ slug, isDeleted: false }).exec();
};

publicationSchema.statics.findLatest = function (
  limit: number = 6,
): Promise<IPublication[]> {
  return this.find({ status: "active", isDeleted: false })
    .sort({ issueDate: -1 })
    .limit(limit);
};

publicationSchema.statics.findArchive = function (
  limit: number = 12,
): Promise<IPublication[]> {
  return this.find({ status: "archived", isDeleted: false })
    .sort({ issueDate: -1 })
    .limit(limit);
};

export const Publication = mongoose.model<IPublication, IPublicationModel>(
  "Publication",
  publicationSchema,
);
