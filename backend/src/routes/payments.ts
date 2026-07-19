import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commerceController } from "../controllers/commerceController";
import {
  createPaymentSchema,
  paymentIdSchema,
  paymentRefSchema,
  paymentListQuerySchema,
  refundPaymentSchema,
} from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: List payments
 *     tags: [Payments]
 *   post:
 *     summary: Create payment record
 *     tags: [Payments]
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Get payment
 *     tags: [Payments]
 */
router.get(
  "/",
  authenticate,
  validate(paymentListQuerySchema),
  commerceController.listPayments.bind(commerceController),
);
router.get(
  "/reference/:referenceNumber",
  authenticate,
  validate(paymentRefSchema),
  commerceController.getPaymentByReference.bind(commerceController),
);
router.get(
  "/:id",
  authenticate,
  validate(paymentIdSchema),
  commerceController.getPayment.bind(commerceController),
);
router.post(
  "/",
  authenticate,
  validate(createPaymentSchema),
  commerceController.createPayment.bind(commerceController),
);
router.post(
  "/:id/verify",
  authenticate,
  validate(paymentIdSchema),
  commerceController.verifyPayment.bind(commerceController),
);
router.post(
  "/:id/capture",
  authenticate,
  validate(paymentIdSchema),
  commerceController.capturePayment.bind(commerceController),
);
router.post(
  "/:id/cancel",
  authenticate,
  validate(paymentIdSchema),
  commerceController.cancelPayment.bind(commerceController),
);
router.post(
  "/:id/refund",
  authenticate,
  authorize("admin", "publisher"),
  validate(paymentIdSchema),
  validate(refundPaymentSchema),
  commerceController.refundPayment.bind(commerceController),
);
router.get(
  "/:id/status",
  authenticate,
  validate(paymentIdSchema),
  commerceController.getPaymentStatus.bind(commerceController),
);
router.get(
  "/:id/attempts",
  authenticate,
  authorize("admin"),
  validate(paymentIdSchema),
  commerceController.paymentAttempts.bind(commerceController),
);
router.get(
  "/:id/audit-trail",
  authenticate,
  authorize("admin"),
  validate(paymentIdSchema),
  commerceController.paymentAuditTrail.bind(commerceController),
);

export default router;
