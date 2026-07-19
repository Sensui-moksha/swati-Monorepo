import { Response, NextFunction } from "express";
import { recommendationService } from "../services/RecommendationService";
import { AuthRequest } from "../middleware/auth";

export class RecommendationController {
  async getPersonalizedRecommendations(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const recommendations =
        await recommendationService.getPersonalizedRecommendations(userId);
      res.json({ success: true, data: recommendations });
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationController = new RecommendationController();
