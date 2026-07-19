import { Router } from "express";
import { storageSyncController } from "../controllers/storageSyncController";
import { authMiddleware } from "../middleware/auth";
import { adminMiddleware } from "../middleware/admin";

const router = Router();

// All storage sync routes require authentication
router.use(authMiddleware);

// Job management
router.post("/jobs", storageSyncController.createJob);
router.get("/jobs", storageSyncController.getAllJobs);
router.get("/jobs/:id", storageSyncController.getJob);
router.post("/jobs/:id/cancel", storageSyncController.cancelJob);

// Manual sync operations
router.post("/sync/full", adminMiddleware, storageSyncController.runFullSync);
router.post(
  "/sync/partial",
  adminMiddleware,
  storageSyncController.runPartialSync,
);
router.post(
  "/sync/incremental",
  adminMiddleware,
  storageSyncController.runIncrementalSync,
);
router.post(
  "/sync/repair",
  adminMiddleware,
  storageSyncController.runRepairSync,
);
router.post(
  "/sync/verify",
  adminMiddleware,
  storageSyncController.runVerifySync,
);

// Schedule management
router.post(
  "/schedules",
  adminMiddleware,
  storageSyncController.createSchedule,
);
router.get("/schedules", storageSyncController.getAllSchedules);
router.get("/schedules/:id", storageSyncController.getSchedule);
router.put(
  "/schedules/:id",
  adminMiddleware,
  storageSyncController.updateSchedule,
);
router.delete(
  "/schedules/:id",
  adminMiddleware,
  storageSyncController.deleteSchedule,
);
router.post(
  "/schedules/:id/enable",
  adminMiddleware,
  storageSyncController.enableSchedule,
);
router.post(
  "/schedules/:id/disable",
  adminMiddleware,
  storageSyncController.disableSchedule,
);
router.post(
  "/schedules/:id/run",
  adminMiddleware,
  storageSyncController.runSchedule,
);

// Status
router.get("/status", storageSyncController.getStatus);

// Maintenance
router.post("/cleanup", adminMiddleware, storageSyncController.cleanupOldJobs);

export default router;
