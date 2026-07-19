import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { analyticsService } from "../services/analyticsService";

export class AnalyticsController {
  async getOverview(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { from, to } = req.query;
      res.json({
        success: true,
        data: await analyticsService.getOverview({
          from: from ? new Date(String(from)) : undefined,
          to: to ? new Date(String(to)) : undefined,
        }),
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsersAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      res.json({
        success: true,
        data: await analyticsService.getUsersAnalytics({
          from: req.query.from ? new Date(String(req.query.from)) : undefined,
          to: req.query.to ? new Date(String(req.query.to)) : undefined,
          page,
          limit,
          userId: req.query.userId ? String(req.query.userId) : undefined,
        }),
      });
    } catch (error) {
      next(error);
    }
  }

  async getReadingAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      res.json({
        success: true,
        data: await analyticsService.getReadingAnalytics({
          from: req.query.from ? new Date(String(req.query.from)) : undefined,
          to: req.query.to ? new Date(String(req.query.to)) : undefined,
          page,
          limit,
        }),
      });
    } catch (error) {
      next(error);
    }
  }

  async getContentAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      res.json({
        success: true,
        data: await analyticsService.getContentAnalytics({
          from: req.query.from ? new Date(String(req.query.from)) : undefined,
          to: req.query.to ? new Date(String(req.query.to)) : undefined,
          page,
          limit,
          categoryId: req.query.categoryId
            ? String(req.query.categoryId)
            : undefined,
          tagId: req.query.tagId ? String(req.query.tagId) : undefined,
        }),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommerceAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      res.json({
        success: true,
        data: await analyticsService.getCommerceAnalytics({
          from: req.query.from ? new Date(String(req.query.from)) : undefined,
          to: req.query.to ? new Date(String(req.query.to)) : undefined,
          page,
          limit,
        }),
      });
    } catch (error) {
      next(error);
    }
  }

  async exportAnalytics(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const exportFormat = String(req.query.exportFormat || "json");
      const report = await analyticsService.exportAnalytics({
        from: req.query.from ? new Date(String(req.query.from)) : undefined,
        to: req.query.to ? new Date(String(req.query.to)) : undefined,
        type: req.query.type ? String(req.query.type) : "overview",
        exportFormat,
      });
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
