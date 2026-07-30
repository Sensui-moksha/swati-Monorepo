import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { nlpController } from '../controllers/nlpController';

const router = Router();

/**
 * @swagger
 * /api/v1/nlp/summarize:
 *   post:
 *     summary: Generate an extractive summary using TextRank
 *     tags: [NLP]
 */
router.post('/summarize', authenticate, authorize('admin', 'editor'), nlpController.summarize.bind(nlpController));

/**
 * @swagger
 * /api/v1/nlp/keywords:
 *   post:
 *     summary: Extract keywords using TF-IDF
 *     tags: [NLP]
 */
router.post('/keywords', authenticate, authorize('admin', 'editor'), nlpController.extractKeywords.bind(nlpController));

/**
 * @swagger
 * /api/v1/nlp/ocr-check:
 *   post:
 *     summary: Check OCR for spelling errors
 *     tags: [NLP]
 */
router.post('/ocr-check', authenticate, authorize('admin', 'editor'), nlpController.checkOcr.bind(nlpController));

export default router;
