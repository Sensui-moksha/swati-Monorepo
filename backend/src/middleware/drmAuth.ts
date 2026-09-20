import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { drmService } from "../services/DRMService";
import { ApiError } from "./errorHandler";

/**
 * Middleware that guards PDF streaming endpoints using signed ephemeral DRM tokens.
 */
export async function verifyDRMStreamingToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = (req.query.drmToken as string) || (req.headers["x-drm-token"] as string);
  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "unknown";

  if (!token) {
    // If authenticated user has active session or API key, allow on-demand generation
    if (req.user) {
      const bookId = req.params.id || (req.query.bookId as string) || "unknown";
      const userEmail = (req.user as any).email || req.user._id.toString();
      const generated = drmService.generateStreamingToken(
        req.user._id.toString(),
        bookId,
        clientIp,
        userEmail
      );
      res.setHeader("X-DRM-Watermark-Id", generated.watermarkId);
      res.setHeader("X-DRM-Watermark-Text", generated.watermarkText);
      res.setHeader("X-DRM-Protected", "true");
      return next();
    }

    await drmService.recordSecurityEvent(
      "invalid_token",
      clientIp,
      userAgent,
      undefined,
      req.params.id,
      { reason: "Missing DRM streaming token" }
    );
    throw new ApiError(401, "DRM token required to stream publication");
  }

  const payload = drmService.verifyStreamingToken(token, clientIp);
  if (!payload) {
    await drmService.recordSecurityEvent(
      "expired_token",
      clientIp,
      userAgent,
      undefined,
      req.params.id,
      { reason: "Token signature invalid, IP mismatch, or expired" }
    );
    throw new ApiError(403, "Invalid or expired DRM streaming token");
  }

  // Inject dynamic watermark metadata into response headers for client viewer
  res.setHeader("X-DRM-Watermark-Id", payload.watermarkId);
  res.setHeader(
    "X-DRM-Watermark-Text",
    `Licensed to ${payload.userEmail || payload.userId} • Swathi ID: ${payload.watermarkId}`
  );
  res.setHeader("X-DRM-Protected", "true");

  next();
}
