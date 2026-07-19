import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commerceController } from "../controllers/commerceController";
import {
  createPromotionSchema,
  updatePromotionSchema,
  promotionIdSchema,
  promotionSlugSchema,
  promotionListQuerySchema,
} from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/promotions:
 *   get:
 *     summary: List promotions
 *     tags: [Promotions]
 *   post:
 *     summary: Create promotion
 *     tags: [Promotions]
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  validate(promotionListQuerySchema),
  commerceController.listPromotions.bind(commerceController),
);
router.get(
  "/active",
  commerceController.activePromotions.bind(commerceController),
);
router.get(
  "/slug/:slug",
  authenticate,
  authorize("admin"),
  validate(promotionSlugSchema),
  commerceController.getPromotionBySlug.bind(commerceController),
);
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(promotionIdSchema),
  commerceController.getPromotion.bind(commerceController),
);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createPromotionSchema),
  commerceController.createPromotion.bind(commerceController),
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(promotionIdSchema),
  validate(updatePromotionSchema),
  commerceController.updatePromotion.bind(commerceController),
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(promotionIdSchema),
  commerceController.deletePromotion.bind(commerceController),
);
router.post(
  "/:id/archive",
  authenticate,
  authorize("admin"),
  validate(promotionIdSchema),
  commerceController.archivePromotion.bind(commerceController),
);
router.post(
  "/:id/restore",
  authenticate,
  authorize("admin"),
  validate(promotionIdSchema),
  commerceController.restorePromotion.bind(commerceController),
);

export default router;
