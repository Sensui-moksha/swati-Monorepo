import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commerceController } from "../controllers/commerceController";
import {
  createInvoiceSchema,
  invoiceIdSchema,
  invoiceNumberSchema,
  invoiceListQuerySchema,
} from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/invoices:
 *   get:
 *     summary: List invoices
 *     tags: [Invoices]
 *   post:
 *     summary: Generate invoice
 *     tags: [Invoices]
 * /api/v1/invoices/{id}:
 *   get:
 *     summary: Get invoice
 *     tags: [Invoices]
 */
router.get(
  "/",
  authenticate,
  validate(invoiceListQuerySchema),
  commerceController.listInvoices.bind(commerceController),
);
router.get(
  "/number/:invoiceNumber",
  authenticate,
  validate(invoiceNumberSchema),
  commerceController.getInvoiceByNumber.bind(commerceController),
);
router.get(
  "/:id",
  authenticate,
  validate(invoiceIdSchema),
  commerceController.getInvoice.bind(commerceController),
);
router.get(
  "/:id/history",
  authenticate,
  validate(invoiceIdSchema),
  commerceController.invoiceHistory.bind(commerceController),
);
router.get(
  "/:id/download",
  authenticate,
  validate(invoiceIdSchema),
  commerceController.downloadInvoice.bind(commerceController),
);
router.post(
  "/",
  authenticate,
  validate(createInvoiceSchema),
  commerceController.generateInvoice.bind(commerceController),
);

export default router;
