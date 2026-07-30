import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { analyticsController } from "../controllers/analyticsController";
import {
  analyticsQuerySchema,
  analyticsExportSchema,
} from "../validators/analyticsValidators";

const router = Router();

/**
 * @swagger
 * /api/v1/analytics/live:
 *   get:
 *     summary: Connect to SSE real-time dashboard updates
 *     tags: [Analytics, RealTime]
 */
router.get("/live", authenticate, authorize("admin"), analyticsController.liveStream.bind(analyticsController));

/**
 * @swagger
 * /api/v1/analytics/executive:
 *   get:
 *     summary: Get high-level executive dashboard data
 *     tags: [Analytics, Executive]
 */
router.get("/executive", authenticate, authorize("admin"), analyticsController.getExecutiveDashboard.bind(analyticsController));

/**
 * @swagger
 * /api/v1/analytics/finance:
 *   get:
 *     summary: Get deep financial analytics and MRR
 *     tags: [Analytics, Finance]
 */
router.get("/finance", authenticate, authorize("admin"), analyticsController.getFinanceReports.bind(analyticsController));

/**
 * @swagger
 * /api/v1/analytics/overview:
 *   get:
 *     summary: Get platform overview analytics
 *     tags: [Analytics]
 */
router.get(
  "/overview",
  authenticate,
  authorize("admin"),
  validate(analyticsQuerySchema),
  analyticsController.getOverview.bind(analyticsController),
);

/**
 * @swagger
 * /api/v1/analytics/users:
 *   get:
 *     summary: Get user analytics and growth metrics
 *     tags: [Analytics]
 */
router.get(
  "/users",
  authenticate,
  authorize("admin"),
  validate(analyticsQuerySchema),
  analyticsController.getUsersAnalytics.bind(analyticsController),
);

/**
 * @swagger
 * /api/v1/analytics/reading:
 *   get:
 *     summary: Get reading activity analytics
 *     tags: [Analytics]
 */
router.get(
  "/reading",
  authenticate,
  authorize("admin"),
  validate(analyticsQuerySchema),
  analyticsController.getReadingAnalytics.bind(analyticsController),
);

/**
 * @swagger
 * /api/v1/analytics/content:
 *   get:
 *     summary: Get content engagement analytics
 *     tags: [Analytics]
 */
router.get(
  "/content",
  authenticate,
  authorize("admin"),
  validate(analyticsQuerySchema),
  analyticsController.getContentAnalytics.bind(analyticsController),
);

/**
 * @swagger
 * /api/v1/analytics/commerce:
 *   get:
 *     summary: Get commerce analytics
 *     tags: [Analytics]
 */
router.get(
  "/commerce",
  authenticate,
  authorize("admin"),
  validate(analyticsQuerySchema),
  analyticsController.getCommerceAnalytics.bind(analyticsController),
);

/**
 * @swagger
 * /api/v1/analytics/export:
 *   get:
 *     summary: Export analytics reports
 *     tags: [Analytics]
 */
router.get(
  "/export",
  authenticate,
  authorize("admin"),
  validate(analyticsExportSchema),
  analyticsController.exportAnalytics.bind(analyticsController),
);

// Added routes to support BI Dashboard views
router.get("/search", authenticate, authorize("admin"), analyticsController.getGenericAnalytics.bind(analyticsController));
router.get("/subscriptions", authenticate, authorize("admin"), analyticsController.getGenericAnalytics.bind(analyticsController));
router.get("/publications", authenticate, authorize("admin"), analyticsController.getGenericAnalytics.bind(analyticsController));
router.get("/transactions", authenticate, authorize("admin"), analyticsController.getGenericAnalytics.bind(analyticsController));
router.get("/publishing", authenticate, authorize("admin"), analyticsController.getGenericAnalytics.bind(analyticsController));
router.get("/recommendations", authenticate, authorize("admin"), analyticsController.getGenericAnalytics.bind(analyticsController));

export default router;
