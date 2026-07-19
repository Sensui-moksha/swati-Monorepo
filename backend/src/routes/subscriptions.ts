import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commerceController } from "../controllers/commerceController";
import {
  createSubscriptionSchema,
  subscriptionActionSchema,
  subscriptionIdSchema,
  subscriptionListQuerySchema,
} from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/subscriptions:
 *   get:
 *     summary: List subscriptions
 *     tags: [Subscriptions]
 *   post:
 *     summary: Subscribe user
 *     tags: [Subscriptions]
 * /api/v1/subscriptions/{id}:
 *   get:
 *     summary: Get subscription
 *     tags: [Subscriptions]
 */
router.get(
  "/",
  authenticate,
  validate(subscriptionListQuerySchema),
  commerceController.listSubscriptions.bind(commerceController),
);
router.get(
  "/:id",
  authenticate,
  validate(subscriptionIdSchema),
  commerceController.getSubscription.bind(commerceController),
);
router.get(
  "/:id/history",
  authenticate,
  validate(subscriptionIdSchema),
  commerceController.subscriptionHistory.bind(commerceController),
);
router.post(
  "/",
  authenticate,
  authorize("admin", "publisher", "editor"),
  validate(createSubscriptionSchema),
  commerceController.subscribe.bind(commerceController),
);
router.post(
  "/:id/renew",
  authenticate,
  validate(subscriptionIdSchema),
  validate(subscriptionActionSchema),
  commerceController.renew.bind(commerceController),
);
router.post(
  "/:id/upgrade",
  authenticate,
  validate(subscriptionIdSchema),
  validate(subscriptionActionSchema),
  commerceController.upgrade.bind(commerceController),
);
router.post(
  "/:id/downgrade",
  authenticate,
  validate(subscriptionIdSchema),
  validate(subscriptionActionSchema),
  commerceController.downgrade.bind(commerceController),
);
router.post(
  "/:id/pause",
  authenticate,
  validate(subscriptionIdSchema),
  validate(subscriptionActionSchema),
  commerceController.pause.bind(commerceController),
);
router.post(
  "/:id/resume",
  authenticate,
  validate(subscriptionIdSchema),
  validate(subscriptionActionSchema),
  commerceController.resume.bind(commerceController),
);
router.post(
  "/:id/cancel",
  authenticate,
  validate(subscriptionIdSchema),
  validate(subscriptionActionSchema),
  commerceController.cancelSubscription.bind(commerceController),
);
router.post(
  "/:id/expire",
  authenticate,
  authorize("admin"),
  validate(subscriptionIdSchema),
  validate(subscriptionActionSchema),
  commerceController.expire.bind(commerceController),
);

export default router;
