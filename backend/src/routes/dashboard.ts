import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authenticate,
  dashboardController.getDashboard.bind(dashboardController),
);
router.get(
  "/stats/reading",
  authenticate,
  dashboardController.getReadingStats.bind(dashboardController),
);
router.get(
  "/activity",
  authenticate,
  dashboardController.getActivitySummary.bind(dashboardController),
);
router.get(
  "/goals/progress",
  authenticate,
  dashboardController.getReadingGoalProgress.bind(dashboardController),
);
router.get(
  "/heatmap",
  authenticate,
  dashboardController.getReadingHeatmap.bind(dashboardController),
);
/**
 * @swagger
 * /api/v1/dashboard/recommendations:
 *   get:
 *     summary: Get personalized recommendations for the authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations
 */
router.get(
  "/recommendations",
  authenticate,
  dashboardController.getPersonalizedRecommendations.bind(dashboardController),
);
router.get(
  "/stats/detailed",
  authenticate,
  dashboardController.getDetailedStats.bind(dashboardController),
);

export default router;
