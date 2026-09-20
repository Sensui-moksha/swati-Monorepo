import { Request, Response, NextFunction } from 'express';
import { textRankService } from '../services/nlp/TextRankService';
import { spellCheckService } from '../services/nlp/SpellCheckService';
import { nlpService } from '../services/nlp/NlpService';
import { ocrReviewService } from '../services/nlp/OCRReviewService';

export class NlpController {

  
  /**
   * Generates an extractive summary using TextRank
   */
  async summarize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, numSentences = 3 } = req.body;
      if (!text) {
        res.status(400).json({ success: false, message: 'Text is required' });
        return;
      }

      const summary = textRankService.summarize(text, Number(numSentences));
      res.json({ success: true, data: { summary } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates TF-IDF Keywords from text
   */
  async extractKeywords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, topN = 10 } = req.body;
      if (!text) {
        res.status(400).json({ success: false, message: 'Text is required' });
        return;
      }

      const keywords = nlpService.extractKeywords(text, Number(topN));
      res.json({ success: true, data: { keywords } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Checks OCR text for errors using Levenshtein distance and dictionaries
   */
  async checkOcr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ success: false, message: 'Text is required' });
        return;
      }

      const corrections = spellCheckService.checkOcr(text);
      res.json({ success: true, data: { corrections } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates or ingests an OCR review task
   */
  async createOcrTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId, documentType, pageNumber, extractedText, tokens } = req.body;
      if (!documentId || !documentType || !pageNumber || !extractedText) {
        res.status(400).json({
          success: false,
          message: "documentId, documentType, pageNumber, and extractedText are required",
        });
        return;
      }

      const task = await ocrReviewService.createTask({
        documentId,
        documentType,
        pageNumber: Number(pageNumber),
        extractedText,
        tokens,
      });

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists OCR tasks needing review
   */
  async getOcrReviewQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, documentId, maxConfidence, limit, offset } = req.query;
      const queue = await ocrReviewService.getReviewQueue(
        {
          status: status as any,
          documentId: documentId as string,
          maxConfidence: maxConfidence ? Number(maxConfidence) : undefined,
        },
        limit ? Number(limit) : 20,
        offset ? Number(offset) : 0
      );

      res.json({ success: true, data: queue });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Applies human corrections to an OCR task
   */
  async applyOcrCorrection(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const { corrections, status, notes } = req.body;
      const reviewerId = req.user?._id || "660000000000000000000001";

      if (!taskId || !corrections) {
        res.status(400).json({
          success: false,
          message: "taskId and corrections array are required",
        });
        return;
      }

      const updated = await ocrReviewService.applyCorrection({
        taskId,
        reviewerId: reviewerId.toString(),
        corrections,
        status,
        notes,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk approves OCR tasks
   */
  async bulkApproveOcr(req: any, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskIds } = req.body;
      const reviewerId = req.user?._id || "660000000000000000000001";

      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "taskIds must be a non-empty array",
        });
        return;
      }

      const result = await ocrReviewService.bulkApprove(taskIds, reviewerId.toString());
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const nlpController = new NlpController();

