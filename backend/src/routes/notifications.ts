import { Router } from "express";
import { notificationController } from "../controllers/notificationController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  notificationQuerySchema,
  notificationIdSchema,
} from "../validators/notifications";

const router = Router();

router.get(
  "/",
  authenticate,
  validate(notificationQuerySchema),
  notificationController.getNotifications.bind(notificationController),
);
router.get(
  "/unread/count",
  authenticate,
  notificationController.getUnreadCount.bind(notificationController),
);
router.post(
  "/mark-all-read",
  authenticate,
  notificationController.markAllAsRead.bind(notificationController),
);
router.post(
  "/cleanup",
  authenticate,
  notificationController.deleteOldNotifications.bind(notificationController),
);
router.get(
  "/:notificationId",
  authenticate,
  validate(notificationIdSchema),
  notificationController.getNotification.bind(notificationController),
);
router.post(
  "/:notificationId/read",
  authenticate,
  validate(notificationIdSchema),
  notificationController.markAsRead.bind(notificationController),
);
router.delete(
  "/:notificationId",
  authenticate,
  validate(notificationIdSchema),
  notificationController.deleteNotification.bind(notificationController),
);

export default router;
