import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { mediaController } from "../controllers/mediaController";
import { uploadSingle, handleMulterError } from "../middleware/upload";
import {
  mediaIdSchema,
  mediaQuerySchema,
  mediaUpdateSchema,
} from "../validators/editorialValidators";

const router = Router();

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: List media
 *     tags: [Editorial Media]
 * /api/media/{id}:
 *   get:
 *     summary: Get media details
 *     tags: [Editorial Media]
 *   put:
 *     summary: Update media metadata
 *     tags: [Editorial Media]
 *   delete:
 *     summary: Delete media
 *     tags: [Editorial Media]
 * /api/media/{id}/replace:
 *   post:
 *     summary: Replace media asset
 *     tags: [Editorial Media]
 */

router.post(
  "/upload",
  authenticate,
  authorize("admin", "editor", "publisher"),
  uploadSingle("file"),
  handleMulterError,
  mediaController.uploadMedia.bind(mediaController),
);

router.post(
  "/",
  authenticate,
  authorize("admin", "editor", "publisher"),
  uploadSingle("file"),
  handleMulterError,
  mediaController.uploadMedia.bind(mediaController),
);

router.get(
  "/",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(mediaQuerySchema),
  mediaController.listMedia.bind(mediaController),
);
router.get(
  "/recent",
  authenticate,
  authorize("admin", "editor", "publisher"),
  mediaController.getRecentUploads.bind(mediaController),
);
router.get(
  "/usage",
  authenticate,
  authorize("admin", "editor", "publisher"),
  mediaController.getUsage.bind(mediaController),
);
router.get(
  "/stats",
  authenticate,
  authorize("admin", "editor", "publisher"),
  mediaController.getStats.bind(mediaController),
);
router.get(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(mediaIdSchema),
  mediaController.getMedia.bind(mediaController),
);
router.get(
  "/:id/preview",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(mediaIdSchema),
  mediaController.previewMedia.bind(mediaController),
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(mediaIdSchema),
  validate(mediaUpdateSchema),
  mediaController.updateMedia.bind(mediaController),
);
router.post(
  "/:id/replace",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(mediaIdSchema),
  validate(mediaUpdateSchema),
  mediaController.replaceMedia.bind(mediaController),
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "editor", "publisher"),
  validate(mediaIdSchema),
  mediaController.deleteMedia.bind(mediaController),
);

export default router;
