import { Request, Response, NextFunction } from "express";
import { pdfOptimizationService } from "../services/PDFOptimizationService";
import { optimizationRepository } from "../repositories/OptimizationRepository";
import { streamingRepository } from "../repositories/StreamingRepository";
import { ApiError } from "../middleware/errorHandler";
import { addJob, QUEUES } from "../jobs/queueManager";

/**
 * @swagger
 * tags:
 *   name: PDF Optimization
 *   description: PDF linearization and optimization pipeline
 */
export class OptimizationController {
  /**
   * @swagger
   * /api/v1/pdf/optimize:
   *   post:
   *     summary: Queue a PDF for optimization
   *     tags: [PDF Optimization]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [storagePathId]
   *             properties:
   *               storagePathId: { type: string }
   *     responses:
   *       200: { description: Job queued }
   *       404: { description: PDF not found }
   */
  async queueOptimization(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { storagePathId } = req.body as { storagePathId?: string };
      if (!storagePathId) throw new ApiError("storagePathId required", 400);

      const record = await streamingRepository.findPDFById(storagePathId);
      if (!record?.metadata?.pdfPath) throw new ApiError("PDF not found", 404);

      const { jobId, skipped } = await pdfOptimizationService.queueOptimization(
        storagePathId,
        record.metadata.pdfPath,
      );

      // Enqueue BullMQ job
      if (!skipped) {
        await addJob(QUEUES.PDF_OPTIMIZATION, "optimize-pdf", { jobId });
      }

      res.json({ success: true, data: { jobId, skipped } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/optimize/{id}:
   *   get:
   *     summary: Get optimization job status
   *     tags: [PDF Optimization]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *         description: OptimizationJob ID or StoragePath ID
   *     responses:
   *       200: { description: Job status }
   */
  async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const job = await optimizationRepository.findByStoragePath(id!)
        ?? await optimizationRepository.findById(id!);

      if (!job) throw new ApiError("Optimization job not found", 404);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/linearization/{id}:
   *   get:
   *     summary: Get linearization status for a PDF
   *     tags: [PDF Optimization]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Linearization status }
   */
  async getLinearizationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError("Missing id", 400);
      const record = await streamingRepository.findPDFById(id);

      if (!record) throw new ApiError("PDF not found", 404);
      res.json({
        success: true,
        data: {
          id,
          isLinearized: record.metadata?.isLinearized ?? null,
          pdfVersion: (record.metadata as any)?.pdfVersion ?? null,
          optimizationStatus: (record.metadata as any)?.optimizationStatus ?? null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/linearization/scan:
   *   post:
   *     summary: Queue a linearization scan batch
   *     tags: [PDF Optimization]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200: { description: Scan queued }
   */
  async queueLinearizationScan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchSize = 100 } = req.body as { batchSize?: number };
      await addJob(QUEUES.LINEARIZATION, "linearization-batch", { batchSize });
      res.json({ success: true, message: "Linearization scan queued", data: { batchSize } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/preprocessing/run:
   *   post:
   *     summary: Trigger a preprocessing pipeline batch
   *     tags: [PDF Optimization]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200: { description: Preprocessing queued }
   */
  async triggerPreprocessing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchSize = 100 } = req.body as { batchSize?: number };
      await addJob(QUEUES.PREPROCESSING, "manual-preprocessing", { batchSize });
      res.json({ success: true, message: "Preprocessing pipeline queued", data: { batchSize } });
    } catch (err) {
      next(err);
    }
  }
}

export const optimizationController = new OptimizationController();
