import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { editorialController } from "../controllers/editorialController";
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdSchema,
} from "../validators/editorialValidators";

const router = Router();

/**
 * @swagger
 * /api/drafts:
 *   get:
 *     summary: List drafts
 *     tags: [Editorial Drafts]
 *   post:
 *     summary: Create draft
 *     tags: [Editorial Drafts]
 * /api/drafts/{id}/autosave:
 *   post:
 *     summary: Autosave draft
 *     tags: [Editorial Drafts]
 */

router.get(
  "/",
  authenticate,
  authorize("admin", "editor", "publisher"),
  editorialController.listArticles.bind(editorialController),
);
router.post(
  "/",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(createArticleSchema),
  editorialController.createArticle.bind(editorialController),
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  validate(updateArticleSchema),
  editorialController.updateArticle.bind(editorialController),
);
router.post(
  "/:id/autosave",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  validate(updateArticleSchema),
  editorialController.updateArticle.bind(editorialController),
);
router.post(
  "/:id/submit",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.submitForReview.bind(editorialController),
);
router.post(
  "/:id/review",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.approveArticle.bind(editorialController),
);

export default router;
