import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type IssueStatus =
  "draft" | "current" | "upcoming" | "previous" | "archived";

export interface IMagazineIssue extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  publication: Types.ObjectId;
  issueNumber: string;
  volume?: string;
  issueDate?: Date;
  coverImage?: Types.ObjectId;
  description?: string;
  status: IssueStatus;
  isCurrent: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  tags: Types.ObjectId[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMagazineIssueModel extends Model<IMagazineIssue> {
  findCurrent(): Promise<IMagazineIssue | null>;
  findPrevious(limit?: number): Promise<IMagazineIssue[]>;
  findUpcoming(limit?: number): Promise<IMagazineIssue[]>;
  findArchived(limit?: number): Promise<IMagazineIssue[]>;
  findBySlug(slug: string): Promise<IMagazineIssue | null>;
}

const magazineIssueSchema = new Schema<IMagazineIssue, IMagazineIssueModel>(
  {
    title: {
      type: String,
      required: [true, "Issue title is required"],
      trim: true,
      maxlength: [250, "Issue title cannot exceed 250 characters"],
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
    publication: {
      type: Schema.Types.ObjectId,
      ref: "Publication",
      required: [true, "Publication is required"],
    },
    issueNumber: {
      type: String,
      required: [true, "Issue number is required"],
      trim: true,
      maxlength: [30, "Issue number cannot exceed 30 characters"],
    },
    volume: {
      type: String,
      trim: true,
      maxlength: [30, "Volume cannot exceed 30 characters"],
    },
    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
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
      enum: ["draft", "current", "upcoming", "previous", "archived"],
      default: "draft",
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

magazineIssueSchema.index({ publication: 1 });
magazineIssueSchema.index({ status: 1, issueDate: -1 });
magazineIssueSchema.index({ isCurrent: 1 });
magazineIssueSchema.index({ isFeatured: 1 });
magazineIssueSchema.index({ title: "text", description: "text" });

magazineIssueSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.isModified("slug")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

magazineIssueSchema.statics.findCurrent =
  function (): Promise<IMagazineIssue | null> {
    return this.findOne({ isCurrent: true, isDeleted: false })
      .sort({ issueDate: -1 })
      .exec();
  };

magazineIssueSchema.statics.findPrevious = function (
  limit: number = 6,
): Promise<IMagazineIssue[]> {
  return this.find({ status: "previous", isDeleted: false })
    .sort({ issueDate: -1 })
    .limit(limit);
};

magazineIssueSchema.statics.findUpcoming = function (
  limit: number = 6,
): Promise<IMagazineIssue[]> {
  return this.find({ status: "upcoming", isDeleted: false })
    .sort({ issueDate: -1 })
    .limit(limit);
};

magazineIssueSchema.statics.findArchived = function (
  limit: number = 12,
): Promise<IMagazineIssue[]> {
  return this.find({ status: "archived", isDeleted: false })
    .sort({ issueDate: -1 })
    .limit(limit);
};

magazineIssueSchema.statics.findBySlug = function (
  slug: string,
): Promise<IMagazineIssue | null> {
  return this.findOne({ slug, isDeleted: false }).exec();
};

export const MagazineIssue = mongoose.model<
  IMagazineIssue,
  IMagazineIssueModel
>("MagazineIssue", magazineIssueSchema);
