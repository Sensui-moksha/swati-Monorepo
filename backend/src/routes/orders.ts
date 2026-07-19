import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commerceController } from "../controllers/commerceController";
import {
  createOrderSchema,
  updateOrderSchema,
  orderIdSchema,
  orderNumberSchema,
  orderListQuerySchema,
} from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: List orders
 *     tags: [Orders]
 *   post:
 *     summary: Create order
 *     tags: [Orders]
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order
 *     tags: [Orders]
 */
router.get(
  "/",
  authenticate,
  validate(orderListQuerySchema),
  commerceController.listOrders.bind(commerceController),
);
router.get(
  "/number/:orderNumber",
  authenticate,
  validate(orderNumberSchema),
  commerceController.getOrderByNumber.bind(commerceController),
);
router.get(
  "/:id",
  authenticate,
  validate(orderIdSchema),
  commerceController.getOrder.bind(commerceController),
);
router.get(
  "/:id/history",
  authenticate,
  validate(orderIdSchema),
  commerceController.orderHistory.bind(commerceController),
);
router.post(
  "/",
  authenticate,
  validate(createOrderSchema),
  commerceController.createOrder.bind(commerceController),
);
router.put(
  "/:id",
  authenticate,
  validate(orderIdSchema),
  validate(updateOrderSchema),
  commerceController.updateOrder.bind(commerceController),
);
router.post(
  "/:id/cancel",
  authenticate,
  validate(orderIdSchema),
  commerceController.cancelOrder.bind(commerceController),
);

export default router;
