import { Request, Response, NextFunction } from 'express';
import { textRankService } from '../services/nlp/TextRankService';
import { spellCheckService } from '../services/nlp/SpellCheckService';
import { nlpService } from '../services/nlp/NlpService';

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
}

export const nlpController = new NlpController();
