import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { pdfStreamingService } from "../services/PDFStreamingService";
import { streamingMetadataService } from "../services/StreamingMetadataService";
import { deviceService } from "../services/DeviceService";
import { drmService } from "../services/DRMService";
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
   * Request a signed DRM streaming token with concurrent device validation.
   */
  async requestDRMToken(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id?.toString() || "guest-reader";
      const userEmail = req.user?.email;
      const { bookId, deviceId, deviceName, deviceType } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "unknown";

      if (!bookId) throw new ApiError("Missing bookId in request", 400);
      const effectiveDeviceId = deviceId || `dev-${crypto.createHash("md5").update(userAgent + clientIp).digest("hex").slice(0, 12)}`;

      // Register or verify device limits if authenticated user
      if (req.user) {
        await deviceService.registerOrTouchDevice(userId, effectiveDeviceId, {
          deviceName: deviceName || "Web Reader",
          deviceType: deviceType || "desktop",
          ipAddress: clientIp,
          userAgent,
        });
      }

      const tokenData = drmService.generateStreamingToken(userId, bookId, clientIp, userEmail);

      res.json({
        success: true,
        data: {
          ...tokenData,
          streamUrl: `/api/pdf/stream/${bookId}?drmToken=${tokenData.token}`,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Rotate a DRM streaming token during active reading session.
   */
  async rotateDRMToken(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";

      if (!token) throw new ApiError("Missing DRM token to rotate", 400);

      const verified = drmService.verifyStreamingToken(token, clientIp);
      if (!verified) throw new ApiError(403, "Invalid or expired DRM token cannot be rotated");

      const refreshed = drmService.generateStreamingToken(
        verified.userId,
        verified.bookId,
        clientIp,
        verified.userEmail
      );

      res.json({
        success: true,
        data: {
          ...refreshed,
          streamUrl: `/api/pdf/stream/${verified.bookId}?drmToken=${refreshed.token}`,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * List registered devices for current user.
   */
  async listDevices(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) throw new ApiError(401, "Authentication required");

      const devices = await deviceService.listUserDevices(userId);
      res.json({ success: true, data: devices });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Deauthorize an active device.
   */
  async deauthorizeDevice(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) throw new ApiError(401, "Authentication required");
      const { deviceId } = req.params;

      const success = await deviceService.deauthorizeDevice(userId, deviceId);
      res.json({ success, message: success ? "Device deauthorized" : "Device not found" });
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
