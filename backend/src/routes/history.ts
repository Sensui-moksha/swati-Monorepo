import { Router } from "express";
import { readingHistoryController } from "../controllers/readingHistoryController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  recordReadingSchema,
  historyQuerySchema,
  paramIdSchema,
} from "../validators/history";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(recordReadingSchema),
  readingHistoryController.recordReading.bind(readingHistoryController),
);
router.get(
  "/",
  authenticate,
  validate(historyQuerySchema),
  readingHistoryController.getHistory.bind(readingHistoryController),
);
router.get(
  "/recently-viewed",
  authenticate,
  readingHistoryController.getRecentlyViewed.bind(readingHistoryController),
);
router.get(
  "/timeline",
  authenticate,
  readingHistoryController.getReadingTimeline.bind(readingHistoryController),
);
router.get(
  "/:resourceId",
  authenticate,
  validate(paramIdSchema),
  readingHistoryController.getResourceHistory.bind(readingHistoryController),
);
router.delete(
  "/:resourceId",
  authenticate,
  validate(paramIdSchema),
  readingHistoryController.deleteHistory.bind(readingHistoryController),
);
router.delete(
  "/",
  authenticate,
  readingHistoryController.clearHistory.bind(readingHistoryController),
);

export default router;
