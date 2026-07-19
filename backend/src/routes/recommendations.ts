import { Router } from "express";
import { recommendationController } from "../controllers/recommendationController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/v1/recommendations:
 *   get:
 *     summary: Get personalized recommendations for the authenticated user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized recommendations
 */
router.get(
  "/",
  authenticate,
  recommendationController.getPersonalizedRecommendations.bind(
    recommendationController,
  ),
);

export default router;
