import { Request, Response, NextFunction } from "express";
import { streamingStatisticsService } from "../services/StreamingStatisticsService";
import { optimizationRepository } from "../repositories/OptimizationRepository";

/**
 * @swagger
 * tags:
 *   name: PDF Performance
 *   description: Streaming performance metrics and storage health
 */
export class PerformanceController {
  /**
   * @swagger
   * /api/v1/pdf/statistics:
   *   get:
   *     summary: Global streaming statistics
   *     tags: [PDF Performance]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Streaming statistics
   */
  async statistics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [report, topPDFs] = await Promise.all([
        streamingStatisticsService.getPerformanceReport(),
        streamingStatisticsService.getTopStreamedPDFs(10),
      ]);
      res.json({ success: true, data: { report, topPDFs } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/performance:
   *   get:
   *     summary: Detailed performance metrics
   *     tags: [PDF Performance]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Performance report
   */
  async performance(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await streamingStatisticsService.getPerformanceReport();
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/health:
   *   get:
   *     summary: Storage and optimization health
   *     tags: [PDF Performance]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Health report
   */
  async health(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [optStats, report] = await Promise.all([
        optimizationRepository.getStats(),
        streamingStatisticsService.getPerformanceReport(),
      ]);
      res.json({
        success: true,
        data: {
          optimization: optStats,
          ssdCache: report.ssdCache,
          storage: report.storage,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const performanceController = new PerformanceController();
