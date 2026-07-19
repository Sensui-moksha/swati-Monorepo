import { Router } from "express";
import { highlightController } from "../controllers/highlightController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createHighlightSchema,
  updateHighlightSchema,
  highlightQuerySchema,
  highlightIdSchema,
} from "../validators/highlights";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(createHighlightSchema),
  highlightController.createHighlight.bind(highlightController),
);
router.get(
  "/",
  authenticate,
  validate(highlightQuerySchema),
  highlightController.getHighlights.bind(highlightController),
);
router.get(
  "/colors/distribution",
  authenticate,
  highlightController.getColorDistribution.bind(highlightController),
);
router.get(
  "/count",
  authenticate,
  highlightController.getHighlightCount.bind(highlightController),
);
router.get(
  "/:highlightId",
  authenticate,
  validate(highlightIdSchema),
  highlightController.getHighlight.bind(highlightController),
);
router.put(
  "/:highlightId",
  authenticate,
  validate(updateHighlightSchema),
  highlightController.updateHighlight.bind(highlightController),
);
router.delete(
  "/:highlightId",
  authenticate,
  validate(highlightIdSchema),
  highlightController.deleteHighlight.bind(highlightController),
);

export default router;
