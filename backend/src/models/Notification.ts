import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type NotificationType =
  | "book_published"
  | "publication_released"
  | "magazine_released"
  | "author_new_work"
  | "reading_milestone"
  | "recommendation"
  | "subscription_expiring"
  | "subscription_expired"
  | "system";

export interface INotification extends Document {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  resourceId?: Types.ObjectId;
  resourceType?: "book" | "publication" | "magazine_issue" | "author";
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface INotificationModel extends Model<INotification> {
  findByUser(userId: Types.ObjectId, limit?: number): Promise<INotification[]>;
  findUnreadByUser(userId: Types.ObjectId): Promise<INotification[]>;
  countUnreadByUser(userId: Types.ObjectId): Promise<number>;
  markAsRead(notificationId: Types.ObjectId): Promise<INotification | null>;
  markAllAsReadByUser(userId: Types.ObjectId): Promise<any>;
  deleteByUserAndAge(userId: Types.ObjectId, daysOld?: number): Promise<any>;
}

const notificationSchema = new Schema<INotification, INotificationModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    type: {
      type: String,
      enum: [
        "book_published",
        "publication_released",
        "magazine_released",
        "author_new_work",
        "reading_milestone",
        "recommendation",
        "subscription_expiring",
        "subscription_expired",
        "system",
      ],
      required: [true, "Notification type is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    actionUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "URL must be valid"],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
    },
    resourceType: {
      type: String,
      enum: ["book", "publication", "magazine_issue", "author"],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });
// TTL index - auto-delete after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Static methods
notificationSchema.statics.findByUser = function (
  userId: Types.ObjectId,
  limit = 50,
): Promise<INotification[]> {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

notificationSchema.statics.findUnreadByUser = function (
  userId: Types.ObjectId,
): Promise<INotification[]> {
  return this.find({ user: userId, isRead: false })
    .sort({ createdAt: -1 })
    .exec();
};

notificationSchema.statics.countUnreadByUser = function (
  userId: Types.ObjectId,
): Promise<number> {
  return this.countDocuments({ user: userId, isRead: false });
};

notificationSchema.statics.markAsRead = function (
  notificationId: Types.ObjectId,
): Promise<INotification | null> {
  return this.findByIdAndUpdate(
    notificationId,
    { isRead: true, readAt: new Date() },
    { new: true },
  ).exec();
};

notificationSchema.statics.markAllAsReadByUser = function (
  userId: Types.ObjectId,
): Promise<any> {
  return this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() },
  ).exec();
};

notificationSchema.statics.deleteByUserAndAge = function (
  userId: Types.ObjectId,
  daysOld = 90,
): Promise<any> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  return this.deleteMany({
    user: userId,
    createdAt: { $lt: cutoffDate },
  }).exec();
};

export const Notification = mongoose.model<INotification, INotificationModel>(
  "Notification",
  notificationSchema,
);
