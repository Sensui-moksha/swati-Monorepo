import { Response, NextFunction } from "express";
import { dashboardService } from "../services/DashboardService";
import { AuthRequest } from "../middleware/auth";

export class DashboardController {
  async getDashboard(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const dashboard = await dashboardService.getDashboard(userId);
      res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getReadingStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const stats = await dashboardService.getReadingStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getActivitySummary(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { days = 30 } = req.query;
      const activity = await dashboardService.getActivitySummary(
        userId,
        Number(days),
      );
      res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  }

  async getReadingGoalProgress(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const { goal = 12 } = req.query;
      const progress = await dashboardService.getReadingGoalProgress(
        userId,
        Number(goal),
      );
      res.json({ success: true, data: progress });
    } catch (error) {
      next(error);
    }
  }

  async getReadingHeatmap(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const heatmap = await dashboardService.getReadingHeatmap(userId);
      res.json({ success: true, data: heatmap });
    } catch (error) {
      next(error);
    }
  }

  async getPersonalizedRecommendations(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const recommendations =
        await dashboardService.getPersonalizedRecommendations(userId);
      res.json({ success: true, data: recommendations });
    } catch (error) {
      next(error);
    }
  }

  async getDetailedStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user._id;
      const stats = await dashboardService.getDetailedStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
