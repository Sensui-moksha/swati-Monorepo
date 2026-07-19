import { Router } from "express";
import { filesystemWatcherController } from "../controllers/filesystemWatcherController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// All filesystem watcher routes require authentication
router.use(authMiddleware);

// Watcher management
router.get("/status", filesystemWatcherController.getStatus);
router.post(
  "/watch",
  adminMiddleware,
  filesystemWatcherController.startWatching,
);
router.delete(
  "/watch/:path(*)",
  adminMiddleware,
  filesystemWatcherController.stopWatching,
);
router.put(
  "/config",
  adminMiddleware,
  filesystemWatcherController.updateConfig,
);

// Event handling
router.get("/events", filesystemWatcherController.getRecentEvents);
router.post(
  "/force-sync",
  adminMiddleware,
  filesystemWatcherController.forceSync,
);

// Real-time event stream (Server-Sent Events)
router.get("/stream", filesystemWatcherController.getEventStream);

export default router;
