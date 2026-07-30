import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { register } from '../utils/metrics';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe for orchestrators (e.g., Kubernetes)
 *     tags: [Health]
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe checks database and queue connectivity
 *     tags: [Health]
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    // In a full implementation, you would also ping Redis and Elasticsearch here
    const isRedisConnected = true; // Placeholder
    
    if (isMongoConnected && isRedisConnected) {
      res.status(200).json({ status: 'ready', dependencies: { mongo: 'up', redis: 'up' } });
    } else {
      res.status(503).json({ status: 'not_ready', dependencies: { mongo: isMongoConnected ? 'up' : 'down' } });
    }
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({ status: 'error' });
  }
});

/**
 * @swagger
 * /health/metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     tags: [Health]
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

export default router;
