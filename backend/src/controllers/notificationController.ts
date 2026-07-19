import { Response, NextFunction } from "express";
import { notificationService } from "../services/NotificationService";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Types } from "mongoose";

export class NotificationController {
  async getNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { filter = "all", type, page = 1, limit = 20 } = req.query;

      let result;
      if (filter === "unread") {
        result = await notificationService.getUnreadNotifications(
          userId,
          Number(page),
          Number(limit),
        );
      } else if (type && typeof type === "string") {
        result = await notificationService.getNotificationsByType(
          userId,
          type as any,
          Number(page),
          Number(limit),
        );
      } else {
        result = await notificationService.getNotifications(
          userId,
          Number(page),
          Number(limit),
        );
      }

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getNotification(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { notificationId } = req.params;

      if (!notificationId) {
        throw new ApiError(400, "notificationId is required");
      }

      const notification = await notificationService.getNotification(
        new Types.ObjectId(notificationId),
        userId,
      );
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { notificationId } = req.params;

      if (!notificationId) {
        throw new ApiError(400, "notificationId is required");
      }

      const notification = await notificationService.markAsRead(
        new Types.ObjectId(notificationId),
        userId,
      );
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      await notificationService.markAllAsRead(userId);
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { notificationId } = req.params;

      if (!notificationId) {
        throw new ApiError(400, "notificationId is required");
      }

      await notificationService.deleteNotification(
        new Types.ObjectId(notificationId),
        userId,
      );
      res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async deleteOldNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { daysOld = 90 } = req.body;
      await notificationService.deleteOldNotifications(userId, daysOld);
      res.json({ success: true, message: "Old notifications deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
