import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { systemController } from "../controllers/systemController";
import { systemSchemas } from "../validators/systemValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/system/info:
 *   get:
 *     summary: Get application info (name, version)
 *     tags: [System]
 */
router.get(
  "/info",
  authenticate,
  authorize("admin"),
  systemController.getAppInfo.bind(systemController),
);

/**
 * @swagger
 * /api/v1/system/health:
 *   get:
 *     summary: Get application health
 *     tags: [System]
 */
router.get(
  "/health",
  authenticate,
  authorize("admin"),
  systemController.getHealth.bind(systemController),
);

/**
 * @swagger
 * /api/v1/system/database:
 *   get:
 *     summary: Get database statistics
 *     tags: [System]
 */
router.get(
  "/database",
  authenticate,
  authorize("admin"),
  systemController.getDatabaseStats.bind(systemController),
);

/**
 * @swagger
 * /api/v1/system/settings:
 *   get:
 *     summary: List persisted system settings
 *     tags: [System]
 */
router.get(
  "/settings",
  authenticate,
  authorize("admin"),
  systemController.listSettings.bind(systemController),
);

/**
 * @swagger
 * /api/v1/system/settings/{key}:
 *   get:
 *     summary: Get a setting by key
 *     tags: [System]
 */
router.get(
  "/settings/:key",
  authenticate,
  authorize("admin"),
  validate(systemSchemas.keyParam),
  systemController.getSetting.bind(systemController),
);

/**
 * @swagger
 * /api/v1/system/settings/{key}:
 *   put:
 *     summary: Create/update a setting by key
 *     tags: [System]
 */
router.put(
  "/settings/:key",
  authenticate,
  authorize("admin"),
  validate(systemSchemas.upsertSetting),
  systemController.upsertSetting.bind(systemController),
);

/**
 * @swagger
 * /api/v1/system/email/test:
 *   post:
 *     summary: Send a test email (placeholder)
 *     tags: [System]
 */
router.post(
  "/email/test",
  authenticate,
  authorize("admin"),
  systemController.testEmail.bind(systemController),
);

export default router;
