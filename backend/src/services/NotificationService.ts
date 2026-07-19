import { Types } from "mongoose";
import { ApiError } from "../middleware/errorHandler";
import { notificationRepository } from "../repositories/NotificationRepository";
import { INotification, NotificationType } from "../models/Notification";

export class NotificationService {
  async createNotification(
    userId: Types.ObjectId,
    data: Partial<INotification>,
  ): Promise<INotification> {
    if (!data.title || !data.message || !data.type) {
      throw new ApiError(400, "title, message, and type are required");
    }

    return notificationRepository.create({
      ...data,
      user: userId,
      isRead: false,
    });
  }

  async getNotifications(userId: Types.ObjectId, page = 1, limit = 20) {
    return notificationRepository.findByUser(userId, { page, limit });
  }

  async getUnreadNotifications(userId: Types.ObjectId, page = 1, limit = 20) {
    return notificationRepository.findUnreadByUser(userId, { page, limit });
  }

  async getNotificationsByType(
    userId: Types.ObjectId,
    type: NotificationType,
    page = 1,
    limit = 20,
  ) {
    return notificationRepository.findByUserAndType(userId, type, {
      page,
      limit,
    });
  }

  async getNotification(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<INotification | null> {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification || notification.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Notification not found");
    }
    return notification;
  }

  async markAsRead(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<INotification | null> {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification || notification.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Notification not found");
    }

    return notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: Types.ObjectId): Promise<void> {
    await notificationRepository.markAllAsReadByUser(userId);
  }

  async deleteNotification(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification || notification.user.toString() !== userId.toString()) {
      throw new ApiError(404, "Notification not found");
    }

    await notificationRepository.deleteById(notificationId);
  }

  async getUnreadCount(userId: Types.ObjectId): Promise<number> {
    return notificationRepository.countUnreadByUser(userId);
  }

  async deleteOldNotifications(
    userId: Types.ObjectId,
    daysOld = 90,
  ): Promise<void> {
    await notificationRepository.deleteByUserAndAge(userId, daysOld);
  }

  async deleteOldReadNotifications(
    userId: Types.ObjectId,
    daysOld = 30,
  ): Promise<void> {
    await notificationRepository.deleteOldReadNotifications(userId, daysOld);
  }

  async sendNotification(
    userId: Types.ObjectId,
    type: NotificationType,
    title: string,
    message: string,
    data?: Partial<INotification>,
  ): Promise<INotification> {
    return this.createNotification(userId, {
      type,
      title,
      message,
      ...data,
    });
  }
}

export const notificationService = new NotificationService();
