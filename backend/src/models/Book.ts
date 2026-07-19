import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type BookStatus =
  "draft" | "pending_review" | "published" | "archived" | "rejected";

export interface IBook extends Document {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  description?: string;
  isbn?: string;
  slug: string;
  author: Types.ObjectId;
  publisher?: Types.ObjectId;
  category?: Types.ObjectId;
  genre?: Types.ObjectId;
  series?: Types.ObjectId;
  publication?: Types.ObjectId;
  language: string;
  edition?: string;
  pages?: number;
  price?: number;
  isPremium: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  publishedDate?: Date;
  readingTime?: number;
  tags: Types.ObjectId[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  coverImage?: Types.ObjectId;
  pdfFile?: Types.ObjectId;
  status: BookStatus;
  isDeleted: boolean;
  deletedAt?: Date;
  viewCount: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookModel extends Model<IBook> {
  findPublished(): Promise<IBook[]>;
  findBySlug(slug: string): Promise<IBook | null>;
  findByAuthor(authorId: Types.ObjectId): Promise<IBook[]>;
  findByCategory(categoryId: Types.ObjectId): Promise<IBook[]>;
  findByGenre(genreId: Types.ObjectId): Promise<IBook[]>;
  findFeatured(limit?: number): Promise<IBook[]>;
  findTrending(limit?: number): Promise<IBook[]>;
  findNewReleases(limit?: number): Promise<IBook[]>;
}

const bookSchema = new Schema<any, IBookModel>(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      maxlength: [250, "Book title cannot exceed 250 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [250, "Subtitle cannot exceed 250 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      maxlength: [30, "ISBN cannot exceed 30 characters"],
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
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: [true, "Author is required"],
    },
    publisher: {
      type: Schema.Types.ObjectId,
      ref: "Publisher",
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    genre: {
      type: Schema.Types.ObjectId,
      ref: "Genre",
    },
    series: {
      type: Schema.Types.ObjectId,
      ref: "Series",
    },
    collection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
    publication: {
      type: Schema.Types.ObjectId,
      ref: "Publication",
    },
    language: {
      type: String,
      default: "en",
      trim: true,
      maxlength: [20, "Language cannot exceed 20 characters"],
    },
    edition: {
      type: String,
      trim: true,
      maxlength: [50, "Edition cannot exceed 50 characters"],
    },
    pages: {
      type: Number,
      min: [1, "Pages must be at least 1"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    readingTime: {
      type: Number,
      min: [1, "Reading time must be at least 1"],
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
        default: [],
      },
    ],
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
    coverImage: {
      type: Schema.Types.ObjectId,
      ref: "Media",
    },
    pdfFile: {
      type: Schema.Types.ObjectId,
      ref: "Media",
    },
    status: {
      type: String,
      enum: ["draft", "pending_review", "published", "archived", "rejected"],
      default: "draft",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "View count cannot be negative"],
    },
    salesCount: {
      type: Number,
      default: 0,
      min: [0, "Sales count cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    suppressReservedKeysWarning: true,
  },
);

bookSchema.index({ author: 1 });
bookSchema.index({ category: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ publisher: 1 });
bookSchema.index({ publication: 1 });
bookSchema.index({ status: 1, isDeleted: 1 });
bookSchema.index({ isFeatured: 1, status: 1, publishedDate: -1 });
bookSchema.index({ isTrending: 1, status: 1, publishedDate: -1 });
bookSchema.index({ publishedDate: -1 });
bookSchema.index({ title: "text", description: "text", isbn: "text" });

bookSchema.pre("save", function (this: any, next: (err?: Error) => void) {
  if (this.isModified("title") && !this.isModified("slug")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

bookSchema.statics.findPublished = function (): Promise<IBook[]> {
  return this.find({ status: "published", isDeleted: false }).sort({
    publishedDate: -1,
    createdAt: -1,
  });
};

bookSchema.statics.findBySlug = function (slug: string): Promise<IBook | null> {
  return this.findOne({ slug, isDeleted: false }).exec();
};

bookSchema.statics.findByAuthor = function (
  authorId: Types.ObjectId,
): Promise<IBook[]> {
  return this.find({
    author: authorId,
    isDeleted: false,
    status: "published",
  }).sort({ publishedDate: -1 });
};

bookSchema.statics.findByCategory = function (
  categoryId: Types.ObjectId,
): Promise<IBook[]> {
  return this.find({
    category: categoryId,
    isDeleted: false,
    status: "published",
  }).sort({ publishedDate: -1 });
};

bookSchema.statics.findByGenre = function (
  genreId: Types.ObjectId,
): Promise<IBook[]> {
  return this.find({
    genre: genreId,
    isDeleted: false,
    status: "published",
  }).sort({ publishedDate: -1 });
};

bookSchema.statics.findFeatured = function (
  limit: number = 12,
): Promise<IBook[]> {
  return this.find({ isFeatured: true, status: "published", isDeleted: false })
    .sort({ publishedDate: -1 })
    .limit(limit);
};

bookSchema.statics.findTrending = function (
  limit: number = 12,
): Promise<IBook[]> {
  return this.find({ isTrending: true, status: "published", isDeleted: false })
    .sort({ publishedDate: -1 })
    .limit(limit);
};

bookSchema.statics.findNewReleases = function (
  limit: number = 12,
): Promise<IBook[]> {
  return this.find({ status: "published", isDeleted: false })
    .sort({ publishedDate: -1 })
    .limit(limit);
};

export const Book = mongoose.model<IBook, IBookModel>("Book", bookSchema);
