import { Router } from "express";
import { streamingController } from "../controllers/streamingController";
import { optimizationController } from "../controllers/optimizationController";
import { cacheController } from "../controllers/cacheController";
import { performanceController } from "../controllers/performanceController";

/**
 * @swagger
 * /api/v1/pdf/stream/{id}:
 *   get:
 *     summary: Stream PDF with HTTP Range support
 *     description: |
 *       Streams a PDF file with full HTTP Range Request (RFC 7233) support.
 *       - Returns 200 for full-file requests.
 *       - Returns 206 Partial Content for Range: bytes=X-Y requests.
 *       - Returns X-Cache: HIT/MISS header.
 *       - Returns X-PDF-Linearized: true/false header.
 *       - Optimized copy served when available (original untouched).
 *     tags: [PDF Streaming]
 */
import { optionalAuth, authenticate } from "../middleware/auth";
import { verifyDRMStreamingToken } from "../middleware/drmAuth";

const router = Router();

// ── Enterprise DRM & Secure Streaming ─────────────────────────────────
router.post("/drm/token", optionalAuth, streamingController.requestDRMToken.bind(streamingController));
router.post("/drm/rotate", streamingController.rotateDRMToken.bind(streamingController));
router.get("/drm/devices", authenticate, streamingController.listDevices.bind(streamingController));
router.delete("/drm/devices/:deviceId", authenticate, streamingController.deauthorizeDevice.bind(streamingController));

// ── Streaming ──────────────────────────────────────────────────────────
router.get("/stream/:id", optionalAuth, verifyDRMStreamingToken, streamingController.stream.bind(streamingController));
router.get("/range/:id", optionalAuth, verifyDRMStreamingToken, streamingController.rangeRequest.bind(streamingController));
router.get("/metadata/:id", streamingController.metadata.bind(streamingController));

// ── Cache ──────────────────────────────────────────────────────────────
router.get("/cache", cacheController.getStats.bind(cacheController));
router.post("/cache/warm/:id", cacheController.warm.bind(cacheController));
router.post("/cache/evict", cacheController.evict.bind(cacheController));

// ── Optimization ───────────────────────────────────────────────────────
router.post("/optimize", optimizationController.queueOptimization.bind(optimizationController));
router.get("/optimize/:id", optimizationController.getJobStatus.bind(optimizationController));

// ── Linearization ──────────────────────────────────────────────────────
router.get("/linearization/:id", optimizationController.getLinearizationStatus.bind(optimizationController));
router.post("/linearization/scan", optimizationController.queueLinearizationScan.bind(optimizationController));

// ── Preprocessing Pipeline ─────────────────────────────────────────────
router.post("/preprocessing/run", optimizationController.triggerPreprocessing.bind(optimizationController));

// ── Statistics & Performance ───────────────────────────────────────────
router.get("/statistics", performanceController.statistics.bind(performanceController));
router.get("/performance", performanceController.performance.bind(performanceController));
router.get("/health", performanceController.health.bind(performanceController));

export default router;
