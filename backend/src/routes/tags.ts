import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { tagController } from "../controllers/tagController";
import {
  createTagSchema,
  updateTagSchema,
  mergeTagsSchema,
  tagIdSchema,
} from "../validators/editorialValidators";

const router = Router();

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: List tags
 *     tags: [Editorial Tags]
 *   post:
 *     summary: Create tag
 *     tags: [Editorial Tags]
 * /api/tags/popular:
 *   get:
 *     summary: Popular tags
 *     tags: [Editorial Tags]
 * /api/tags/merge:
 *   post:
 *     summary: Merge tags
 *     tags: [Editorial Tags]
 */

router.get("/popular", tagController.popularTags.bind(tagController));
router.get("/", tagController.listTags.bind(tagController));
router.post(
  "/",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(createTagSchema),
  tagController.createTag.bind(tagController),
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(tagIdSchema),
  validate(updateTagSchema),
  tagController.updateTag.bind(tagController),
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(tagIdSchema),
  tagController.deleteTag.bind(tagController),
);
router.post(
  "/merge",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(mergeTagsSchema),
  tagController.mergeTags.bind(tagController),
);

export default router;
