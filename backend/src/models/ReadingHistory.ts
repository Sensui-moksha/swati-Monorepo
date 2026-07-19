import mongoose, { Document, Schema, Model, Types } from "mongoose";

export interface IReadingHistory extends Document {
  user: Types.ObjectId;
  resourceId: Types.ObjectId;
  resourceType: "book" | "publication" | "magazine_issue" | "article";
  resourceTitle: string;
  resourceImage?: string;
  readAt: Date;
  duration?: number; // in minutes
  pageRead?: number;
  percentageRead?: number;
}

export interface IReadingHistoryModel extends Model<IReadingHistory> {
  findByUser(
    userId: Types.ObjectId,
    limit?: number,
  ): Promise<IReadingHistory[]>;
  findRecentlyViewed(
    userId: Types.ObjectId,
    limit?: number,
  ): Promise<IReadingHistory[]>;
  findByUserAndResource(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<IReadingHistory | null>;
  getReadingTimeline(
    userId: Types.ObjectId,
    days?: number,
  ): Promise<IReadingHistory[]>;
}

const readingHistorySchema = new Schema<IReadingHistory, IReadingHistoryModel>(
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
    readAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    duration: {
      type: Number,
      min: 0,
    },
    pageRead: {
      type: Number,
      min: 0,
    },
    percentageRead: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: false,
  },
);

// Compound index for user + resource + date
readingHistorySchema.index({ user: 1, resourceId: 1, readAt: -1 });
readingHistorySchema.index({ user: 1, readAt: -1 });

// Static methods
readingHistorySchema.statics.findByUser = function (
  userId: Types.ObjectId,
  limit = 50,
): Promise<IReadingHistory[]> {
  return this.find({ user: userId }).sort({ readAt: -1 }).limit(limit).exec();
};

readingHistorySchema.statics.findRecentlyViewed = function (
  userId: Types.ObjectId,
  limit = 10,
): Promise<IReadingHistory[]> {
  return this.find({ user: userId }).sort({ readAt: -1 }).limit(limit).exec();
};

readingHistorySchema.statics.findByUserAndResource = function (
  userId: Types.ObjectId,
  resourceId: Types.ObjectId,
): Promise<IReadingHistory | null> {
  return this.findOne({ user: userId, resourceId }).sort({ readAt: -1 }).exec();
};

readingHistorySchema.statics.getReadingTimeline = function (
  userId: Types.ObjectId,
  days = 30,
): Promise<IReadingHistory[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.find({
    user: userId,
    readAt: { $gte: startDate },
  })
    .sort({ readAt: -1 })
    .exec();
};

export const ReadingHistory = mongoose.model<
  IReadingHistory,
  IReadingHistoryModel
>("ReadingHistory", readingHistorySchema);
