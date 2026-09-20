import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { editorialController } from "../controllers/editorialController";
import {
  articleIdSchema,
  reviewSchema,
  versionSchema,
  versionCompareSchema,
} from "../validators/editorialValidators";

const router = Router();

/**
 * @swagger
 * /api/editorial/articles/{id}/approve:
 *   post:
 *     summary: Approve article
 *     tags: [Editorial Workflow]
 * /api/editorial/articles/{id}/reject:
 *   post:
 *     summary: Reject article
 *     tags: [Editorial Workflow]
 * /api/editorial/articles/{id}/request-changes:
 *   post:
 *     summary: Request changes
 *     tags: [Editorial Workflow]
 * /api/editorial/articles/{id}/versions/{version}/restore:
 *   post:
 *     summary: Restore article version
 *     tags: [Editorial Workflow]
 */

router.post(
  "/articles/:id/approve",
  authenticate,
  authorize("admin", "editor"),
  validate(articleIdSchema),
  editorialController.approveArticle.bind(editorialController),
);
router.post(
  "/articles/:id/reject",
  authenticate,
  authorize("admin", "editor"),
  validate(articleIdSchema),
  validate(reviewSchema),
  editorialController.rejectArticle.bind(editorialController),
);
router.post(
  "/articles/:id/request-changes",
  authenticate,
  authorize("admin", "editor"),
  validate(articleIdSchema),
  validate(reviewSchema),
  editorialController.requestChanges.bind(editorialController),
);
router.post(
  "/articles/:id/versions/:version/restore",
  authenticate,
  authorize("admin", "editor"),
  validate(versionSchema),
  editorialController.restoreVersion.bind(editorialController),
);
router.post(
  "/articles/:id/versions/compare",
  authenticate,
  authorize("admin", "editor"),
  validate(articleIdSchema),
  validate(versionCompareSchema),
  editorialController.compareVersions.bind(editorialController),
);

// ── Enterprise Editorial Workflow Engine ──────────────────────────────
router.post(
  "/articles/:id/workflow/transition",
  authenticate,
  authorize("admin", "editor"),
  editorialController.transitionWorkflow.bind(editorialController)
);
router.post(
  "/articles/:id/workflow/rollback",
  authenticate,
  authorize("admin", "editor"),
  editorialController.rollbackWorkflow.bind(editorialController)
);
router.get(
  "/articles/:id/workflow/history",
  authenticate,
  authorize("admin", "editor"),
  editorialController.getWorkflowHistory.bind(editorialController)
);

export default router;
