import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type StorageType =
  "weekly" | "monthly" | "books" | "articles" | "media" | "other";
export type StorageStatus =
  "active" | "archived" | "missing" | "corrupted" | "processing";

export interface IStoragePath extends Document {
  _id: Types.ObjectId;
  path: string;
  relativePath: string;
  type: StorageType;
  status: StorageStatus;
  name: string;
  parentId?: Types.ObjectId;
  depth: number;
  size: number;
  fileCount: number;
  folderCount: number;
  lastScanned: Date;
  lastModified: Date;
  checksum?: string;
  metadata: {
    publication?: Types.ObjectId;
    issue?: Types.ObjectId;
    book?: Types.ObjectId;
    author?: Types.ObjectId;
    publisher?: Types.ObjectId;
    category?: Types.ObjectId;
    genre?: Types.ObjectId;
    series?: Types.ObjectId;
    collection?: Types.ObjectId;
    language?: string;
    issueDate?: Date;
    coverPath?: string;
    pdfPath?: string;
    thumbnailPath?: string;
    pageCount?: number;
    fileSize?: number;
    checksum?: string;
    storageStatus?: StorageStatus;
    lastModified?: Date;
    tags?: string[];
    keywords?: string[];
    description?: string;
    isbn?: string;
    edition?: string;
    price?: number;
    isPremium?: boolean;
    isFeatured?: boolean;
    isTrending?: boolean;
    publishedDate?: Date;
    readingTime?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    // PDF Streaming & Optimization (new fields — all optional)
    isLinearized?: boolean;
    optimizationStatus?: 'pending' | 'processing' | 'done' | 'failed' | 'skipped';
    optimizationDate?: Date;
    optimizedPath?: string;
    pdfVersion?: string;
    cacheStatus?: 'hot' | 'cold' | 'warming';
    lastStreamedAt?: Date;
    streamCount?: number;
    checksumSha256?: string;
    streamingEnabled?: boolean;
  };
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoragePathModel extends Model<IStoragePath> {
  findByPath(path: string): Promise<IStoragePath | null>;
  findByRelativePath(relativePath: string): Promise<IStoragePath | null>;
  findByType(type: StorageType): Promise<IStoragePath[]>;
  findByStatus(status: StorageStatus): Promise<IStoragePath[]>;
  findByParent(parentId: Types.ObjectId): Promise<IStoragePath[]>;
  findRootFolders(): Promise<IStoragePath[]>;
  findMissingFiles(): Promise<IStoragePath[]>;
  findDuplicates(): Promise<IStoragePath[]>;
  getStorageStats(): Promise<{
    totalSize: number;
    totalFiles: number;
    totalFolders: number;
    byType: Record<StorageType, { size: number; count: number }>;
    byStatus: Record<StorageStatus, number>;
  }>;
}

const storagePathSchema = new Schema<any, IStoragePathModel>(
  {
    path: {
      type: String,
      required: [true, "Path is required"],
      unique: true,
      trim: true,
      index: true,
    },
    relativePath: {
      type: String,
      required: [true, "Relative path is required"],
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["weekly", "monthly", "books", "articles", "media", "other"],
      required: [true, "Type is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "archived", "missing", "corrupted", "processing"],
      default: "active",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "StoragePath",
      index: true,
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    size: {
      type: Number,
      default: 0,
      min: 0,
    },
    fileCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    folderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastScanned: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
      index: true,
    },
    checksum: {
      type: String,
      trim: true,
    },
    metadata: {
      publication: { type: Schema.Types.ObjectId, ref: "Publication" },
      issue: { type: Schema.Types.ObjectId, ref: "MagazineIssue" },
      book: { type: Schema.Types.ObjectId, ref: "Book" },
      author: { type: Schema.Types.ObjectId, ref: "Author" },
      publisher: { type: Schema.Types.ObjectId, ref: "Publisher" },
      category: { type: Schema.Types.ObjectId, ref: "Category" },
      genre: { type: Schema.Types.ObjectId, ref: "Genre" },
      series: { type: Schema.Types.ObjectId, ref: "Series" },
      collection: { type: Schema.Types.ObjectId, ref: "Collection" },
      language: {
        type: String,
        trim: true,
        maxlength: [20, "Language cannot exceed 20 characters"],
      },
      issueDate: { type: Date },
      coverPath: { type: String, trim: true },
      pdfPath: { type: String, trim: true },
      thumbnailPath: { type: String, trim: true },
      pageCount: { type: Number, min: [1, "Page count must be at least 1"] },
      fileSize: { type: Number, min: [0, "File size cannot be negative"] },
      checksum: { type: String, trim: true },
      storageStatus: {
        type: String,
        enum: ["active", "archived", "missing", "corrupted", "processing"],
      },
      lastModified: { type: Date },
      tags: [{ type: String, trim: true }],
      keywords: [{ type: String, trim: true }],
      description: {
        type: String,
        trim: true,
        maxlength: [5000, "Description cannot exceed 5000 characters"],
      },
      isbn: {
        type: String,
        trim: true,
        maxlength: [30, "ISBN cannot exceed 30 characters"],
      },
      edition: {
        type: String,
        trim: true,
        maxlength: [50, "Edition cannot exceed 50 characters"],
      },
      price: { type: Number, min: [0, "Price cannot be negative"] },
      isPremium: { type: Boolean, default: false },
      isFeatured: { type: Boolean, default: false },
      isTrending: { type: Boolean, default: false },
      publishedDate: { type: Date },
      readingTime: {
        type: Number,
        min: [1, "Reading time must be at least 1"],
      },
      seoTitle: {
        type: String,
        maxlength: [70, "SEO title cannot exceed 70 characters"],
      },
      seoDescription: {
        type: String,
        maxlength: [160, "SEO description cannot exceed 160 characters"],
      },
      seoKeywords: [{ type: String, trim: true, lowercase: true }],
      // PDF Streaming & Optimization
      isLinearized: { type: Boolean },
      optimizationStatus: {
        type: String,
        enum: ['pending', 'processing', 'done', 'failed', 'skipped'],
        index: true,
      },
      optimizationDate: { type: Date },
      optimizedPath: { type: String, trim: true },
      pdfVersion: { type: String, trim: true },
      cacheStatus: { type: String, enum: ['hot', 'cold', 'warming'] },
      lastStreamedAt: { type: Date },
      streamCount: { type: Number, default: 0, min: 0 },
      checksumSha256: { type: String, trim: true },
      streamingEnabled: { type: Boolean, default: true },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    suppressReservedKeysWarning: true,
  },
);

storagePathSchema.index({ parentId: 1, name: 1 });
storagePathSchema.index({ type: 1, status: 1 });
storagePathSchema.index({ "metadata.publication": 1 });
storagePathSchema.index({ "metadata.issue": 1 });
storagePathSchema.index({ "metadata.book": 1 });
storagePathSchema.index({ "metadata.author": 1 });
storagePathSchema.index({ "metadata.category": 1 });
storagePathSchema.index({ "metadata.genre": 1 });
storagePathSchema.index({ "metadata.series": 1 });
storagePathSchema.index({ "metadata.collection": 1 });
storagePathSchema.index({ "metadata.language": 1 });
storagePathSchema.index({ "metadata.issueDate": -1 });
storagePathSchema.index({ "metadata.isbn": 1 });
storagePathSchema.index({ "metadata.tags": 1 });
storagePathSchema.index({ "metadata.keywords": 1 });
storagePathSchema.index({ isDeleted: 1, status: 1 });
storagePathSchema.index({ lastScanned: -1 });
storagePathSchema.index({ lastModified: -1 });

storagePathSchema.virtual("children", {
  ref: "StoragePath",
  localField: "_id",
  foreignField: "parentId",
});

storagePathSchema.pre(
  "save",
  function (this: any, next: (err?: Error) => void) {
    if (this.isModified("relativePath") && !this.isModified("name")) {
      this.name = this.relativePath.split("/").pop() || this.relativePath;
    }
    next();
  },
);

storagePathSchema.statics.findByPath = function (
  path: string,
): Promise<IStoragePath | null> {
  return this.findOne({ path, isDeleted: false }).exec();
};

storagePathSchema.statics.findByRelativePath = function (
  relativePath: string,
): Promise<IStoragePath | null> {
  return this.findOne({ relativePath, isDeleted: false }).exec();
};

storagePathSchema.statics.findByType = function (
  type: StorageType,
): Promise<IStoragePath[]> {
  return this.find({ type, isDeleted: false }).sort({ relativePath: 1 }).exec();
};

storagePathSchema.statics.findByStatus = function (
  status: StorageStatus,
): Promise<IStoragePath[]> {
  return this.find({ status, isDeleted: false })
    .sort({ lastScanned: -1 })
    .exec();
};

storagePathSchema.statics.findByParent = function (
  parentId: Types.ObjectId,
): Promise<IStoragePath[]> {
  return this.find({ parentId, isDeleted: false }).sort({ name: 1 }).exec();
};

storagePathSchema.statics.findRootFolders = function (): Promise<
  IStoragePath[]
> {
  return this.find({ parentId: { $exists: false }, isDeleted: false })
    .sort({ name: 1 })
    .exec();
};

storagePathSchema.statics.findMissingFiles = function (): Promise<
  IStoragePath[]
> {
  return this.find({ status: "missing", isDeleted: false })
    .sort({ lastScanned: -1 })
    .exec();
};

storagePathSchema.statics.findDuplicates = function (): Promise<
  IStoragePath[]
> {
  return this.aggregate([
    { $match: { isDeleted: false, checksum: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: "$checksum",
        count: { $sum: 1 },
        paths: { $push: "$relativePath" },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $project: { _id: 0, checksum: "$_id", count: 1, paths: 1 } },
  ]).exec();
};

storagePathSchema.statics.getStorageStats = async function (): Promise<{
  totalSize: number;
  totalFiles: number;
  totalFolders: number;
  byType: Record<StorageType, { size: number; count: number }>;
  byStatus: Record<StorageStatus, number>;
}> {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalSize: { $sum: "$size" },
        totalFiles: { $sum: "$fileCount" },
        totalFolders: { $sum: 1 },
        byType: {
          $push: {
            type: "$type",
            size: "$size",
            count: 1,
          },
        },
        byStatus: {
          $push: {
            status: "$status",
            count: 1,
          },
        },
      },
    },
  ]).exec();

  if (stats.length === 0) {
    return {
      totalSize: 0,
      totalFiles: 0,
      totalFolders: 0,
      byType: {
        weekly: { size: 0, count: 0 },
        monthly: { size: 0, count: 0 },
        books: { size: 0, count: 0 },
        articles: { size: 0, count: 0 },
        media: { size: 0, count: 0 },
        other: { size: 0, count: 0 },
      },
      byStatus: {
        active: 0,
        archived: 0,
        missing: 0,
        corrupted: 0,
        processing: 0,
      },
    };
  }

  const result = stats[0];
  const byType: Record<StorageType, { size: number; count: number }> = {
    weekly: { size: 0, count: 0 },
    monthly: { size: 0, count: 0 },
    books: { size: 0, count: 0 },
    articles: { size: 0, count: 0 },
    media: { size: 0, count: 0 },
    other: { size: 0, count: 0 },
  };

  const byStatus: Record<StorageStatus, number> = {
    active: 0,
    archived: 0,
    missing: 0,
    corrupted: 0,
    processing: 0,
  };

  for (const item of result.byType) {
    const type = item.type as StorageType;
    if (byType[type]) {
      byType[type].size += item.size;
      byType[type].count += item.count;
    }
  }

  for (const item of result.byStatus) {
    if (byStatus[item.status as StorageStatus] !== undefined) {
      byStatus[item.status as StorageStatus] += item.count;
    }
  }

  return {
    totalSize: result.totalSize,
    totalFiles: result.totalFiles,
    totalFolders: result.totalFolders,
    byType,
    byStatus,
  };
};

export const StoragePath = mongoose.model<IStoragePath, IStoragePathModel>(
  "StoragePath",
  storagePathSchema,
);
