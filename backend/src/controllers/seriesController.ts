import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { seriesService } from "../services/seriesService";

export class SeriesController {
  async createSeries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const series = await seriesService.createSeries(req.body, req.user?.id);
      res.status(201).json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  async getSeries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const series = await seriesService.getSeriesById(req.params.id!);
      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  async getSeriesBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const series = await seriesService.getSeriesBySlug(req.params.slug!);
      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  async listSeries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await seriesService.listSeries(req.query as any, {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
        sort: req.query.sort as any,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateSeries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const series = await seriesService.updateSeries(req.params.id!, req.body);
      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }

  async deleteSeries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await seriesService.deleteSeries(req.params.id!);
      res.json({ success: true, message: "Series deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  async restoreSeries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const series = await seriesService.restoreSeries(req.params.id!);
      res.json({ success: true, data: series });
    } catch (error) {
      next(error);
    }
  }
}

export const seriesController = new SeriesController();
