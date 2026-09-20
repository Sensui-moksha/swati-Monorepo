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
  listQuerySchema,
} from "../validators/editorialValidators";

const router = Router();

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: List editorial news
 *     tags: [Editorial News]
 *   post:
 *     summary: Create editorial news
 *     tags: [Editorial News]
 * /api/news/{id}:
 *   get:
 *     summary: Preview news
 *     tags: [Editorial News]
 *   put:
 *     summary: Update news
 *     tags: [Editorial News]
 *   delete:
 *     summary: Delete news
 *     tags: [Editorial News]
 * /api/news/{id}/publish:
 *   post:
 *     summary: Publish news
 *     tags: [Editorial News]
 */

router.get(
  "/featured",
  editorialController.featuredArticles.bind(editorialController),
);
router.get(
  "/breaking",
  editorialController.trendingArticles.bind(editorialController),
);
router.get("/search", editorialController.searchNews.bind(editorialController));
router.get(
  "/slug/:slug",
  validate(articleSlugSchema),
  editorialController.getArticleBySlug.bind(editorialController),
);
router.get(
  "/",
  validate(listQuerySchema),
  editorialController.listNews.bind(editorialController),
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
  editorialController.createNews.bind(editorialController),
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  validate(updateArticleSchema),
  editorialController.updateNews.bind(editorialController),
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.deleteNews.bind(editorialController),
);
router.post(
  "/:id/publish",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.publishNews.bind(editorialController),
);
router.post(
  "/:id/archive",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  editorialController.archiveNews.bind(editorialController),
);
router.post(
  "/:id/schedule",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(articleIdSchema),
  validate(scheduleSchema),
  editorialController.scheduleArticle.bind(editorialController),
);

export default router;
