import { Request, Response, NextFunction } from "express";
import { pdfStreamingService } from "../services/PDFStreamingService";
import { streamingMetadataService } from "../services/StreamingMetadataService";
import { ApiError } from "../middleware/errorHandler";

/**
 * @swagger
 * tags:
 *   name: PDF Streaming
 *   description: Enterprise PDF streaming with HTTP Range Request support
 */
export class StreamingController {
  /**
   * @swagger
   * /api/v1/pdf/stream/{id}:
   *   get:
   *     summary: Stream a PDF with Range Request support
   *     tags: [PDF Streaming]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *         description: StoragePath document ID
   *       - in: header
   *         name: Range
   *         schema: { type: string, example: "bytes=0-1048575" }
   *         description: "HTTP Range header (RFC 7233). Returns 206 Partial Content."
   *     responses:
   *       200: { description: Full PDF stream }
   *       206: { description: Partial content (range request) }
   *       404: { description: PDF not found }
   *       416: { description: Range not satisfiable }
   */
  async stream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError("Missing PDF id", 400);
      await pdfStreamingService.streamPDF(id, req.headers.range, res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/range/{id}:
   *   get:
   *     summary: Explicit byte-range request
   *     tags: [PDF Streaming]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *       - in: query
   *         name: start
   *         required: true
   *         schema: { type: integer }
   *       - in: query
   *         name: end
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       206: { description: Partial PDF content }
   *       400: { description: Invalid range parameters }
   *       404: { description: PDF not found }
   */
  async rangeRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { start, end } = req.query;
      if (!id) throw new ApiError("Missing PDF id", 400);
      if (start === undefined || end === undefined)
        throw new ApiError("start and end query params required", 400);

      const rangeHeader = `bytes=${start}-${end}`;
      await pdfStreamingService.streamPDF(id, rangeHeader, res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/pdf/metadata/{id}:
   *   get:
   *     summary: Get PDF streaming metadata
   *     tags: [PDF Streaming]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: PDF metadata
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean }
   *                 data:
   *                   type: object
   *                   properties:
   *                     id: { type: string }
   *                     fileSize: { type: number }
   *                     pageCount: { type: number }
   *                     isLinearized: { type: boolean }
   *                     optimizationStatus: { type: string }
   *                     cacheStatus: { type: string }
   */
  async metadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) throw new ApiError("Missing PDF id", 400);
      const data = await streamingMetadataService.getMetadata(id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export const streamingController = new StreamingController();
