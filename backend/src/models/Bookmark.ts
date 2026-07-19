import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type BookmarkType =
  "book" | "publication" | "magazine_issue" | "article";

export interface IBookmark extends Document {
  user: Types.ObjectId;
  type: BookmarkType;
  resourceId: Types.ObjectId;
  resourceTitle: string;
  resourceImage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookmarkModel extends Model<IBookmark> {
  findByUser(userId: Types.ObjectId, options?: any): Promise<IBookmark[]>;
  findByUserAndType(
    userId: Types.ObjectId,
    type: BookmarkType,
  ): Promise<IBookmark[]>;
  findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IBookmark | null>;
}

const bookmarkSchema = new Schema<IBookmark, IBookmarkModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["book", "publication", "magazine_issue", "article"],
      required: [true, "Bookmark type is required"],
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: [true, "Resource ID is required"],
      index: true,
    },
    resourceTitle: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    resourceImage: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Image must be a valid URL"],
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for user + resource uniqueness
bookmarkSchema.index({ user: 1, resourceId: 1, type: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, type: 1, createdAt: -1 });

// Static methods
bookmarkSchema.statics.findByUser = function (
  userId: Types.ObjectId,
  _options?: any,
): Promise<IBookmark[]> {
  return this.find({ user: userId }).sort({ createdAt: -1 }).exec();
};

bookmarkSchema.statics.findByUserAndType = function (
  userId: Types.ObjectId,
  type: BookmarkType,
): Promise<IBookmark[]> {
  return this.find({ user: userId, type }).sort({ createdAt: -1 }).exec();
};

bookmarkSchema.statics.findByUserAndResource = function (
  userId: Types.ObjectId,
  resourceId: Types.ObjectId,
): Promise<IBookmark | null> {
  return this.findOne({ user: userId, resourceId }).exec();
};

export const Bookmark = mongoose.model<IBookmark, IBookmarkModel>(
  "Bookmark",
  bookmarkSchema,
);
