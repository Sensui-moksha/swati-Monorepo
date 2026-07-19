import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commerceController } from "../controllers/commerceController";
import {
  createPlanSchema,
  updatePlanSchema,
  planIdSchema,
  planSlugSchema,
  planListQuerySchema,
} from "../validators/commerceValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/plans:
 *   get:
 *     summary: List plans
 *     tags: [Plans]
 *   post:
 *     summary: Create plan
 *     tags: [Plans]
 * /api/v1/plans/{id}:
 *   get:
 *     summary: Get plan
 *     tags: [Plans]
 *   put:
 *     summary: Update plan
 *     tags: [Plans]
 *   delete:
 *     summary: Delete plan
 *     tags: [Plans]
 */
router.get(
  "/",
  validate(planListQuerySchema),
  commerceController.listPlans.bind(commerceController),
);
router.get(
  "/slug/:slug",
  validate(planSlugSchema),
  commerceController.getPlanBySlug.bind(commerceController),
);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createPlanSchema),
  commerceController.createPlan.bind(commerceController),
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(planIdSchema),
  validate(updatePlanSchema),
  commerceController.updatePlan.bind(commerceController),
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(planIdSchema),
  commerceController.deletePlan.bind(commerceController),
);
router.post(
  "/:id/archive",
  authenticate,
  authorize("admin"),
  validate(planIdSchema),
  commerceController.archivePlan.bind(commerceController),
);
router.post(
  "/:id/restore",
  authenticate,
  authorize("admin"),
  validate(planIdSchema),
  commerceController.restorePlan.bind(commerceController),
);
router.get(
  "/:id",
  validate(planIdSchema),
  commerceController.getPlan.bind(commerceController),
);

export default router;
