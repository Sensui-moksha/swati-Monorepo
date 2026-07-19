import { Router } from "express";
import { filesystemScannerController } from "../controllers/filesystemScannerController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// All filesystem scanner routes require authentication
router.use(authMiddleware);

// Job management
router.post("/jobs", filesystemScannerController.createJob);
router.get("/jobs", filesystemScannerController.getAllJobs);
router.get("/jobs/:id", filesystemScannerController.getJob);
router.post("/jobs/:id/cancel", filesystemScannerController.cancelJob);

// Scan operations
router.post(
  "/scan/full",
  adminMiddleware,
  filesystemScannerController.runFullScan,
);
router.post(
  "/scan/incremental",
  adminMiddleware,
  filesystemScannerController.runIncrementalScan,
);
router.post(
  "/scan/targeted",
  adminMiddleware,
  filesystemScannerController.runTargetedScan,
);
router.post(
  "/scan/deep",
  adminMiddleware,
  filesystemScannerController.runDeepScan,
);

// Schedule management
router.post(
  "/schedules",
  adminMiddleware,
  filesystemScannerController.createSchedule,
);
router.get("/schedules", filesystemScannerController.getAllSchedules);
router.get("/schedules/:id", filesystemScannerController.getSchedule);
router.put(
  "/schedules/:id",
  adminMiddleware,
  filesystemScannerController.updateSchedule,
);
router.delete(
  "/schedules/:id",
  adminMiddleware,
  filesystemScannerController.deleteSchedule,
);
router.post(
  "/schedules/:id/enable",
  adminMiddleware,
  filesystemScannerController.enableSchedule,
);
router.post(
  "/schedules/:id/disable",
  adminMiddleware,
  filesystemScannerController.disableSchedule,
);
router.post(
  "/schedules/:id/run",
  adminMiddleware,
  filesystemScannerController.runSchedule,
);

// Status
router.get("/status", filesystemScannerController.getStatus);

// Maintenance
router.post(
  "/cleanup",
  adminMiddleware,
  filesystemScannerController.cleanupOldJobs,
);

// Utility methods
router.get(
  "/folder/:path(*)/stats",
  filesystemScannerController.getFolderStats,
);
router.get("/folder/:path(*)/list", filesystemScannerController.listFolder);
router.get(
  "/file/:path(*)/checksum",
  filesystemScannerController.calculateChecksum,
);
router.post(
  "/file/:path(*)/verify-checksum",
  filesystemScannerController.verifyChecksum,
);

export default router;
