import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { commentController } from "../controllers/commentController";
import {
  createCommentSchema,
  moderateCommentSchema,
  commentIdSchema,
  articleCommentsSchema,
} from "../validators/editorialValidators";

const router = Router();

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create editorial comment
 *     tags: [Editorial Comments]
 * /api/comments/pending:
 *   get:
 *     summary: Pending comments
 *     tags: [Editorial Comments]
 * /api/comments/article/{articleId}:
 *   get:
 *     summary: Comments for article
 *     tags: [Editorial Comments]
 * /api/comments/{id}/moderate:
 *   patch:
 *     summary: Moderate comment
 *     tags: [Editorial Comments]
 */

router.post(
  "/",
  authenticate,
  validate(createCommentSchema),
  commentController.createComment.bind(commentController),
);
router.get(
  "/pending",
  authenticate,
  authorize("admin", "editor", "publisher"),
  commentController.listPending.bind(commentController),
);
router.get(
  "/article/:articleId",
  authenticate,
  validate(articleCommentsSchema),
  commentController.listByArticle.bind(commentController),
);
router.patch(
  "/:id/moderate",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(commentIdSchema),
  validate(moderateCommentSchema),
  commentController.moderate.bind(commentController),
);
router.post(
  "/:id/pin",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(commentIdSchema),
  commentController.pin.bind(commentController),
);
router.post(
  "/:id/unpin",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(commentIdSchema),
  commentController.unpin.bind(commentController),
);

export default router;
