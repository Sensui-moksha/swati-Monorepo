import { Request, Response, NextFunction } from "express";
import { hotCacheService } from "../services/HotCacheService";
import { streamingRepository } from "../repositories/StreamingRepository";
import { addJob, QUEUES } from "../jobs/queueManager";
import { ApiError } from "../middleware/errorHandler";

/**
 * @swagger
 * tags:
 *   name: PDF Cache
 *   description: SSD hot cache management
 */
export class CacheController {
  /**
   * @swagger
   * /api/v1/pdf/cache:
   *   get:
   *     summary: Get SSD cache statistics
   *     tags: [PDF Cache]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Cache stats
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 fileCount: { type: number }
   *                 totalSizeGB: { type: number }
   *                 utilizationPercent: { type: number }
   */
  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await hotCacheService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/cache/warm/{id}:
   *   post:
   *     summary: Warm a specific PDF into SSD cache
   *     tags: [PDF Cache]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Warm result }
   *       404: { description: PDF not found }
   */
  async warm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError("Missing id", 400);
      const record = await streamingRepository.findPDFById(id);
      if (!record?.metadata?.pdfPath) throw new ApiError("PDF not found", 404);

      await addJob(QUEUES.CACHE_WARMING, "warm-single", { limit: 1 });
      res.json({ success: true, message: "Cache warming queued" });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/cache/evict:
   *   post:
   *     summary: Evict expired cache entries
   *     tags: [PDF Cache]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200: { description: Eviction result }
   */
  async evict(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await addJob(QUEUES.CACHE_WARMING, "evict-expired", { evictExpired: true, limit: 0 });
      res.json({ success: true, message: "Cache eviction queued" });
    } catch (err) {
      next(err);
    }
  }
}

export const cacheController = new CacheController();
