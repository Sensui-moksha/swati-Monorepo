import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type ArticleStatus =
  "draft" | "pending_review" | "published" | "archived" | "rejected";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  fullName: string;
  avatar?: string;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export interface ITag extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

export interface IMedia extends Document {
  _id: Types.ObjectId;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
}

export interface IArticle extends Document {
  contentType: "article" | "news";
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  summary?: string;
  content: string;
  contentHtml?: string;
  featuredImage?: Types.ObjectId | IMedia;
  gallery?: (Types.ObjectId | IMedia)[];
  author: Types.ObjectId | IUser;
  coAuthors?: (Types.ObjectId | IUser)[];
  category?: Types.ObjectId | ICategory;
  publication?: Types.ObjectId;
  magazineIssue?: Types.ObjectId;
  tags: (Types.ObjectId | ITag)[];
  status: ArticleStatus;
  isFeatured: boolean;
  isBreaking: boolean;
  isPinned: boolean;
  isPremium: boolean;
  publishedAt?: Date;
  scheduledAt?: Date;
  expiryDate?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId | IUser;
  reviewedAt?: Date;
  createdBy?: Types.ObjectId | IUser;
  updatedBy?: Types.ObjectId | IUser;
  publishedBy?: Types.ObjectId | IUser;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  readingTime?: number;
  language: string;
  version: number;
  previousVersions?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  url?: string;
  pdfUrl?: string;
  isPublished?: boolean;
  isScheduled?: boolean;
}

export interface IArticleModel extends Model<IArticle> {
  findPublished(): Promise<IArticle[]>;
  findBySlug(slug: string): Promise<IArticle | null>;
  findByAuthor(authorId: Types.ObjectId): Promise<IArticle[]>;
  findByCategory(categoryId: Types.ObjectId): Promise<IArticle[]>;
  findByTag(tagId: Types.ObjectId): Promise<IArticle[]>;
  findFeatured(): Promise<IArticle[]>;
  findBreaking(): Promise<IArticle[]>;
  findScheduled(): Promise<IArticle[]>;
  search(query: string): Promise<IArticle[]>;
  incrementViewCount(articleId: Types.ObjectId): Promise<IArticle | null>;
  incrementLikeCount(articleId: Types.ObjectId): Promise<IArticle | null>;
  incrementCommentCount(articleId: Types.ObjectId): Promise<IArticle | null>;
  incrementShareCount(articleId: Types.ObjectId): Promise<IArticle | null>;
}

const articleSchema = new Schema<IArticle, IArticleModel>(
  {
    contentType: {
      type: String,
      enum: ["article", "news"],
      default: "article",
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
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
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, "Subtitle cannot exceed 300 characters"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [500, "Summary cannot exceed 500 characters"],
    },
    content: { type: String, default: "PDF Document" },
    contentHtml: { type: String },
    pdfUrl: { type: String, trim: true },
    featuredImage: { type: Schema.Types.ObjectId, ref: "Media" },
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    coAuthors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    publication: { type: Schema.Types.ObjectId, ref: "Publication" },
    magazineIssue: { type: Schema.Types.ObjectId, ref: "MagazineIssue" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "archived", "rejected"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    publishedAt: { type: Date },
    scheduledAt: { type: Date },
    expiryDate: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [60, "SEO title cannot exceed 60 characters"],
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, "SEO description cannot exceed 160 characters"],
    },
    seoKeywords: [{ type: String, trim: true, lowercase: true }],
    canonicalUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Canonical URL must be a valid HTTP/HTTPS URL"],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "View count cannot be negative"],
    },
    likeCount: {
      type: Number,
      default: 0,
      min: [0, "Like count cannot be negative"],
    },
    commentCount: {
      type: Number,
      default: 0,
      min: [0, "Comment count cannot be negative"],
    },
    shareCount: {
      type: Number,
      default: 0,
      min: [0, "Share count cannot be negative"],
    },
    readingTime: { type: Number, min: [0, "Reading time cannot be negative"] },
    language: {
      type: String,
      default: "en",
      trim: true,
      maxlength: [10, "Language code cannot exceed 10 characters"],
    },
    version: {
      type: Number,
      default: 1,
      min: [1, "Version must be at least 1"],
    },
    previousVersions: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

articleSchema.index({ author: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ isFeatured: 1 });
articleSchema.index({ isBreaking: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ scheduledAt: 1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ viewCount: -1 });
articleSchema.index({ likeCount: -1 });
articleSchema.index({ title: "text", content: "text", excerpt: "text" });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ status: 1, isFeatured: 1, publishedAt: -1 });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });

articleSchema.virtual("url").get(function (this: IArticle) {
  return `/articles/${this.slug}`;
});

articleSchema.virtual("isPublished").get(function (this: IArticle) {
  return (
    this.status === "published" &&
    !!this.publishedAt &&
    this.publishedAt <= new Date()
  );
});

articleSchema.virtual("isScheduled").get(function (this: IArticle) {
  return (
    this.status === "published" &&
    !!this.scheduledAt &&
    this.scheduledAt > new Date()
  );
});

articleSchema.virtual("authorDetails", {
  ref: "User",
  localField: "author",
  foreignField: "_id",
  justOne: true,
});
articleSchema.virtual("categoryDetails", {
  ref: "Category",
  localField: "category",
  foreignField: "_id",
  justOne: true,
});
articleSchema.virtual("tagDetails", {
  ref: "Tag",
  localField: "tags",
  foreignField: "_id",
});
articleSchema.virtual("featuredImageDetails", {
  ref: "Media",
  localField: "featuredImage",
  foreignField: "_id",
  justOne: true,
});
articleSchema.virtual("galleryDetails", {
  ref: "Media",
  localField: "gallery",
  foreignField: "_id",
});
articleSchema.virtual("reviewerDetails", {
  ref: "User",
  localField: "reviewedBy",
  foreignField: "_id",
  justOne: true,
});

articleSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.isModified("slug")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 200);
  }

  if (this.isModified("content")) {
    const wordCount = this.content
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  if (this.isModified("status") && this.status === "published") {
    this.scheduledAt = undefined;
  }

  if (this.isModified("reviewedBy") && this.reviewedBy && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }

  next();
});

articleSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

articleSchema.statics.findPublished = function (): Promise<IArticle[]> {
  return this.find({
    status: "published",
    $or: [
      { publishedAt: { $lte: new Date() } },
      { scheduledAt: { $lte: new Date() } },
    ],
  })
    .sort({ publishedAt: -1 })
    .populate("authorDetails", "username fullName avatar")
    .populate("categoryDetails", "name slug")
    .populate("tagDetails", "name slug")
    .populate("featuredImageDetails", "url thumbnailUrl alt");
};

articleSchema.statics.findBySlug = function (
  slug: string,
): Promise<IArticle | null> {
  return this.findOne({ slug: slug.toLowerCase() })
    .populate("authorDetails", "username fullName avatar")
    .populate("categoryDetails", "name slug")
    .populate("tagDetails", "name slug")
    .populate("featuredImageDetails", "url thumbnailUrl alt")
    .populate("galleryDetails", "url thumbnailUrl alt");
};

articleSchema.statics.findByAuthor = function (
  authorId: Types.ObjectId,
): Promise<IArticle[]> {
  return this.find({ author: authorId })
    .sort({ createdAt: -1 })
    .populate("categoryDetails", "name slug")
    .populate("tagDetails", "name slug");
};

articleSchema.statics.findByCategory = function (
  categoryId: Types.ObjectId,
): Promise<IArticle[]> {
  return this.find({ category: categoryId, status: "published" })
    .sort({ publishedAt: -1 })
    .populate("authorDetails", "username fullName avatar")
    .populate("tagDetails", "name slug")
    .populate("featuredImageDetails", "url thumbnailUrl alt");
};

articleSchema.statics.findByTag = function (
  tagId: Types.ObjectId,
): Promise<IArticle[]> {
  return this.find({ tags: tagId, status: "published" })
    .sort({ publishedAt: -1 })
    .populate("authorDetails", "username fullName avatar")
    .populate("categoryDetails", "name slug")
    .populate("featuredImageDetails", "url thumbnailUrl alt");
};

articleSchema.statics.findFeatured = function (): Promise<IArticle[]> {
  return this.find({ isFeatured: true, status: "published" })
    .sort({ publishedAt: -1 })
    .limit(10)
    .populate("authorDetails", "username fullName avatar")
    .populate("categoryDetails", "name slug")
    .populate("featuredImageDetails", "url thumbnailUrl alt");
};

articleSchema.statics.findBreaking = function (): Promise<IArticle[]> {
  return this.find({ isBreaking: true, status: "published" })
    .sort({ publishedAt: -1 })
    .limit(5)
    .populate("authorDetails", "username fullName avatar")
    .populate("categoryDetails", "name slug")
    .populate("featuredImageDetails", "url thumbnailUrl alt");
};

articleSchema.statics.findScheduled = function (): Promise<IArticle[]> {
  return this.find({ status: "published", scheduledAt: { $gt: new Date() } })
    .sort({ scheduledAt: 1 })
    .populate("authorDetails", "username fullName avatar")
    .populate("categoryDetails", "name slug");
};

articleSchema.statics.search = function (query: string): Promise<IArticle[]> {
  return this.find(
    { $text: { $search: query }, status: "published" },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" }, publishedAt: -1 })
    .populate("authorDetails", "username fullName avatar")
    .populate("categoryDetails", "name slug")
    .populate("featuredImageDetails", "url thumbnailUrl alt");
};

articleSchema.statics.incrementViewCount = function (
  articleId: Types.ObjectId,
): Promise<IArticle | null> {
  return this.findByIdAndUpdate(
    articleId,
    { $inc: { viewCount: 1 } },
    { new: true },
  );
};

articleSchema.statics.incrementLikeCount = function (
  articleId: Types.ObjectId,
): Promise<IArticle | null> {
  return this.findByIdAndUpdate(
    articleId,
    { $inc: { likeCount: 1 } },
    { new: true },
  );
};

articleSchema.statics.incrementCommentCount = function (
  articleId: Types.ObjectId,
): Promise<IArticle | null> {
  return this.findByIdAndUpdate(
    articleId,
    { $inc: { commentCount: 1 } },
    { new: true },
  );
};

articleSchema.statics.incrementShareCount = function (
  articleId: Types.ObjectId,
): Promise<IArticle | null> {
  return this.findByIdAndUpdate(
    articleId,
    { $inc: { shareCount: 1 } },
    { new: true },
  );
};

export const Article = mongoose.model<IArticle, IArticleModel>(
  "Article",
  articleSchema,
);
