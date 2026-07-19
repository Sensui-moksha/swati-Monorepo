import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface INote extends Document {
  user: Types.ObjectId;
  resourceId: Types.ObjectId;
  resourceType: "book" | "publication" | "magazine_issue" | "article";
  resourceTitle: string;
  title: string;
  content: string;
  page?: number;
  location?: string; // chapter, section, or location identifier
  tags: string[];
  color?: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteModel extends Model<INote> {
  findByUser(userId: Types.ObjectId): Promise<INote[]>;
  findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<INote[]>;
  findByUserAndTag(userId: Types.ObjectId, tag: string): Promise<INote[]>;
  search(userId: Types.ObjectId, query: string): Promise<INote[]>;
}

const noteSchema = new Schema<INote, INoteModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: [true, "Resource ID is required"],
      index: true,
    },
    resourceType: {
      type: String,
      enum: ["book", "publication", "magazine_issue", "article"],
      required: [true, "Resource type is required"],
    },
    resourceTitle: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    page: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    tags: {
      type: [String],
      default: [],
      lowercase: true,
      trim: true,
    },
    color: {
      type: String,
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color"],
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
noteSchema.index({ user: 1, resourceId: 1 });
noteSchema.index({ user: 1, isPinned: -1, createdAt: -1 });
noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ user: 1, createdAt: -1 });

// Static methods
noteSchema.statics.findByUser = function (
  userId: Types.ObjectId,
): Promise<INote[]> {
  return this.find({ user: userId })
    .sort({ isPinned: -1, createdAt: -1 })
    .exec();
};

noteSchema.statics.findByUserAndResource = function (
  userId: Types.ObjectId,
  resourceId: Types.ObjectId,
): Promise<INote[]> {
  return this.find({ user: userId, resourceId })
    .sort({ isPinned: -1, createdAt: -1 })
    .exec();
};

noteSchema.statics.findByUserAndTag = function (
  userId: Types.ObjectId,
  tag: string,
): Promise<INote[]> {
  return this.find({ user: userId, tags: tag.toLowerCase() })
    .sort({ createdAt: -1 })
    .exec();
};

noteSchema.statics.search = function (
  userId: Types.ObjectId,
  query: string,
): Promise<INote[]> {
  const searchRegex = new RegExp(query, "i");
  return this.find({
    user: userId,
    $or: [
      { title: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ],
  })
    .sort({ createdAt: -1 })
    .exec();
};

export const Note = mongoose.model<INote, INoteModel>("Note", noteSchema);
