import { Router } from "express";
import { readingProgressController } from "../controllers/readingProgressController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  startReadingSchema,
  updateProgressSchema,
  progressQuerySchema,
  paramIdSchema,
  readerContentSchema,
} from "../validators/progress";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(startReadingSchema),
  readingProgressController.startReading.bind(readingProgressController),
);
router.get(
  "/",
  authenticate,
  validate(progressQuerySchema),
  readingProgressController.getActiveReadings.bind(readingProgressController),
);
router.get(
  "/completed",
  authenticate,
  readingProgressController.getCompletedReadings.bind(
    readingProgressController,
  ),
);
router.get(
  "/continue-reading",
  authenticate,
  readingProgressController.getContinueReading.bind(readingProgressController),
);
router.get(
  "/stats",
  authenticate,
  readingProgressController.getStats.bind(readingProgressController),
);
router.get(
  "/:resourceId",
  authenticate,
  validate(paramIdSchema),
  readingProgressController.getProgress.bind(readingProgressController),
);
router.put(
  "/:resourceId",
  authenticate,
  validate(updateProgressSchema),
  readingProgressController.updateProgress.bind(readingProgressController),
);
router.post(
  "/:resourceId/complete",
  authenticate,
  validate(paramIdSchema),
  readingProgressController.completeReading.bind(readingProgressController),
);
router.delete(
  "/:resourceId",
  authenticate,
  validate(paramIdSchema),
  readingProgressController.deleteProgress.bind(readingProgressController),
);

// Reader content routes
router.get(
  "/content/:resourceId/:resourceType",
  authenticate,
  validate(readerContentSchema),
  readingProgressController.getReaderContent.bind(readingProgressController),
);
router.get(
  "/related/:resourceId/:resourceType",
  authenticate,
  validate(readerContentSchema),
  readingProgressController.getRelatedContent.bind(readingProgressController),
);
router.put(
  "/preferences",
  authenticate,
  readingProgressController.updateReadingPreferences.bind(
    readingProgressController,
  ),
);

export default router;
