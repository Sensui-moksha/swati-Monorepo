import { Types } from "mongoose";
import {
  BaseRepository,
  PaginationOptions,
  PaginatedResult,
} from "./BaseRepository";
import {
  Notification,
  INotification,
  NotificationType,
} from "../models/Notification";

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }

  async findByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INotification>> {
    return this.findWithPagination(
      { user: userId },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async findUnreadByUser(
    userId: Types.ObjectId,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INotification>> {
    return this.findWithPagination(
      { user: userId, isRead: false },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async countUnreadByUser(userId: Types.ObjectId): Promise<number> {
    return this.model.countDocuments({ user: userId, isRead: false });
  }

  async findByUserAndType(
    userId: Types.ObjectId,
    type: NotificationType,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<INotification>> {
    return this.findWithPagination(
      { user: userId, type },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async markAsRead(
    notificationId: Types.ObjectId,
  ): Promise<INotification | null> {
    return this.updateById(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  async markAllAsReadByUser(userId: Types.ObjectId): Promise<any> {
    return this.model
      .updateMany(
        { user: userId, isRead: false },
        { isRead: true, readAt: new Date() },
      )
      .exec();
  }

  async deleteByUserAndAge(userId: Types.ObjectId, daysOld = 90): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return this.model
      .deleteMany({ user: userId, createdAt: { $lt: cutoffDate } })
      .exec();
  }

  async deleteOldReadNotifications(
    userId: Types.ObjectId,
    daysOld = 30,
  ): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return this.model
      .deleteMany({
        user: userId,
        isRead: true,
        createdAt: { $lt: cutoffDate },
      })
      .exec();
  }

  async findByResourceId(
    userId: Types.ObjectId,
    resourceId: Types.ObjectId,
  ): Promise<INotification[]> {
    return this.model
      .find({ user: userId, resourceId })
      .sort({ createdAt: -1 })
      .exec();
  }
}

export const notificationRepository = new NotificationRepository();
