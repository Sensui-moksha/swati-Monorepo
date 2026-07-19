import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commerceController } from "../controllers/commerceController";
import {
  createCouponSchema,
  updateCouponSchema,
  couponIdSchema,
  couponCodeSchema,
  couponListQuerySchema,
} from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/coupons:
 *   get:
 *     summary: List coupons
 *     tags: [Coupons]
 *   post:
 *     summary: Create coupon
 *     tags: [Coupons]
 * /api/v1/coupons/{id}:
 *   get:
 *     summary: Get coupon
 *     tags: [Coupons]
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  validate(couponListQuerySchema),
  commerceController.listCoupons.bind(commerceController),
);
router.get(
  "/code/:code",
  authenticate,
  authorize("admin"),
  validate(couponCodeSchema),
  commerceController.getCouponByCode.bind(commerceController),
);
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(couponIdSchema),
  commerceController.getCoupon.bind(commerceController),
);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createCouponSchema),
  commerceController.createCoupon.bind(commerceController),
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(couponIdSchema),
  validate(updateCouponSchema),
  commerceController.updateCoupon.bind(commerceController),
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(couponIdSchema),
  commerceController.deleteCoupon.bind(commerceController),
);
router.post(
  "/:id/archive",
  authenticate,
  authorize("admin"),
  validate(couponIdSchema),
  commerceController.archiveCoupon.bind(commerceController),
);
router.post(
  "/:id/restore",
  authenticate,
  authorize("admin"),
  validate(couponIdSchema),
  commerceController.restoreCoupon.bind(commerceController),
);

export default router;
