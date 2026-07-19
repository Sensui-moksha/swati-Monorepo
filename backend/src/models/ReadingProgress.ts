import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IReadingProgress extends Document {
  user: Types.ObjectId;
  resourceId: Types.ObjectId;
  resourceType: "book" | "publication" | "magazine_issue" | "article";
  currentPage: number;
  totalPages: number;
  percentageRead: number;
  timeSpent: number; // in minutes
  lastReadAt: Date;
  startedAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
  sessionCount: number;
}

export interface IReadingProgressModel extends Model<IReadingProgress> {
  findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IReadingProgress | null>;
  findActiveByUser(userId: Types.ObjectId): Promise<IReadingProgress[]>;
  findCompletedByUser(userId: Types.ObjectId): Promise<IReadingProgress[]>;
  findForContinueReading(
    userId: Types.ObjectId,
    limit?: number,
  ): Promise<IReadingProgress[]>;
}

const readingProgressSchema = new Schema<
  IReadingProgress,
  IReadingProgressModel
>(
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
    currentPage: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPages: {
      type: Number,
      required: [true, "Total pages is required"],
      min: 1,
    },
    percentageRead: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    sessionCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for user + resource
readingProgressSchema.index({ user: 1, resourceId: 1 }, { unique: true });
readingProgressSchema.index({ user: 1, isCompleted: 1, lastReadAt: -1 });
readingProgressSchema.index({ user: 1, lastReadAt: -1 });

// Static methods
readingProgressSchema.statics.findByUserAndResource = function (
  userId: Types.ObjectId,
  resourceId: Types.ObjectId,
): Promise<IReadingProgress | null> {
  return this.findOne({ user: userId, resourceId }).exec();
};

readingProgressSchema.statics.findActiveByUser = function (
  userId: Types.ObjectId,
): Promise<IReadingProgress[]> {
  return this.find({ user: userId, isCompleted: false })
    .sort({ lastReadAt: -1 })
    .exec();
};

readingProgressSchema.statics.findCompletedByUser = function (
  userId: Types.ObjectId,
): Promise<IReadingProgress[]> {
  return this.find({ user: userId, isCompleted: true })
    .sort({ completedAt: -1 })
    .exec();
};

readingProgressSchema.statics.findForContinueReading = function (
  userId: Types.ObjectId,
  limit = 10,
): Promise<IReadingProgress[]> {
  return this.find({
    user: userId,
    isCompleted: false,
    percentageRead: { $gt: 0, $lt: 100 },
  })
    .sort({ lastReadAt: -1 })
    .limit(limit)
    .exec();
};

export const ReadingProgress = mongoose.model<
  IReadingProgress,
  IReadingProgressModel
>("ReadingProgress", readingProgressSchema);
