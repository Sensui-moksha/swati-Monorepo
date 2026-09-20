import { Router } from "express";
import { versionControlController } from "../controllers/versionControlController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Version control routes require authentication
router.use(authenticate);

// Get version history
router.get(
  "/:entityType/:entityId",
  authorize("admin", "chief_editor", "senior_editor", "editor"),
  versionControlController.getHistory.bind(versionControlController)
);

// Compare two versions
router.get(
  "/:entityType/:entityId/diff",
  authorize("admin", "chief_editor", "senior_editor", "editor"),
  versionControlController.getDiff.bind(versionControlController)
);

// Get specific version
router.get(
  "/:entityType/:entityId/:versionNumber",
  authorize("admin", "chief_editor", "senior_editor", "editor"),
  versionControlController.getVersion.bind(versionControlController)
);

// Create manual snapshot
router.post(
  "/:entityType/:entityId/snapshot",
  authorize("admin", "chief_editor", "senior_editor", "editor"),
  versionControlController.createSnapshot.bind(versionControlController)
);

// Rollback to version (requires senior editorial or admin role)
router.post(
  "/:entityType/:entityId/rollback",
  authorize("admin", "chief_editor", "senior_editor"),
  versionControlController.rollback.bind(versionControlController)
);

// Prune old versions (admin only)
router.delete(
  "/:entityType/:entityId/prune",
  authorize("admin"),
  versionControlController.prune.bind(versionControlController)
);

export default router;
