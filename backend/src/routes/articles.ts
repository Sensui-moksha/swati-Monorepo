import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { editorialController } from "../controllers/editorialController";
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdSchema,
  articleSlugSchema,
  scheduleSchema,
  versionSchema,
  versionCompareSchema,
  listQuerySchema,
  relatedQuerySchema,
} from "../validators/editorialValidators";

const router = Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: List editorial articles
 *     tags: [Editorial Articles]
 *   post:
 *     summary: Create editorial article
 *     tags: [Editorial Articles]
 * /api/articles/{id}:
 *   get:
 *     summary: Preview article
 *     tags: [Editorial Articles]
 *   put:
 *     summary: Update article
 *     tags: [Editorial Articles]
 *   delete:
 *     summary: Delete article
 *     tags: [Editorial Articles]
 * /api/articles/{id}/publish:
 *   post:
 *     summary: Publish article
 *     tags: [Editorial Articles]
 * /api/articles/{id}/versions:
 *   post:
 *     summary: Save article version
 *     tags: [Editorial Articles]
 */

router.get(
  "/latest",
  editorialController.latestArticles.bind(editorialController),
);
router.get(
  "/featured",
  editorialController.featuredArticles.bind(editorialController),
);
router.get(
  "/editors-picks",
  editorialController.editorsPicks.bind(editorialController),
);
router.get(
  "/trending",
  editorialController.trendingArticles.bind(editorialController),
);
router.get(
  "/search",
  editorialController.searchArticles.bind(editorialController),
);
router.get(
  "/related/:id",
  validate(articleIdSchema),
  validate(relatedQuerySchema),
  editorialController.relatedArticles.bind(editorialController),
);
router.get(
  "/slug/:slug",
  validate(articleSlugSchema),
  editorialController.previewArticle.bind(editorialController),
);
router.get(
  "/:id/versions",
  authenticate,
  validate(articleIdSchema),
  editorialController.getVersions.bind(editorialController),
);
router.get(
  "/",
  validate(listQuerySchema),
  editorialController.listArticles.bind(editorialController),
);
router.get(
  "/:id",
  validate(articleIdSchema),
  editorialController.previewArticle.bind(editorialController),
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
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.deleteArticle.bind(editorialController),
);
router.post(
  "/:id/restore",
  authenticate,
  authorize("admin"),
  validate(articleIdSchema),
  editorialController.restoreArticle.bind(editorialController),
);
router.post(
  "/:id/publish",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.publishArticle.bind(editorialController),
);
router.post(
  "/:id/unpublish",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.unpublishArticle.bind(editorialController),
);
router.post(
  "/:id/schedule",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  validate(scheduleSchema),
  editorialController.scheduleArticle.bind(editorialController),
);
router.post(
  "/:id/archive",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.archiveArticle.bind(editorialController),
);
router.post(
  "/:id/duplicate",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.duplicateArticle.bind(editorialController),
);
router.post(
  "/:id/preview",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.previewArticle.bind(editorialController),
);
router.post(
  "/:id/submit",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.submitForReview.bind(editorialController),
);
router.post(
  "/:id/versions",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.createVersion.bind(editorialController),
);
router.post(
  "/:id/versions/compare",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  validate(versionCompareSchema),
  editorialController.compareVersions.bind(editorialController),
);
router.post(
  "/:id/versions/:version/restore",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(versionSchema),
  editorialController.restoreVersion.bind(editorialController),
);

export default router;
