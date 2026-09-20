import crypto from "crypto";
import mongoose from "mongoose";
import { DRMSecurityEvent } from "../models/DRMSecurityEvent";
import { env } from "../config";
import { logger } from "../utils/logger";

const DRM_SECRET = process.env.DRM_SIGNING_SECRET || env.JWT_ACCESS_SECRET || "swathi-drm-master-key-2026";
const TOKEN_TTL_SECONDS = 60; // 60 seconds ephemeral window for stream range requests

export interface StreamingTokenPayload {
  userId: string;
  bookId: string;
  clientIp: string;
  userEmail?: string;
  expiresAt: number;
  watermarkId: string;
}

export class DRMService {
  /**
   * Generates a signed ephemeral token required for PDF stream byte-ranges.
   */
  generateStreamingToken(
    userId: string,
    bookId: string,
    clientIp: string,
    userEmail?: string
  ): { token: string; expiresAt: number; watermarkId: string; watermarkText: string } {
    const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const watermarkId = this.generateSteganographicWatermarkId(userId, bookId);

    const payload: StreamingTokenPayload = {
      userId,
      bookId,
      clientIp: this.normalizeIp(clientIp),
      userEmail,
      expiresAt,
      watermarkId,
    };

    const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = this.sign(serialized);
    const token = `${serialized}.${signature}`;

    const dateStr = new Date().toISOString().split("T")[0];
    const watermarkText = `Licensed to ${userEmail || userId} • Swathi ID: ${watermarkId} • ${dateStr}`;

    return {
      token,
      expiresAt,
      watermarkId,
      watermarkText,
    };
  }

  /**
   * Verifies an incoming streaming token against HMAC signature, expiration, and client IP.
   */
  verifyStreamingToken(token: string, clientIp: string): StreamingTokenPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

      const serialized = parts[0];
      const signature = parts[1];
      const expectedSignature = this.sign(serialized);

      // Constant-time comparison against timing attacks
      if (
        !crypto.timingSafeEqual(
          Buffer.from(signature, "utf8"),
          Buffer.from(expectedSignature, "utf8")
        )
      ) {
        return null;
      }

      const payload: StreamingTokenPayload = JSON.parse(
        Buffer.from(serialized, "base64url").toString("utf8")
      );

      // Verify expiration
      if (Math.floor(Date.now() / 1000) > payload.expiresAt) {
        return null;
      }

      // Verify client IP binding
      const normalizedReqIp = this.normalizeIp(clientIp);
      if (payload.clientIp && payload.clientIp !== normalizedReqIp && normalizedReqIp !== "127.0.0.1") {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Generates a deterministic invisible steganographic tracking ID (16 hex chars).
   */
  generateSteganographicWatermarkId(userId: string, bookId: string): string {
    return crypto
      .createHmac("sha256", DRM_SECRET)
      .update(`${userId}:${bookId}`)
      .digest("hex")
      .slice(0, 16)
      .toUpperCase();
  }

  /**
   * Logs a DRM security alert (unauthorized stream, replay, expired token).
   */
  async recordSecurityEvent(
    eventType:
      | "concurrent_limit_breach"
      | "invalid_token"
      | "expired_token"
      | "ip_mismatch"
      | "unauthorized_download_attempt"
      | "tampering_detected",
    ipAddress: string,
    userAgent: string,
    userId?: string,
    bookId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await DRMSecurityEvent.create({
        userId: userId && mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : undefined,
        eventType,
        bookId,
        ipAddress,
        userAgent,
        metadata,
      });
    } catch (e) {
      logger.warn("Failed to record DRM security event:", e);
    }
  }

  private sign(data: string): string {
    return crypto.createHmac("sha256", DRM_SECRET).update(data).digest("base64url");
  }

  private normalizeIp(ip: string): string {
    return ip.replace(/^.*:/, "").trim(); // Strips IPv6 prefixes (::ffff:)
  }
}

export const drmService = new DRMService();
