import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commerceController } from "../controllers/commerceController";
import { reportingQuerySchema } from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/reports/revenue:
 *   get:
 *     summary: Revenue summary
 *     tags: [Reports]
 */
router.get(
  "/revenue",
  authenticate,
  authorize("admin"),
  validate(reportingQuerySchema),
  commerceController.revenueSummary.bind(commerceController),
);
router.get(
  "/orders",
  authenticate,
  authorize("admin"),
  validate(reportingQuerySchema),
  commerceController.reportOrders.bind(commerceController),
);
router.get(
  "/subscriptions",
  authenticate,
  authorize("admin"),
  validate(reportingQuerySchema),
  commerceController.reportSubscriptions.bind(commerceController),
);
router.get(
  "/invoices",
  authenticate,
  authorize("admin"),
  validate(reportingQuerySchema),
  commerceController.reportInvoices.bind(commerceController),
);
router.get(
  "/coupons",
  authenticate,
  authorize("admin"),
  validate(reportingQuerySchema),
  commerceController.reportCoupons.bind(commerceController),
);
router.get(
  "/transactions",
  authenticate,
  authorize("admin"),
  validate(reportingQuerySchema),
  commerceController.reportTransactions.bind(commerceController),
);

export default router;
